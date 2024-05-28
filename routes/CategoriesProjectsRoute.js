import express from "express";

import { getCategories, addCategories, updateCategories, deleteCategories } from "../controllers/CategoriesProjectsController.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get('/api/v1/categories', getCategories);
router.post('/api/v1/categories/add', verifyUser, addCategories);
router.put("/api/v1/categories/update/:id", verifyUser, updateCategories);
router.delete("/api/v1/categories/delete/:id", verifyUser, deleteCategories);

export default router;