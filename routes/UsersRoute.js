import express from "express";
import {
  getUsers,
  getUsersById,
  createUsers,
  updateUsers,
  deleteUsers,
} from "../controllers/UsersController.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();
router.get("/api/v1/users", getUsers);
router.get("/api/v1/users/:id", getUsersById);
router.post("/api/v1/users/add", verifyUser, createUsers);
router.put("/api/v1/users/update/:id",  verifyUser, updateUsers);
router.delete("/api/v1/users/delete/:id",  verifyUser, deleteUsers);

export default router;