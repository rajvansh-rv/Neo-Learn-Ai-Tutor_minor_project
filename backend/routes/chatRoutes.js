import express from 'express';
import { saveChat, getAllChats, getOneChat, deleteChat, clearAllChats } from '../controllers/chatController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/save', optionalProtect, saveChat); 
router.get('/:userId', getAllChats);
router.get('/session/:id', getOneChat);

// Delete routes
router.delete('/:id', optionalProtect, deleteChat);
router.delete('/user/:userId', protect, clearAllChats);

export default router;
