import express from 'express';
import { getInternships } from '../controllers/internshipController.js';
import { optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', optionalProtect, getInternships);

export default router;
