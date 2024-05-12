import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/Database.js";
import UsersRoute from "./routes/UsersRoute.js";
import AuthRoute from "./routes/AuthRoute.js";
import QuestionRoute from "./routes/QuestionRoute.js";

dotenv.config();

const app = express();

// (async () => {
//   try {
//     await db.sync({ force: false });
//     console.log("Database synchronized...");
//   } catch (error) {
//     console.error("Error syncing database:", error);
//   }
// })();

// Middleware untuk mengizinkan akses lintas domain (CORS)
app.use(
  cors({
    origin: "*", // Sesuaikan dengan URL aplikasi Anda jika memungkinkan
    credentials: true,
  })
);

// Middleware untuk menguraikan body permintaan sebagai JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Menggunakan routing untuk rute pengguna, otentikasi, dan pertanyaan
app.use(UsersRoute);
app.use(AuthRoute);
app.use(QuestionRoute);

// Menentukan port server
const PORT = process.env.APP_PORT || 5000;

// Memulai server dan mencetak pesan ke konsol
app.listen(PORT, async () => {
  console.log(`Server Up And Running on Port ${PORT}`);

  try {
    // Menghubungkan ke database dan mencetak pesan ke konsol jika berhasil
    await db.authenticate();
    console.log("Database Connected...");
  } catch (error) {
    // Menangani kesalahan saat menghubungkan ke database dan mencetak pesan ke konsol
    console.error("Error connecting to the database:", error);
  }
});