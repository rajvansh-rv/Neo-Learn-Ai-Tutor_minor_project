import express from 'express';
import {
    getUserProfile,
    getUserChats,
    getUserATSReports,
    getUserInternshipSearches
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.get('/chats', protect, getUserChats);
router.get('/ats', protect, getUserATSReports);
router.get('/internships', protect, getUserInternshipSearches);

export default router;
