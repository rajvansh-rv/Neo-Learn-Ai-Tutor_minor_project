import User from '../models/User.js';
import Chat from '../models/Chat.js';
import ATSReport from '../models/ATSReport.js';
import InternshipSearch from '../models/InternshipSearch.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Get user profile overview
// @route   GET /api/user/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res, next) => {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        // Aggregate some basic stats
        const totalChats = await Chat.countDocuments({ userId: req.user._id.toString() });
        const totalAts = await ATSReport.countDocuments({ userId: req.user._id });
        const totalInternshipSearches = await InternshipSearch.countDocuments({ userId: req.user._id });

        res.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                stats: {
                    totalChats,
                    totalAts,
                    totalInternshipSearches
                }
            }
        });
});

// @desc    Get user chats
// @route   GET /api/user/chats
// @access  Private
export const getUserChats = asyncHandler(async (req, res, next) => {
        // Fetch chats where userId matches the stringified ObjectId or exactly if it's a string in the DB
        // The original Chat.js model sets userId as String, so we compare as String.
        const chats = await Chat.find({ userId: req.user._id.toString() })
            .sort({ updatedAt: -1 })
            .limit(10); // Return recent 10 for profile
        
    res.json({ success: true, chats });
});

// @desc    Get user ATS reports
// @route   GET /api/user/ats
// @access  Private
export const getUserATSReports = asyncHandler(async (req, res, next) => {
        const reports = await ATSReport.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(10);
            
    res.json({ success: true, reports });
});

// @desc    Get user internship searches
// @route   GET /api/user/internships
// @access  Private
export const getUserInternshipSearches = asyncHandler(async (req, res, next) => {
        const searches = await InternshipSearch.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(10);
            
    res.json({ success: true, searches });
});
