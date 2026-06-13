import mongoose from 'mongoose';

const pdfDocumentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Allow guests to upload as well, or we can make it required depending on auth
    },
    guestId: {
        type: String,
        required: false
    },
    filename: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const PDFDocument = mongoose.model('PDFDocument', pdfDocumentSchema);
export default PDFDocument;
