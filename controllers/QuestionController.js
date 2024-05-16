import Question from "../models/QuestionsModel.js";
import nodemailer from "nodemailer";

export const getQuestion = async (req, res) => {
  try {
    const response = await Question.findAll();
    res.status(200).json({
      msg: "Successfully retrieve all question data",
      data: response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error occurred" });
  }
};

export const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findOne({
      where: {
        uuid: req.params.uuid,
      },
    });
    if (question) {
      res.status(200).json({
        msg: `Successfully retrieved question data from ${question.email}`,
        data: question,
      });
    } else {
      res.status(404).json({ error: "Question not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error occurred" });
  }
};

export const createQuestion = async (req, res) => {
  const { email, name, question } = req.body;

  // Validasi bahwa semua properti tidak boleh kosong
  if (!email || !name || !question) {
    return res.status(400).json({ msg: "All fields are required!" });
  }

  try {
    const currentTime = new Date(); // Mengambil tanggal dan waktu saat ini

    // Mengambil tanggal dalam format yyyy-mm-dd
    const date = currentTime.toISOString().split("T")[0];

    // Mengambil waktu dalam format hh:mm:ss
    const time = currentTime.toTimeString().split(" ")[0];

    // Mencari pertanyaan terakhir dari pengguna dengan email yang sama
    const lastQuestion = await Question.findOne({
      where: {
        email,
      },
      order: [["createdAt", "DESC"]],
    });

    // Jika pengguna belum pernah membuat pertanyaan sebelumnya, atau waktu yang ditentukan telah berlalu,
    // izinkan mereka membuat pertanyaan
    if (
      !lastQuestion ||
      currentTime - lastQuestion.createdAt > 30 * 60 * 1000
    ) {
      // 1 jam
      await Question.create({ email, name, question, date, time });
      res.status(201).json({
        msg: "Enquiry successfully submitted, expect a reply via your email.",
      });
    } else {
      // Jika belum berlalu waktu yang ditentukan, tolak permintaan pengguna
      return res.status(429).json({
        msg: "You have made a question in the last 30 minutes. Please try again later.",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create a new question" });
  }
};

const sendEmailforAnswer = async (question, answer) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: question.email,
      subject: `Hai! ${question.name} Jawaban atas Pertanyaan Anda🎈`,
      html: `
       <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jawaban atas Pertanyaan Anda</title>
    <style>
        /* Global Reset */
        body, html {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            color: #333;
        }

        /* Container */
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        /* Header */
        .header {
            text-align: center;
            margin-bottom: 20px;
            background-color: #007bff;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            color: #fff;
        }

        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
        }

        .header img {
            max-width: 150px;
            border-radius: 50%;
            border: 3px solid #fff;
        }

        /* Content */
        .content {
            padding: 20px;
            background-color: #f1f1f1;
            border-radius: 0 0 10px 10px;
        }

        .question-container {
            background-color: #343a40;
            color: #fff;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
        }

        .question-icon {
            font-size: 24px;
            margin-right: 10px;
        }

        .answer-container {
            background-color: #007bff;
            color: #fff;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
        }

        /* Social Icons */
        .social-icons {
            text-align: center;
            margin-top: 20px;
        }

        .social-icons a {
            display: inline-block;
            margin: 0 10px;
        }

        .social-icons img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            transition: transform 0.3s ease;
        }

        .social-icons img:hover {
            transform: scale(1.2);
        }

        /* Footer */
        .footer {
            text-align: center;
            font-size: 14px;
            color: #777;
            margin-top: 30px;
        }

        .footer a {
            color: #777;
            text-decoration: none;
            transition: color 0.3s ease;
        }

        .footer a:hover {
            color: #333;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <img src="https://i.ibb.co/qy4KzCS/logo-new-daffa-black-removebg-preview.png" alt="Header Logo">
            <h1>Selamat! Anda mendapat jawaban atas pertanyaan Anda.</h1>
        </div>

        <!-- Content -->
        <div class="content">
            <!-- Pertanyaan -->
            <div class="question-container">
                <h2><span class="question-icon">&#8226;</span> Pertanyaan Anda:</h2>
                <p>${question.question}</p>
            </div>

            <!-- Jawaban -->
            <div class="answer-container">
                <h2><span class="question-icon">&#8226;</span> Jawaban:</h2>
                <p>${answer}</p>
            </div>
        </div>

        <!-- Social Icons -->
        <div class="social-icons">
            <a href="https://www.linkedin.com/in/muhammad-daffa-fauzan-b0219a2a1/" target="_blank"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/600px-LinkedIn_logo_initials.png" alt="LinkedIn"></a>
            <a href="https://www.instagram.com/daffafauzan04_" target="_blank"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/600px-Instagram_icon.png" alt="Instagram"></a>
            <a href="https://github.com/muhammaddaffafauzan" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/25/25231.png" alt="GitHub"></a>
            <a href="https://wa.me/62895387417000" target="_blank"><img src="https://seeklogo.com/images/W/whatsapp-logo-33F6A82887-seeklogo.com.png" alt="WhatsApp"></a>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Hubungi Saya:</p>
            <p>LinkedIn | Instagram | GitHub | WhatsApp</p>
            <p>&copy; ${new Date().getFullYear()} daffafznnn. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    console.error(error);
  }
};

export const answerQuestion = async (req, res) => {
  try {
    const { answer } = req.body;

    // Pastikan answer tidak kosong
    if (!answer || answer.trim() === "") {
      return res.status(400).json({ msg: "Answers cannot be blank" });
    }

    // Cari pertanyaan berdasarkan UUID
    const question = await Question.findOne({
      where: {
        uuid: req.params.uuid,
      },
    });

    // Jika pertanyaan tidak ditemukan, kirim respons 404
    if (!question) {
      return res.status(404).json({ msg: "Question not found" });
    }

    // Jika status pertanyaan adalah "missed", kirim respons 403
    if (question.status === "missed") {
      return res
        .status(403)
        .json({ msg: "The question can no longer be answered" });
    }

    // Update status pertanyaan menjadi "missed"
    await question.update({
      status: "missed",
      answer: answer
    });

    // Kirim email dengan jawaban
    await sendEmailforAnswer(question, answer);

    // Kirim respons berhasil
    return res.status(200).json({
      msg: `Successfully answered a question from ${question.email}`,
    });
  } catch (error) {
    // Tangani kesalahan dan kirim respons 500
    console.error(error);
    return res.status(500).json({ msg: "Server error occurred" });
  }
};

export const changeStatusQuestion = async (req, res) => {
  try {
    const { status } = req.body;

    // Pastikan status tidak kosong
    if (!status || status.trim() === "") {
      return res.status(400).json({ msg: "Status cannot be empty" });
    }

    // Definisikan kondisi status yang valid
    const validStatus = ["read", "denied"];

    // Periksa apakah status yang diberikan valid
    if (!validStatus.includes(status)) {
      return res
        .status(400)
        .json({ msg: "Status must be either 'read' or 'denied'" });
    }

    // Lakukan proses pembaruan status pada pertanyaan
    // Misalnya, dapat menggunakan kode berikut:
    const question = await Question.findOne({
      where: { uuid: req.params.uuid },
    });
    if (!question) {
      return res.status(404).json({ msg: "Question not found" });
    }

    // Cek apakah status pertanyaan saat ini adalah 'missed'
    if (question.status === "missed") {
      return res.status(403).json({
        msg: "Cannot change the status of a question that has been answered",
      });
    }

    // Update status jika tidak 'missed'
    await question.update({ status });

    // Kirim respons berhasil
    return res
      .status(200)
      .json({ msg: "Question status updated successfully" });
  } catch (error) {
    // Tangani kesalahan dan kirim respons 500
    console.error(error);
    return res.status(500).json({ msg: "Server error occurred" });
  }
};


export const deleteQuestion = async (req, res) => {
  try {
    
    const question = await Question.findOne({
      where: {
        uuid: req.params.uuid
      }
    });

    if (!question) {
      res.status(404).json({ msg: "Question not found" }); 
      }

    await Question.destroy({
      where: {
        id: question.id
      }
    });

    res.status(200).json({
      msg: `Questions from ${question.email} have been deleted`,
    });

  } catch (error) {
    res.status(500).json({ msg: "Server error occurred" });
    console.log(error)
  }
};