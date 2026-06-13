import express from 'express';
import { explainTopic, generateRoadmap, tutorChat } from '../controllers/aiController.js';

const router = express.Router();

router.post('/explain', explainTopic);
router.post('/roadmap', generateRoadmap);
router.post('/chat', tutorChat);

export default router;
