import mongoose from 'mongoose';

const atsReportSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        fileName: {
            type: String,
            required: true,
        },
        score: {
            type: Number,
            required: true,
        },
        keywords: {
            type: [String],
            default: [],
        },
        formattingIssues: {
            type: [String],
            default: [],
        },
        grammarIssues: {
            type: [String],
            default: [],
        },
        suggestions: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

const ATSReport = mongoose.model('ATSReport', atsReportSchema);

export default ATSReport;
