const express = require('express');
const router = express.Router();
const { getCourses, createCourse, updateCourse, deleteCourse } = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public
router.get('/', getCourses);

// Admin only
router.post('/', protect, roleMiddleware(['admin']), createCourse);
router.put('/:id', protect, roleMiddleware(['admin']), updateCourse);
router.delete('/:id', protect, roleMiddleware(['admin']), deleteCourse);

module.exports = router;
