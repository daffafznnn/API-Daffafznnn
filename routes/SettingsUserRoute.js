import express from "express";
import {
  forgotPassword,
  changePassword,
  verifyCodeForgotPass,
  resendCode,
} from "../controllers/SettingsUserController.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.post("/api/v1/settings/forgot-password", forgotPassword);
router.post("/api/v1/settings/verify-code-forgot-pass", verifyCodeForgotPass);
router.post("/api/v1/settings/resend-code", resendCode);
router.post("/api/v1/settings/change-password", verifyUser, changePassword);

export default router;
  