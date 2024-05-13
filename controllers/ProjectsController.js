import Project from "../models/ProjectsModel.js";
import AWS from "aws-sdk";
import fs from "fs";
// import path from "path";

export const getAllProjects = async (req, res) => {
  try {
    const project = await Project.findAll();
    res.status(200).json({
      msg: "Berhasil mengambil semua data proyek",
      data: project,
    });
  } catch (error) {
    res.status(500).json({ msg: "Terjadi kesalahan dari server" });
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
      res.status(404).json({ msg: "Proyek tidak ditemukan" });
    }

    res.status(200).json({
      msg: `Berhasil mengambil data proyek ${project.title}`,
      data: project,
    });
  } catch (error) {
    res.status(500).json({ msg: "Terjadi kesalahan dari server" });
    console.log(error);
  }
};

// Konfigurasi AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.CELLAR_ADDON_KEY_ID,
  secretAccessKey: process.env.CELLAR_ADDON_KEY_SECRET,
  endpoint: process.env.CELLAR_ADDON_HOS,
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
        .json({ msg: "Judul dan file gambar harus disertakan" });
    }

    // Validasi ukuran dan tipe file gambar
    if (inputFile.size > 1 * 1024 * 1024) {
      // 1MB
      return res
        .status(400)
        .json({ msg: "Ukuran file terlalu besar. Maksimal 1MB" });
    }
    if (!["image/jpeg", "image/png"].includes(inputFile.mimetype)) {
      return res.status(400).json({
        msg: "Format file tidak didukung. Gunakan format JPG atau PNG",
      });
    }

    // Menyiapkan data untuk diunggah ke S3
    const params = {
      Bucket: "projects", // Nama bucket
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
      msg: "Proyek berhasil ditambahkan",
      data: project,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan dari server" });
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
      return res.status(404).json({ msg: "Proyek tidak ditemukan" });
    }

    // Jika ada file yang diunggah
    if (req.file) {
      // Validasi ukuran dan tipe file gambar
      if (req.file.size > 1 * 1024 * 1024) {
        // 1MB
        return res
          .status(400)
          .json({ msg: "Ukuran file terlalu besar. Maksimal 1MB" });
      }
      if (!["image/jpeg", "image/png"].includes(req.file.mimetype)) {
        return res
          .status(400)
          .json({
            msg: "Format file tidak didukung. Gunakan format JPG atau PNG",
          });
      }

      // Menghapus file gambar yang lama di S3
      const oldImageKey = project.image;
      if (oldImageKey) {
        await s3
          .deleteObject({
            Bucket: "projects",
            Key: oldImageKey,
          })
          .promise();
      }

      // Menyiapkan data untuk diunggah ke S3
      const params = {
        Bucket: "projects", // Nama bucket
        Key: `${Date.now()}-${req.file.originalname}`, // Nama file unik
        Body: fs.createReadStream(req.file.path), // Konten file
        ACL: "public-read", // Izin akses file
        ContentType: req.file.mimetype, // Tipe konten file
      };

      // Melakukan pengunggahan file ke S3
      const data = await s3.upload(params).promise();

      // Hapus file yang diunggah dari server lokal
      fs.unlinkSync(req.file.path);

      // Update proyek dengan data baru
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

    res.status(200).json({ msg: "Proyek berhasil diperbarui" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan dari server" });
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
      return res.status(404).json({ msg: "Proyek tidak ditemukan" });
    }

    // Hapus file gambar di S3 jika ada
    const imageKey = project.image;
    if (imageKey) {
      await s3
        .deleteObject({
          Bucket: "projects",
          Key: imageKey,
        })
        .promise();
    }

    // Hapus proyek dari database
    await project.destroy();

    res.status(200).json({ msg: "Proyek berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan dari server" });
  }
};