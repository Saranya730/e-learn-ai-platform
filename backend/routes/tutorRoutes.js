const express = require('express');
const router = express.Router();

const { getDashboard, updateProfile, getAllTutors } = require('../controllers/tutorController');
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public for logged in users
router.get('/all-tutors', protect, getAllTutors);

// Tutor only
router.get('/dashboard', protect, roleMiddleware(['tutor']), getDashboard);
router.put('/update-profile', protect, roleMiddleware(['tutor']), updateProfile);

module.exports = router;