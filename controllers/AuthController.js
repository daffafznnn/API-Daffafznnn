import User from "../models/UsersModel.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";

// Fungsi untuk menghasilkan token akses dan refresh token
const generateTokens = (user) => {
  // Membuat token akses dengan waktu kadaluarsa 1 hari
  const accessToken = jwt.sign(
    { userId: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  // Membuat refresh token dengan waktu kadaluarsa 7 hari
  const refreshToken = jwt.sign(
    { userId: user.id, username: user.username, email: user.email },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

// Controller untuk login pengguna
export const Login = async (req, res) => {
  try {
    // Cari pengguna berdasarkan email atau username
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: req.body.identifier },
          { username: req.body.identifier },
        ],
      },
    });

    // Jika pengguna tidak ditemukan, kirim respons 404
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Memeriksa apakah password yang dimasukkan cocok dengan password pengguna
    const match = await bcryptjs.compare(req.body.password, user.password);

    // Jika password tidak cocok, kirim respons 400
    if (!match) return res.status(400).json({ msg: "Wrong password " });

    // Jika otentikasi berhasil, buat token akses dan refresh token
    const { accessToken, refreshToken } = generateTokens(user);

    // Simpan refresh token di database
    user.refreshToken = refreshToken;
    await user.save();

    // Menghapus password dan refresh token dari respons untuk keamanan
    user.password = undefined;
    user.refreshToken = undefined;

    // Mengirim respons dengan token akses dan refresh token
    res.status(200).json({
      msg: "Login successful",
      data: user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    // Menangani kesalahan server dan mengirim respons 500
    console.error(error);
    res.status(500).json({ msg: "Server error occurred" });
  }
};

// Controller untuk mendapatkan data pengguna yang sedang login
export const Me = async (req, res) => {
  try {
    // Mendapatkan token akses dari header permintaan
    const token = req.headers.authorization.split(" ")[1];

    // Verifikasi token akses
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Periksa apakah token masih valid
    const currentTime = new Date().getTime();
    if (decodedToken.exp * 1000 < currentTime) {
      return res.status(403).json({ msg: "Token expired" });
    }

    // Dapatkan informasi pengguna berdasarkan id pengguna dari token
    const user = await User.findOne({
      attributes: ["id", "username", "email"],
      where: {
        id: decodedToken.userId,
      },
    });

    // Mengirim respons dengan data pengguna
    res.status(200).json({
      msg: "Successfully get your account data",
      data: user,
    });
  } catch (error) {
    // Menangani kesalahan server dan mengirim respons 500
    console.error(error);
    res.status(500).json({ msg: "Server error occurred" });
  }
};