import fs from 'fs';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const chatWithImage = async (req, res, next) => {
    try {
        if (!req.file || !req.body.message) {
            return res.status(400).json({ success: false, message: 'Image file and message are required' });
        }

        // Convert image to base64
        const imageBuffer = fs.readFileSync(req.file.path);
        const base64Image = imageBuffer.toString('base64');
        const mimeType = req.file.mimetype;
        const dataUrl = `data:${mimeType};base64,${base64Image}`;

        // Cleanup
        fs.unlinkSync(req.file.path);

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Cost effective vision model setup
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: req.body.message },
                  {
                    type: "image_url",
                    image_url: {
                      "url": dataUrl,
                    },
                  },
                ],
              },
            ],
            max_tokens: 800,
        });

        res.json({
            success: true,
            data: response.choices[0].message.content,
        });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        next(error);
    }
};

export const chatWithMultipleImages = async (req, res, next) => {
    try {
        const { message, images } = req.body;
        if (!images || !Array.isArray(images) || images.length === 0) {
            return res.status(400).json({ success: false, message: 'Images array is required.' });
        }

        const content = [
            { type: "text", text: message || "Analyze these images." }
        ];

        for (const dataUrl of images) {
            content.push({
                type: "image_url",
                image_url: { url: dataUrl },
            });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content }],
            max_tokens: 1500,
        });

        res.json({
            success: true,
            data: response.choices[0].message.content,
        });
    } catch (error) {
        next(error);
    }
};
