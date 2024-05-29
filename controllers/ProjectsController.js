import Categories_Project from "../models/Categories_projectsModel.js";
import Project from "../models/ProjectsModel.js";
import AWS from "aws-sdk";

export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [
        {
          model: Categories_Project,
          as: "category", // Pastikan alias sesuai dengan yang didefinisikan dalam model
          attributes: [["name", "category"]], // Menggunakan alias untuk 'name' sebagai 'category'
        },
      ],
      order: [["createdAt", "DESC"]], // Ubah 'createdAt' dengan kolom yang relevan jika berbeda
    });

    // Transformasi data untuk menyederhanakan struktur JSON
    const transformedProjects = projects.map((project) => {
      const projectData = project.get({ plain: true });
      return {
        ...projectData,
        category: projectData.category ? projectData.category.category : null,
      };
    });

    res.status(200).json({
      msg: "Successfully get all project data with categories",
      data: transformedProjects,
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
    const {
      title,
      description,
      technologiesUsed,
      githubUrl,
      websiteUrl,
      progress,
      status,
      categoryId
    } = req.body;

    const inputFile = req.files && req.files.inputFile;

    // Ensure all required properties are present
    if (!title || !inputFile) {
      return res
        .status(400)
        .json({ msg: "Title and file, must be included" });
    }

    // Validate image file size and type
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

    // Prepare data for upload to S3
    const params = {
      Bucket: "abcdefvck", // Bucket name
      Key: `${Date.now()}-${inputFile.name}`, // Unique file name
      Body: inputFile.data, // File content
      ACL: "public-read", // File access permission
      ContentType: inputFile.mimetype, // File content type
    };

    // Upload file to S3
    const data = await s3.upload(params).promise();

    // Save project data to the database
    const project = await Project.create({
      title,
      description,
      technologiesUsed,
      githubUrl,
      websiteUrl,
      progress: progress || 0, // Default progress to 0 if not provided
      status: status || "Pending", // Default status to "Pending" if not provided
      date: new Date(), // Automatically set the current date
      image: data.Key, // File name in S3
      url: data.Location, // URL of the file in S3
      categoryId, // Include categoryId in the creation
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
    const {
      title,
      description,
      technologiesUsed,
      githubUrl,
      websiteUrl,
      progress,
      status,
      categoryId,
    } = req.body;
    const { uuid } = req.params;

    // Check if the project with the given UUID exists in the database
    const project = await Project.findOne({
      where: { uuid },
    });

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    // If a file is uploaded with key 'InputFile'
    if (req.files && req.files.InputFile) {
      const file = req.files.InputFile;

      // Validate image file size and type
      if (file.size > 1 * 1024 * 1024) {
        // 1MB
        return res
          .status(400)
          .json({ msg: "File size is too large. 1MB maximum" });
      }
      if (!["image/jpeg", "image/png"].includes(file.mimetype)) {
        return res.status(400).json({
          msg: "The file format is not supported. Use JPG or PNG format",
        });
      }

      // Delete the old image file from S3
      const oldImageKey = project.image;
      if (oldImageKey) {
        await s3
          .deleteObject({
            Bucket: "abcdefvck",
            Key: oldImageKey,
          })
          .promise();
      }

      // Prepare data for upload to S3
      const params = {
        Bucket: "abcdefvck", // Bucket name
        Key: `${Date.now()}-${file.originalname}`, // Unique file name
        Body: file.data, // File content
        ACL: "public-read", // File access permission
        ContentType: file.mimetype, // File content type
      };

      // Upload file to S3
      const data = await s3.upload(params).promise();

      // Update project with new data including image
      await project.update({
        title,
        description,
        technologiesUsed,
        githubUrl,
        websiteUrl,
        progress: progress !== undefined ? progress : project.progress, // Update if provided        status: status || project.status, // Update if provided
        image: data.Key, // File name in S3
        url: data.Location, // URL of the file in S3
        categoryId, // Include categoryId in the update
      });
    } else {
      // If no file is uploaded, only update project data
      await project.update({
        title,
        description,
        technologiesUsed,
        githubUrl,
        websiteUrl,
        progress: progress !== undefined ? progress : project.progress, // Update if provided
        status: status || project.status, // Update if provided
        categoryId, // Include categoryId in the update
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
          Bucket: "abcdefvck",
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