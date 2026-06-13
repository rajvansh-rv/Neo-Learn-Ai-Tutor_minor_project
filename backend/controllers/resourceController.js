import Resource from '../models/Resource.js';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Pre-seed some default local static resources for demo purposes
const staticResources = [
    { title: 'JavaScript Crash Course', platform: 'YouTube', type: 'youtube', url: 'https://youtu.be/hdI2bqOjy3c', description: 'Beginner friendly intro to JS', topic: 'javascript' },
    { title: 'MDN Web Docs - JS', platform: 'MDN', type: 'website', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', description: 'Official Mozilla JS Documentation', topic: 'javascript' },
    { title: 'React Official Tutorial', platform: 'React Docs', type: 'website', url: 'https://react.dev/learn', description: 'Learn React fundamentals from the creators', topic: 'react' },
    { title: 'FreeCodeCamp Python', platform: 'YouTube', type: 'youtube', url: 'https://youtu.be/rfscVS0vtbw', description: 'Full course for beginners', topic: 'python' },
    { title: 'Data Structures and Algorithms (DSA)', platform: 'YouTube', type: 'youtube', url: 'https://youtu.be/8hly31xKli0', description: 'Complete DSA Course for interviews', topic: 'dsa' },
    { title: 'Binary Search Algorithm', platform: 'GeeksforGeeks', type: 'website', url: 'https://www.geeksforgeeks.org/binary-search/', description: 'Detailed article on Binary Search', topic: 'binary search' },
    { title: 'Machine Learning using Python', platform: 'YouTube', type: 'youtube', url: 'https://youtu.be/7eh4d6sabA0', description: 'Intro to Machine Learning', topic: 'machine learning' },
    { title: 'Tailwind CSS in 100 Seconds', platform: 'YouTube', type: 'youtube', url: 'https://youtu.be/mr15Xzb1Ook', description: 'Quick framework overview', topic: 'tailwind' }
];

// @desc    Get free resources for a given topic or message
// @route   GET /api/resources?message=...
// @access  Public
export const getResources = async (req, res, next) => {
    try {
        const { topic, message } = req.query;

        let queryTopic = topic ? topic.toLowerCase().trim() : '';

        // Extract topic from message using AI
        if (message && !queryTopic) {
            try {
                const response = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [{
                        role: "system",
                        content: "Extract the core 1-3 word educational, technical, or programming topic from the user's message. Output ONLY the raw keyword(s), nothing else. E.g., 'explain binary search' -> 'binary search'. 'how does react state work' -> 'react'."
                    }, { role: "user", content: message }],
                    max_tokens: 10,
                });
                queryTopic = response.choices[0].message.content.trim().toLowerCase();
            } catch (aiError) {
                console.error("AI Context extraction failed:", aiError.message);
                // Fallback to simple matching if API fails
                queryTopic = message.toLowerCase();
            }
        }

        if (queryTopic) {
            const matchedResources = staticResources.filter(r => 
                r.topic.toLowerCase().includes(queryTopic) || 
                queryTopic.includes(r.topic.toLowerCase()) || 
                r.title.toLowerCase().includes(queryTopic)
            );
            
            res.json({
                success: true,
                topic: queryTopic,
                resources: matchedResources
            });
        } else {
            // Return empty if no valid query
            res.json({
                success: true,
                topic: "General",
                resources: staticResources.slice(0, 4) // subset defaults
            });
        }

    } catch (error) {
        next(error);
    }
};
