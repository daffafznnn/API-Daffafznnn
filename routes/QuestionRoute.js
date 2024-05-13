import express from "express";
import {
  getQuestion,
  getQuestionById,
  createQuestion,
  answerQuestion,
  deleteQuestion,
  changeStatusQuestion,
} from "../controllers/QuestionController.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/api/v1/question", getQuestion);
router.get("/api/v1/question/:uuid", getQuestionById);
router.post("/api/v1/question/send", createQuestion);
router.delete("/api/v1/question/delete/:uuid", verifyUser, deleteQuestion);
router.post("/api/v1/question/answer/:uuid", verifyUser, answerQuestion);
router.put("/api/v1/question/change-status/:uuid", verifyUser, changeStatusQuestion);

export default router;
