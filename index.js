import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import fileUpload from "express-fileupload";
import db from "./config/Database.js";
import UsersRoute from "./routes/UsersRoute.js";
import AuthRoute from "./routes/AuthRoute.js";
import QuestionRoute from "./routes/QuestionRoute.js";
import ProjectsRoute from "./routes/ProjectsRoute.js";
import SettingsUserRoute from "./routes/SettingsUserRoute.js";
import CategoriesProjectsRoute from "./routes/CategoriesProjectsRoute.js";

dotenv.config();

// (async()=>{
//     await db.sync();
// })()

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(fileUpload());
app.use(UsersRoute);
app.use(AuthRoute);
app.use(QuestionRoute);
app.use(SettingsUserRoute);
app.use(CategoriesProjectsRoute);
app.use(ProjectsRoute);

const PORT = process.env.APP_PORT || 8080;

app.listen(PORT, async () => {
  console.log(`Server Up And Running on Port ${PORT}`);

  try {
    await db.authenticate();
    console.log("Database Connected...");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
});