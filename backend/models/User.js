import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        interests: {
            type: [String],
            default: [],
        },
        currentLevel: {
            type: String,
            default: 'Beginner',
        },
        targetRole: {
            type: String,
            default: 'Software Engineer',
        },
        studyHoursPerWeek: {
            type: Number,
            default: 10,
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

// Method to verify password during login
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-save middleware to hash the password before saving a new user
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
export default User;
