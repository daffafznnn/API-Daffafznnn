import User from "../models/UsersModel.js";
import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";

const sendVerificationCode = async (user) => {
  // Menghasilkan kode verifikasi 6 digit
  const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Menghitung waktu kedaluwarsa
  const now = new Date();
  const verifyCodeExpire = new Date(now.getTime() + 5 * 60 * 1000); // 5 menit dari sekarang

  // Membentuk waktu kedaluwarsa dalam format waktu saja (HH:mm:ss)
  const verifyCodeExpireTime = verifyCodeExpire.toTimeString().split(" ")[0];

  await user.update({
    verifyCode,
    verifyCodeExpire: verifyCodeExpireTime,
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: user.email,
    subject: "Verifikasi Kode Anda",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; padding: 30px; background-color: #007bff; border-radius: 10px 10px 0 0; color: #fff;">
            <h1 style="font-size: 28px;">Kode Verifikasi Anda</h1>
          </div>
          <div style="padding: 20px; background-color: #fff; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px;">Halo,</p>
            <p style="font-size: 16px;">Berikut adalah kode verifikasi Anda:</p>
            <div style="background-color: #007bff; color: #fff; padding: 10px; border-radius: 5px; font-size: 24px; margin-top: 20px; margin-bottom: 20px;">${verifyCode}</div>
            <p style="font-size: 16px;">Kode ini akan kedaluwarsa dalam 5 menit.</p>
          </div>
        </div>
      </div>
    `,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        reject(error);
      } else {
        console.log("Email sent: " + info.response);
        resolve(info);
      }
    });
  });
};


export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({
        msg: "User not found",
      });
    }

    try {
      await sendVerificationCode(user);
    } catch (error) {
      return res.status(500).json({ msg: "Failed to send email." });
    }

    return res.status(200).json({ msg: "Verification code sent to email." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error occurred" });
  }
};

export const verifyCodeForgotPass = async (req, res) => {
  const { email, code, newPassword, confPassword } = req.body;

  try {
    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({
        msg: "User not found",
      });
    }

    if (user.verifyCode !== code) {
      return res.status(400).json({ msg: "Invalid verification code" });
    }

    const currentTime = new Date();
    const codeExpiryTime = new Date(user.verifyCodeExpire);

    if (currentTime > codeExpiryTime) {
      return res.status(400).json({ msg: "Verification code expired" });
    }

    if (newPassword !== confPassword) {
      return res
        .status(400)
        .json({ msg: "Password and confirmation password do not match" });
    }

    const salt = await bcryptjs.genSalt();
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    await user.update({
      password: hashedPassword,
      verifyCode: null,
      verifyCodeExpire: null,
    });

    res.status(200).json({ msg: "Password has been updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error occurred" });
  }
};


export const changePassword = async (req, res) => {
  const { oldPassword, newPassword, confNewPassword } = req.body;

  try {
    const user = await User.findOne({
      where: {
        email: req.email
      },
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const isMatch = await bcryptjs.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Old password is incorrect" });
    }

    if (newPassword !== confNewPassword) {
      return res
        .status(400)
        .json({ msg: "New password and confirmation password do not match" });
    }

    const salt = await bcryptjs.genSalt();
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    await user.update({
      password: hashedPassword,
    });

    return res
      .status(200)
      .json({ msg: "Password has been updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error occurred" });
  }
};