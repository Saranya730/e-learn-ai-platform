const express = require('express');
const router = express.Router();
const { getTutorReviews, addReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Get reviews (Public)
router.get('/:tutorId', getTutorReviews);

// Add review (Protected - Students)
router.post('/add', protect, addReview);

module.exports = router;
