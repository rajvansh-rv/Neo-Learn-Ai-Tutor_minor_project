import express from 'express';
import {
    addProgress,
    getProgress,
    updateProgress,
    deleteProgress,
    getProgressSummary
} from '../controllers/progressController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, addProgress);

router.route('/:userId')
    .get(protect, getProgress);

router.route('/:progressId')
    .put(protect, updateProgress)
    .delete(protect, deleteProgress);

router.route('/summary/:userId')
    .get(protect, getProgressSummary);

export default router;
