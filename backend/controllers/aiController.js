import OpenAI from 'openai';
import dotenv from 'dotenv';
import { generateExplainPrompt, generateRoadmapPrompt, generateSystemTutorPrompt } from '../utils/prompts.js';
import asyncHandler from '../middleware/asyncHandler.js';

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// @desc    Explain any tech topic
// @route   POST /api/ai/explain
// @access  Public
export const explainTopic = asyncHandler(async (req, res, next) => {
    const { topic } = req.body;

    if (!topic) {
        res.status(400);
        throw new Error('Please provide a topic to explain');
    }

    const prompt = generateExplainPrompt(topic);

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // Cost-effective model
            messages: [{ role: "user", content: prompt }],
            max_tokens: 500,
        });

        res.json({
            success: true,
            data: response.choices[0].message.content,
        });
    } catch (error) {
        if(error.status === 401) {
             res.status(500);
             throw new Error("OpenAI API Key is missing or invalid. Please check your .env");
        }
        throw error;
    }
});

// @desc    Generate personalized learning roadmap
// @route   POST /api/ai/roadmap
// @access  Public
export const generateRoadmap = asyncHandler(async (req, res, next) => {
    const { goal, currentLevel, availableTime, targetDuration } = req.body;

    if (!goal || !currentLevel || !availableTime || !targetDuration) {
        res.status(400);
        throw new Error('Please provide goal, currentLevel, availableTime, and targetDuration');
    }

    const prompt = generateRoadmapPrompt(goal, currentLevel, availableTime, targetDuration);

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
    });

    res.json({
        success: true,
        data: response.choices[0].message.content,
    });
});

// @desc    Chat with AI Tutor
// @route   POST /api/ai/chat
// @access  Public (Can be made Private later)
export const tutorChat = asyncHandler(async (req, res, next) => {
    const { message, historyContext = [] } = req.body;

    if (!message) {
        res.status(400);
        throw new Error('Message is required to chat');
    }

    // Map 'ai' role to 'assistant' for OpenAI compatibility
    const formattedHistory = historyContext.map(msg => ({
        role: msg.role === 'ai' ? 'assistant' : msg.role,
        content: msg.content
    }));

    // Build messages array
    const messages = [
        { role: "system", content: generateSystemTutorPrompt() },
        ...formattedHistory, // Optional: array of {role, content} blocks for memory
        { role: "user", content: message }
    ];

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        max_tokens: 600,
    });

    res.json({
        success: true,
        data: response.choices[0].message.content,
    });
});
