import Chat from '../models/Chat.js';
import asyncHandler from '../middleware/asyncHandler.js';

// Save or Update a chat
export const saveChat = asyncHandler(async (req, res, next) => {
        const { userId, messages } = req.body;
        // If an id is provided in body, update it, otherwise create new
        const { id } = req.body;

        if (!userId || !messages || messages.length === 0) {
            return res.status(400).json({ success: false, message: 'Missing userId or messages' });
        }

        // Auto-generate title from the first user message if creating new
        let title = 'New Chat';
        const firstUserMessage = messages.find(m => m.role === 'user');
        if (firstUserMessage) {
            // grab first 25 chars
            title = firstUserMessage.content.substring(0, 25) + (firstUserMessage.content.length > 25 ? '...' : '');
        }

        if (id) {
            const chat = await Chat.findById(id);
            if (chat) {
                chat.messages = messages;
                await chat.save();
                return res.status(200).json({ success: true, chat });
            }
        }

        // Fallback to create
        const chat = await Chat.create({
            userId,
            title,
            messages
        });

    res.status(201).json({ success: true, chat });
});

export const getAllChats = asyncHandler(async (req, res, next) => {
        const { userId } = req.params;
        const chats = await Chat.find({ userId }).select('-messages').sort({ updatedAt: -1 });
    res.status(200).json({ success: true, chats });
});

export const getOneChat = asyncHandler(async (req, res, next) => {
        const chat = await Chat.findById(req.params.id);
        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat not found' });
        }
    res.status(200).json({ success: true, chat });
});

// Delete single chat
export const deleteChat = asyncHandler(async (req, res, next) => {
        const chat = await Chat.findById(req.params.id);
        
        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat not found' });
        }

        // Verify ownership if user is authenticated
        if (req.user) {
            if (chat.userId !== req.user._id.toString()) {
                res.status(401);
                throw new Error('Not authorized to delete this chat');
            }
        }

    await chat.deleteOne();
    res.status(200).json({ success: true, message: 'Chat removed' });
});

// Clear all chats for a user
export const clearAllChats = asyncHandler(async (req, res, next) => {
        const userId = req.params.userId;
        
        // Verify ownership if user is authenticated
        if (req.user) {
            if (userId !== req.user._id.toString()) {
                res.status(401);
                throw new Error('Not authorized to clear these chats');
            }
        }

    await Chat.deleteMany({ userId });
    res.status(200).json({ success: true, message: 'All chats cleared' });
});
