import Question from "../models/QuestionsModel.js";
// import { Op, fn, col } from "sequelize";

export const getQuestion = async (req, res) => {
  try {
    const response = await Question.findAll();
    res.status(200).json({
      msg: "Berhasil mengambil semua data pertanyaan",
      data: response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil data pertanyaan" });
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
        msg: `Berhasil mengambil data pertanyaan dari ${question.email}`,
        data: question,
      });
    } else {
      res.status(404).json({ error: "Pertanyaan tidak ditemukan" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil data pertanyaan" });
  }
};

export const createQuestion = async (req, res) => {
  const { email, name, question } = req.body;

  // Validasi bahwa semua properti tidak boleh kosong
  if (!email || !name || !question) {
    return res.status(400).json({ msg: "Semua kolom harus diisi!" });
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
      currentTime - lastQuestion.createdAt > 60 * 60 * 1000
    ) {
      // 1 jam
      await Question.create({ email, name, question, date, time });
      res.status(201).json({
        msg: "Pertanyaan berhasil dikirim, tunggu balasan melalui email Anda.",
      });
    } else {
      // Jika belum berlalu waktu yang ditentukan, tolak permintaan pengguna
      return res
        .status(429)
        .json({
          msg: "Anda telah membuat pertanyaan dalam satu jam terakhir. Silakan coba lagi nanti.",
        });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal membuat pertanyaan baru" });
  }
};

export const answerQuestion = async (req, res) => {
  const question = await Question.findOne({
    where: {
      uuid: req.params.uuid,
    },
  });

  const { answer } = req.body;
  try {
    await Question.update(
      {
        answer: answer,
      },
      {
        where: {
          id: question.id,
        },
      }
    );
    res.status(201).json({ msg: "pertanyaan berhasil dijawab" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal menjawab pertanyaan" });
  }
};
