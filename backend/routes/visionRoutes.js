import express from 'express';
import multer from 'multer';
import { chatWithImage, chatWithMultipleImages } from '../controllers/visionController.js';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post('/', upload.single('file'), chatWithImage);
router.post('/multi', express.json({ limit: '50mb' }), chatWithMultipleImages);

export default router;
