import express from "express";
import {
  getQuestion,
  getQuestionById,
  createQuestion,
  answerQuestion,
} from "../controllers/QuestionController.js";
import { adminOnly, verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/question", getQuestion);
router.get("/question/:uuid", getQuestionById);
router.post("/question/create", createQuestion);
router.patch("/question/answer/:uuid", verifyUser, adminOnly, answerQuestion);

export default router;
