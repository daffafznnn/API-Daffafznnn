import User from "../models/UsersModel.js";
import bcryptjs from "bcryptjs";

export const getUsers = async (req, res) => {
  try {
    const response = await User.findAll({
      attributes: ["id", "username", "email",],
    });
    res.status(200).json({
      msg: "Berhasil mengambil semua data pengguna",
      data: response
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
export const getUsersById = async (req, res) => {
  try {
    const response = await User.findOne({
      attributes: ["id", "username", "email"],
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({
      msg: `Berhasil mengambil data ${response.username}`,
      data: response,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createUsers = async (req, res) => {
  const { username, email, password, confPassword } = req.body;

  if (!password) {
    return res.status(400).json({ msg: "Password tidak boleh kosong" });
  }

  const existingUser = await User.findOne({ where: { email: email } });
  if (existingUser) {
    return res
      .status(400)
      .json({
        msg: "Email sudah tersedia di sistem, harap gunakan email lain",
      });
  }

  if (password !== confPassword) {
    return res
      .status(400)
      .json({ msg: "Password dan konfirmasi password tidak cocok" });
  }

  const salt = await bcryptjs.genSalt();
  const hashedPassword = await bcryptjs.hash(password, salt);

  try {
    const newUser = await User.create({
      username: username,
      email: email,
      password: hashedPassword,
    });

    newUser.password = undefined;

    return res.status(201).json({
      msg: "Berhasil membuat akun",
      data: newUser,
    });
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};

export const updateUsers = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!user) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    const { username, email, password, confPassword, role } = req.body;
    let updateFields = {};

    if (password !== confPassword) {
      return res
        .status(400)
        .json({ msg: "Password dan konfirmasi password tidak cocok" });
    }

    // Menentukan apakah properti-propterti opsional ada sebelum menambahkannya ke updateFields
    if (username !== undefined) updateFields.username = username;
    if (email !== undefined) updateFields.email = email;
    if (role !== undefined) updateFields.role = role;

    // Jika password dan confPassword ada dan sama, update password
    if (password && confPassword && password === confPassword) {
      const salt = await bcryptjs.genSalt();
      updateFields.password = await bcryptjs.hash(password, salt);
    }

    await User.update(updateFields, {
      where: {
        id: user.id,
      },
    });

    res.status(200).json({ msg: "User berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};


export const deleteUsers = async (req, res) => {
  const user = await User.findOne({
    where: {
      id: req.params.id,
    },
  });
  if (!user) return res.status(404).json({ msg: "user tidak ditemukan" });
  try {
    await User.destroy({
      where: {
        id: user.id,
      },
    });
    res.status(200).json({ msg: "User terhapus" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
