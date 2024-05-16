import Project from "../models/ProjectsModel.js";
import AWS from "aws-sdk";
import fs from "fs";
// import path from "path";

export const getAllProjects = async (req, res) => {
  try {
    const project = await Project.findAll();
    res.status(200).json({
      msg: "Successfully retrieve all project data",
      data: project,
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error occurred" });
    console.log(error);
  }
};

export const getProjectsByUuid = async (req, res) => {
  try {
    const project = await Project.findOne({
      where: {
        uuid: req.params.uuid,
      },
    });

    if (!project) {
      res.status(404).json({ msg: "Project not found" });
    }

    res.status(200).json({
      msg: `Successfully retrieved project data ${project.title}`,
      data: project,
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error occurred" });
    console.log(error);
  }
};

// Konfigurasi AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.CELLAR_ADDON_KEY_ID,
  secretAccessKey: process.env.CELLAR_ADDON_KEY_SECRET,
  endpoint: process.env.CELLAR_ADDON_HOST,
});

export const addProjects = async (req, res) => {
  try {
    const { title, description, technologiesUsed, githubUrl, websiteUrl } =
      req.body;
    const inputFile = req.files && req.files.inputFile;

    // Pastikan semua properti yang diperlukan ada
    if (!title || !inputFile) {
      return res
        .status(400)
        .json({ msg: "Title and image file must be included" });
    }

    // Validasi ukuran dan tipe file gambar
    if (inputFile.size > 1 * 1024 * 1024) {
      // 1MB
      return res
        .status(400)
        .json({ msg: "File size is too large. 1MB maximum" });
    }
    if (
      !["image/jpeg", "image/png", "image/jpg"].includes(inputFile.mimetype)
    ) {
      return res.status(400).json({
        msg: "The file format is not supported. Use JPG or PNG format",
      });
    }

    // Menyiapkan data untuk diunggah ke S3
    const params = {
      Bucket: "mystorage", // Nama bucket
      Key: `${Date.now()}-${inputFile.name}`, // Nama file unik
      Body: inputFile.data, // Konten file
      ACL: "public-read", // Izin akses file
      ContentType: inputFile.mimetype, // Tipe konten file
    };

    // Melakukan pengunggahan file ke S3
    const data = await s3.upload(params).promise();

    // Menyimpan data proyek ke basis data
    const project = await Project.create({
      title,
      description,
      technologiesUsed,
      githubUrl,
      websiteUrl,
      image: data.Key, // Nama file di S3
      url: data.Location, // URL file di S3
    });

    res.status(201).json({
      msg: "Project added successfully",
      data: project,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error occurred" });
  }
};

export const updateProjects = async (req, res) => {
  try {
    const { title, description, technologiesUsed, githubUrl, websiteUrl } =
      req.body;
    const { uuid } = req.params;

    // Periksa apakah proyek dengan UUID tertentu ada dalam database
    const project = await Project.findOne({
      where: {
        uuid,
      },
    });

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    // Jika ada file yang diunggah dengan key 'InputFile'
    if (req.files && req.files.InputFile) {
      const file = req.files.InputFile;

      // Validasi ukuran dan tipe file gambar
      if (file.size > 1 * 1024 * 1024) {
        // 1MB
        return res
          .status(400)
          .json({ msg: "File size is too large. 1MB maximum" });
      }
      if (!["image/jpeg", "image/png"].includes(file.mimetype)) {
        return res
          .status(400)
          .json({
            msg: "The file format is not supported. Use JPG or PNG format",
          });
      }

      // Menghapus file gambar yang lama di S3
      const oldImageKey = project.image;
      if (oldImageKey) {
        await s3
          .deleteObject({
            Bucket: "mystorage",
            Key: oldImageKey,
          })
          .promise();
      }

      // Menyiapkan data untuk diunggah ke S3
      const params = {
        Bucket: "mystorage", // Nama bucket
        Key: `${Date.now()}-${file.originalname}`, // Nama file unik
        Body: fs.createReadStream(file.path), // Konten file
        ACL: "public-read", // Izin akses file
        ContentType: file.mimetype, // Tipe konten file
      };

      // Melakukan pengunggahan file ke S3
      const data = await s3.upload(params).promise();

      // Hapus file yang diunggah dari server lokal
      fs.unlinkSync(file.path);

      // Update proyek dengan data baru termasuk gambar
      await project.update({
        title,
        description,
        technologiesUsed,
        githubUrl,
        websiteUrl,
        image: data.Key, // Nama file di S3
        url: data.Location, // URL file di S3
      });
    } else {
      // Jika tidak ada file yang diunggah, hanya update data proyek
      await project.update({
        title,
        description,
        technologiesUsed,
        githubUrl,
        websiteUrl,
      });
    }

    res.status(200).json({ msg: "Project updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error occurred" });
  }
};

export const deleteProjects = async (req, res) => {
  try {
    const { uuid } = req.params;

    // Periksa apakah proyek dengan UUID tertentu ada dalam database
    const project = await Project.findOne({
      where: {
        uuid,
      },
    });

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    // Hapus file gambar di S3 jika ada
    const imageKey = project.image;
    if (imageKey) {
      await s3
        .deleteObject({
          Bucket: "mystorage",
          Key: imageKey,
        })
        .promise();
    }

    // Hapus proyek dari database
    await project.destroy();

    res.status(200).json({ msg: "Project successfully deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error occurred" });
  }
};