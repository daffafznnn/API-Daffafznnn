import User from "../models/UsersModel.js";
import bcryptjs from "bcryptjs";

export const getUsers = async (req, res) => {
  try {
    const response = await User.findAll({
      attributes: ["id", "username", "email"],
    });
    res.status(200).json({
      msg: "Successfully retrieved all users",
      data: response,
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
      msg: `Successfully retrieved data for ${response.username}`,
      data: response,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createUsers = async (req, res) => {
  const { username, email, password, confPassword } = req.body;

  if (!password) {
    return res.status(400).json({ msg: "Password cannot be empty" });
  }

  const existingUser = await User.findOne({ where: { email: email } });
  if (existingUser) {
    return res.status(400).json({
      msg: "Email is already in use, please use another email",
    });
  }

  if (password !== confPassword) {
    return res
      .status(400)
      .json({ msg: "Password and confirmation password do not match" });
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
      msg: "Account successfully created",
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
      return res.status(404).json({ msg: "User not found" });
    }

    const { username, email, password, confPassword, role } = req.body;
    let updateFields = {};

    if (password !== confPassword) {
      return res
        .status(400)
        .json({ msg: "Password and confirmation password do not match" });
    }

    // Add optional properties to updateFields if they exist
    if (username !== undefined) updateFields.username = username;
    if (email !== undefined) updateFields.email = email;
    if (role !== undefined) updateFields.role = role;

    // If password and confPassword are provided and match, update password
    if (password && confPassword && password === confPassword) {
      const salt = await bcryptjs.genSalt();
      updateFields.password = await bcryptjs.hash(password, salt);
    }

    await User.update(updateFields, {
      where: {
        id: user.id,
      },
    });

    res.status(200).json({ msg: "User successfully updated" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ msg: "Server error occurred" });
  }
};

export const deleteUsers = async (req, res) => {
  const user = await User.findOne({
    where: {
      id: req.params.id,
    },
  });
  if (!user) return res.status(404).json({ msg: "User not found" });
  try {
    await User.destroy({
      where: {
        id: user.id,
      },
    });
    res.status(200).json({ msg: "User deleted" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};