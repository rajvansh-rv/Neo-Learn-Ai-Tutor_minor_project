import Progress from '../models/Progress.js';

// @desc    Add new progress entry
// @route   POST /api/progress
// @access  Private
export const addProgress = async (req, res, next) => {
    try {
        const { topic, status, score, notes } = req.body;

        const progress = new Progress({
            user: req.user._id, // Set from authMiddleware
            topic,
            status,
            score,
            notes
        });

        const createdProgress = await progress.save();
        res.status(201).json(createdProgress);
    } catch (error) {
        next(error);
    }
};

// @desc    Get user's progress list
// @route   GET /api/progress/:userId
// @access  Private
export const getProgress = async (req, res, next) => {
    try {
        // Only allow user to get their own progress
        if (req.user._id.toString() !== req.params.userId) {
            res.status(403);
            throw new Error('Not authorized to view this progress data');
        }

        const progressItems = await Progress.find({ user: req.params.userId }).sort({ updatedAt: -1 });
        res.json(progressItems);
    } catch (error) {
        next(error);
    }
};

// @desc    Update progress entry
// @route   PUT /api/progress/:progressId
// @access  Private
export const updateProgress = async (req, res, next) => {
    try {
        const { topic, status, score, notes } = req.body;

        const progress = await Progress.findById(req.params.progressId);

        if (!progress) {
            res.status(404);
            throw new Error('Progress record not found');
        }

        if (progress.user.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('User not authorized to update this record');
        }

        progress.topic = topic || progress.topic;
        progress.status = status || progress.status;
        progress.score = score !== undefined ? score : progress.score;
        progress.notes = notes !== undefined ? notes : progress.notes;

        const updatedProgress = await progress.save();
        res.json(updatedProgress);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete progress entry
// @route   DELETE /api/progress/:progressId
// @access  Private
export const deleteProgress = async (req, res, next) => {
    try {
        const progress = await Progress.findById(req.params.progressId);

        if (!progress) {
            res.status(404);
            throw new Error('Progress record not found');
        }

        if (progress.user.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('User not authorized to delete this record');
        }

        await progress.deleteOne();
        res.json({ message: 'Progress removed successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get progress summary statistics
// @route   GET /api/progress/summary/:userId
// @access  Private
export const getProgressSummary = async (req, res, next) => {
    try {
        if (req.user._id.toString() !== req.params.userId) {
            res.status(403);
            throw new Error('Not authorized');
        }

        const progressList = await Progress.find({ user: req.params.userId });

        const totalTopics = progressList.length;
        const completedTopics = progressList.filter(p => p.status === 'completed').length;
        const inProgressTopics = progressList.filter(p => p.status === 'in-progress').length;
        
        // Calculate average score
        const totalScore = progressList.reduce((acc, curr) => acc + curr.score, 0);
        const averageScore = totalTopics > 0 ? (totalScore / totalTopics).toFixed(2) : 0;
        
        // Progress percentage based on completion
        const progressPercentage = totalTopics > 0 ? ((completedTopics / totalTopics) * 100).toFixed(1) : 0;

        res.json({
            totalTopics,
            completedTopics,
            inProgressTopics,
            averageScore,
            progressPercentage
        });
    } catch (error) {
        next(error);
    }
};
