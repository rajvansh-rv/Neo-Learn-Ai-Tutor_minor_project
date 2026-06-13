import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        enum: ['user', 'ai', 'system']
    },
    content: {
        type: String,
        required: true
    }
});

const chatSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    title: {
        type: String,
        default: 'New Chat'
    },
    messages: [messageSchema]
}, {
    timestamps: true
});

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
