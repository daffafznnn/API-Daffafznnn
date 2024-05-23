import User from "../models/UsersModel.js";
import jwt from "jsonwebtoken";

// Middleware untuk memverifikasi token akses
export const verifyUser = async (req, res, next) => {
  // Mengambil token dari header Authorization, jika ada
  const token = req.headers.authorization?.split(" ")[1];

  // Jika tidak ada token, kirim respons error 401 (Unauthorized)
  if (!token) {
    return res.status(401).json({ msg: "Tidak ada token, otentikasi gagal" });
  }

  // Memverifikasi token menggunakan JWT
  jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
    // Jika terjadi kesalahan pada verifikasi token, kirim respons error 403 (Forbidden)
    if (err) {
      return res.status(403).json({ msg: "Token tidak valid" });
    }

    try {
      // Mencari pengguna berdasarkan id yang terdapat dalam token
      const user = await User.findOne({ where: { id: decodedToken.userId } });

      // Jika pengguna tidak ditemukan, kirim respons error 404 (Not Found)
      if (!user) {
        return res.status(404).json({ msg: "User tidak ditemukan" });
      }

      // Menetapkan id pengguna ke dalam objek req untuk digunakan oleh handler rute selanjutnya
      req.userId = user.id;
      req.email = user.email

      // Melanjutkan ke handler rute selanjutnya
      next();
    } catch (error) {
      // Jika terjadi kesalahan server saat mencari pengguna, kirim respons error 500 (Internal Server Error)
      console.error(error);
      res.status(500).json({ msg: "Terjadi kesalahan server" });
    }
  });
};
