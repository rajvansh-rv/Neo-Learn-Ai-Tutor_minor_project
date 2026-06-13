import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        topic: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['not-started', 'in-progress', 'completed'],
            default: 'not-started',
        },
        score: {
            type: Number,
            default: 0,
        },
        notes: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true, // Auto manages lastUpdated via updatedAt
    }
);

const Progress = mongoose.model('Progress', progressSchema);
export default Progress;
