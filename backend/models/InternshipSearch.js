import mongoose from 'mongoose';

const internshipSearchSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        domain: {
            type: String,
            required: true,
        },
        resultsCount: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const InternshipSearch = mongoose.model('InternshipSearch', internshipSearchSchema);

export default InternshipSearch;
