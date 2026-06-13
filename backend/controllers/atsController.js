import fs from 'fs';
import mammoth from 'mammoth';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { createRequire } from 'module';
import ATSReport from '../models/ATSReport.js';
import asyncHandler from '../middleware/asyncHandler.js';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const analyzeResume = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        res.status(400);
        throw new Error("No file uploaded");
    }

    const mimeType = req.file.mimetype;
    const originalName = req.file.originalname.toLowerCase();
    
    console.log("File received:", req.file.originalname);
    
    let extractedText = '';

    if (mimeType === 'application/pdf' || originalName.endsWith('.pdf')) {
        try {
            const data = await pdfParse(req.file.buffer);
            extractedText = data.text;
        } catch (err) {
            console.error("PDF PARSE ERROR:", err);
            res.status(500);
            throw new Error("Failed to read PDF");
        }
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || originalName.endsWith('.docx')) {
        try {
            const result = await mammoth.extractRawText({ buffer: req.file.buffer });
            extractedText = result.value;
        } catch (err) {
            console.error("DOCX PARSE ERROR:", err);
            res.status(500);
            throw new Error("Failed to read DOCX");
        }
    } else {
        res.status(400);
        throw new Error('Unsupported file type. Please upload PDF or DOCX.');
    }

    console.log("Extracted text length:", extractedText.length);

    if (!extractedText || extractedText.length < 50) {
        return res.json({
            success: true,
            score: 50,
            grammarIssues: [],
            formattingIssues: [],
            suggestions: ["Resume content too short or unreadable"]
        });
    }

    // Basic Heuristic Scoring
    let keywordScore = 0;
    let foundKeywords = [];
    const targetKeywords = ['skills', 'experience', 'education', 'projects'];
    const textLower = extractedText.toLowerCase();

    targetKeywords.forEach(kw => {
        if (textLower.includes(kw)) {
            foundKeywords.push(kw);
            keywordScore += 7.5; // max 30
        }
    });

    let formattingScore = 0;
    let bulletCount = (extractedText.match(/(•|- |\* )/g) || []).length;
    if (bulletCount >= 5) formattingScore += 20;
    else if (bulletCount > 0) formattingScore += 10;

    let lengthScore = 0;
    let wordCount = extractedText.split(/\s+/).length;
    if (wordCount > 200 && wordCount <= 1200) lengthScore += 15; // Optimal length
    else if (wordCount > 1200) lengthScore += 10;
    else if (wordCount > 50) lengthScore += 5;

    // AI Enhancement
    const prompt = `Analyze this resume text and provide the following in valid JSON format:
1. "grammarScore": a score out of 20 based on grammar correctness.
2. "readabilityScore": a score out of 15 based on clarity and structure.
3. "grammarIssues": an array of strings listing specific spelling or grammar mistakes found. If none, provide an empty array.
4. "formattingIssues": an array of strings noting missing critical sections, poor spacing, or bad structure. If none, provide an empty array.
5. "suggestions": an array of strings with detailed improvement tips.

Ensure your response is ONLY valid JSON without any markdown code blocks (no \`\`\`json).

Resume Text:
"""
${extractedText.substring(0, 4000)}
"""`;

    let aiResponse = null;
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1000,
            temperature: 0.2,
        });
        
        let content = response.choices[0].message.content.trim();
        if (content.startsWith('\`\`\`json')) {
            content = content.replace(/^\`\`\`json\n?/, '').replace(/\n?\`\`\`$/, '');
        } else if (content.startsWith('\`\`\`')) {
            content = content.replace(/^\`\`\`\n?/, '').replace(/\n?\`\`\`$/, '');
        }
        aiResponse = JSON.parse(content);
    } catch (err) {
        console.error("AI ERROR:", err);
        aiResponse = {
            grammarScore: 15,
            readabilityScore: 10,
            grammarIssues: [],
            formattingIssues: [],
            suggestions: ["AI analysis unavailable"]
        };
    }

    const totalScore = Math.min(100, Math.round(keywordScore + formattingScore + lengthScore + (aiResponse.grammarScore || 15) + (aiResponse.readabilityScore || 10)));

    const finalKeywords = foundKeywords;
    const finalGrammarIssues = aiResponse.grammarIssues || [];
    const finalFormattingIssues = aiResponse.formattingIssues || [];
    const finalSuggestions = Array.isArray(aiResponse.suggestions) ? aiResponse.suggestions : [aiResponse.suggestions || "No suggestions available."];

    if (req.user) {
        try {
            await ATSReport.create({
                userId: req.user._id,
                fileName: req.file.originalname,
                score: totalScore,
                keywords: finalKeywords,
                formattingIssues: finalFormattingIssues,
                grammarIssues: finalGrammarIssues,
                suggestions: finalSuggestions
            });
        } catch (err) {
            console.error("Failed to save ATS report:", err);
        }
    }

    return res.json({
        success: true,
        score: totalScore,
        keywords: finalKeywords,
        grammarIssues: finalGrammarIssues,
        formattingIssues: finalFormattingIssues,
        suggestions: finalSuggestions
    });
});
