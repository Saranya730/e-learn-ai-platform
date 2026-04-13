const Review = require('../models/Review');

// @desc Get all reviews for a specific tutor
// @route GET /api/review/:tutorId
const getTutorReviews = async (req, res) => {
    try {
        const { tutorId } = req.params;
        const reviews = await Review.find({ tutorId })
            .populate('studentId', 'name')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc Add a review (for testing/demo)
// @route POST /api/review/add
const addReview = async (req, res) => {
    try {
        const { tutorId, rating, comment } = req.body;
        const studentId = req.user._id;

        const newReview = new Review({
            studentId,
            tutorId,
            rating,
            comment
        });

        await newReview.save();
        res.status(201).json({ message: 'Review added successfully', review: newReview });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getTutorReviews, addReview };
