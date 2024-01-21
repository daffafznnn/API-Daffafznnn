import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import FileUpload from "express-fileupload";
import db from "./config/Database.js";
import UsersRoute from "./routes/UsersRoute.js";
import AuthRoute from "./routes/AuthRoute.js";
import QuestionRoute from "./routes/QuestionRoute.js";

dotenv.config();

const app = express();

try {
  await db.authenticate();
  console.log("Database Connected...");
} catch (error) {
  console.error("Error connecting to the database:", error);
}

// Dapat diaktifkan jika Anda ingin melakukan sinkronisasi database (harus hati-hati di lingkungan produksi)
// (async () => {
//   await db.sync();
//   console.log('Database synchronized...');
// })();

app.use(cors({
  origin: 'https://daffafznnn-new-portofolio.verc el.app',
  credentials: true,
}));

app.use(express.json());
app.use(FileUpload())
app.use(express.static("public"));
app.use(UsersRoute);
app.use(AuthRoute);
app.use(QuestionRoute);

const PORT = process.env.APP_PORT || 5000; 
app.listen(PORT, () => {
  console.log(`Server Up And Running on Port ${PORT}`);
});
