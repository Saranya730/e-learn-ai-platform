const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

const { 
    joinCourse, getMyCourses, getTutorRequests, approveAccess, 
    uploadMaterial, updateMaterialStatus, submitFeedback, 
    submitDoubt, replyToDoubt, awardPoints, submitFinalRating, nudgeStudent 
} = require('../controllers/enrollmentController');
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(protect);

// Student routes
router.post('/join', roleMiddleware(['student']), joinCourse);
router.get('/my-courses', roleMiddleware(['student']), getMyCourses);
router.put('/update-status/:id/:materialId', roleMiddleware(['student']), updateMaterialStatus);
router.put('/feedback/:id/:materialId', roleMiddleware(['student']), submitFeedback);
router.post('/doubt/:id/:materialId', roleMiddleware(['student']), submitDoubt);
router.put('/final-rating/:id', roleMiddleware(['student']), submitFinalRating);

// Tutor routes
router.get('/tutor-requests', roleMiddleware(['tutor']), getTutorRequests);
router.put('/approve/:id', roleMiddleware(['tutor']), approveAccess);
router.post('/upload-material/:id', roleMiddleware(['tutor']), upload.single('file'), uploadMaterial);
router.put('/reply-doubt/:id/:materialId/:doubtId', roleMiddleware(['tutor']), replyToDoubt);
router.put('/award-points/:id', roleMiddleware(['tutor']), awardPoints);
router.put('/nudge/:id', roleMiddleware(['tutor']), nudgeStudent);

module.exports = router;
