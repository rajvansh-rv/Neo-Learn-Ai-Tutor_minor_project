import express from 'express';
import multer from 'multer';
import { uploadPDFController } from '../controllers/pdfController.js';
import { optionalProtect } from '../middleware/authMiddleware.js';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const router = express.Router();

router.post('/upload', optionalProtect, upload.single('pdf'), uploadPDFController);

export default router;
