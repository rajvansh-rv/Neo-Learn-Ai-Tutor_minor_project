import express from 'express';
import multer from 'multer';
import { analyzeResume } from '../controllers/atsController.js';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

import { optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/analyze', optionalProtect, upload.single('resume'), analyzeResume);

export default router;
