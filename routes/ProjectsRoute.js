import express from 'express';

import { getAllProjects, getProjectsByUuid, addProjects, updateProjects, deleteProjects } from '../controllers/ProjectsController.js';
import { verifyUser } from '../middleware/AuthUser.js';

const router = express.Router();

router.get('/api/v1/projects', getAllProjects);
router.get('/api/v1/projects/:uuid', getProjectsByUuid);
router.post('/api/v1/projects/add', verifyUser, addProjects);
router.put('/api/v1/projects/update/:uuid', verifyUser, updateProjects);
router.delete("/api/v1/projects/delete/:uuid", verifyUser, deleteProjects);

export default router;
