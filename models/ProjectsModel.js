import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Project = db.define(
  "projects",
  {
    uuid: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    technologiesUsed: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    githubUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    websiteUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Pending", "Scheduled", "Active", "Completed"),
      allowNull: false,
      defaultValue: "Pending",
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    progress: {
      type: DataTypes.INTEGER, // Alternatively, you could use FLOAT if you need decimal precision
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
  },
  {
    freezeTableName: true,
  }
);

export default Project;