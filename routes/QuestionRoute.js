import express from "express";
import {
  getQuestion,
  getQuestionById,
  createQuestion,
} from "../controllers/QuestionController.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/api/v1/question", getQuestion);
router.get("/api/v1/question/:uuid", getQuestionById);
router.post("/api/v1/question/send", createQuestion);
// router.patch("/question/answer/:uuid", verifyUser, answerQuestion);

export default router;
