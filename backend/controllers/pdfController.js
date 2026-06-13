import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import PDFDocument from '../models/PDFDocument.js';
import asyncHandler from '../middleware/asyncHandler.js';

export const uploadPDFController = asyncHandler(async (req, res, next) => {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No PDF file uploaded.' });
        }

        if (req.file.mimetype !== 'application/pdf') {
            return res.status(400).json({ success: false, message: 'Uploaded file is not a valid PDF.' });
        }

        // Parse PDF using pdf-parse from memory buffer
        const data = await pdf(req.file.buffer);
        const extractedText = data.text;

        if (!extractedText || extractedText.trim() === '') {
            return res.status(400).json({ success: false, message: 'Could not extract text from PDF or PDF is empty.' });
        }

        // Store PDF info in MongoDB
        const pdfDoc = new PDFDocument({
            userId: req.user ? req.user._id : null,
            filename: req.file.originalname,
        });
        await pdfDoc.save();

    res.json({
        success: true,
        text: extractedText,
        filename: req.file.originalname
    });
});
