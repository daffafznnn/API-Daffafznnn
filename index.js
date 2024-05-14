import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/Database.js";
import UsersRoute from "./routes/UsersRoute.js";
import AuthRoute from "./routes/AuthRoute.js";
import QuestionRoute from "./routes/QuestionRoute.js";
import ProjectsRoute from "./routes/ProjectsRoute.js";
import fileUpload from "express-fileupload";

dotenv.config();

// (async()=>{
//     await db.sync();
// })()

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(express.static("storage"));
app.use(UsersRoute);
app.use(AuthRoute);
app.use(QuestionRoute);
app.use(ProjectsRoute);

const PORT = process.env.APP_PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server Up And Running on Port ${PORT}`);

  try {
    await db.authenticate();
    console.log("Database Connected...");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
});
