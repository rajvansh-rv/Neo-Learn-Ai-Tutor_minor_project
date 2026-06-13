import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    platform: { type: String, required: true }, // e.g., 'YouTube', 'Coursera', 'Documentation'
    type: { type: String, required: true }, // e.g., 'Video', 'Article', 'Course'
    url: { type: String, required: true },
    topic: { type: String, required: true },
    level: { type: String, enum: ['All', 'Beginner', 'Intermediate', 'Advanced'], default: 'All' }
});

const Resource = mongoose.model('Resource', resourceSchema);
export default Resource;
