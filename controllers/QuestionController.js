import Question from "../models/QuestionModel.js";

export const getQuestion = async (req, res) => {
  try {
    const response = await Question.findAll();
    res.status(200).json(response);
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
      res.status(200).json(question);
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
  try {
    await Question.create({ email, name, question });
    res
      .status(201)
      .json({
        msg: "pertanyaan berhasil dikirim, tunggu balasan melalui email anda",
      });
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
