const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Review = require('../models/Review');
const User = require('../models/User'); // Assuming User model might be needed elsewhere or just to be safe

// @desc Join a course (after payment)
// @route POST /api/enrollment/join
const joinCourse = async (req, res) => {
    try {
        const { tutorId, courseTitle, amount, paymentId } = req.body;
        const studentId = req.user._id;

        const enrollment = new Enrollment({
            studentId,
            tutorId,
            courseTitle,
            amount,
            paymentId,
            status: 'paid'
        });

        await enrollment.save();
        res.status(201).json({ message: 'Enrolled successfully. Waiting for tutor approval.', enrollment });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc Get student's enrolled courses
// @route GET /api/enrollment/my-courses
const getMyCourses = async (req, res) => {
    try {
        const courses = await Enrollment.find({ studentId: req.user._id })
            .populate('tutorId', 'name email')
            .sort({ createdAt: -1 });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc Get tutor's enrollment requests
// @route GET /api/enrollment/tutor-requests
const getTutorRequests = async (req, res) => {
    try {
        const requests = await Enrollment.find({ tutorId: req.user._id })
            .populate('studentId', 'name email')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc Approve student access
// @route PUT /api/enrollment/approve/:id
const approveAccess = async (req, res) => {
    try {
        const enrollment = await Enrollment.findByIdAndUpdate(
            req.params.id,
            { status: 'approved' },
            { new: true }
        );
        res.json({ message: 'Access approved', enrollment });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc Upload material for an enrollment (with dayNumber)
// @route POST /api/enrollment/upload-material/:id
const uploadMaterial = async (req, res) => {
    try {
        const { title, dayNumber } = req.body;
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        // dayNumber is handled by default in schema if not provided

        const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        const enrollment = await Enrollment.findById(req.params.id);
        if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
        
        // Authorization check
        if (enrollment.tutorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized: You are not the tutor for this student' });
        }

        const materialObj = { 
            title: title || `Learning Material`, 
            fileUrl 
        };
        
        // Only set dayNumber if it's a valid number, otherwise let schema use default: 1
        if (dayNumber && !isNaN(dayNumber)) {
            materialObj.dayNumber = Number(dayNumber);
        }

        enrollment.materials.push(materialObj);
        await enrollment.save();
        res.json({ message: 'Material uploaded successfully', enrollment });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc Update material status (completed/learning)
// @route PUT /api/enrollment/update-status/:id/:materialId
const updateMaterialStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const enrollment = await Enrollment.findById(req.params.id);
        const material = enrollment.materials.id(req.params.materialId);
        if (!material) return res.status(404).json({ message: 'Material not found' });

        material.status = status;
        
        // Calculate progress
        const total = enrollment.materials.length;
        const completed = enrollment.materials.filter(m => m.status === 'completed').length;
        enrollment.progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        await enrollment.save();
        res.json({ message: 'Status updated', enrollment });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc Submit feedback for a day
const submitFeedback = async (req, res) => {
    try {
        const enrollment = await Enrollment.findById(req.params.id);
        const material = enrollment.materials.id(req.params.materialId);
        material.feedback = req.body.feedback;
        await enrollment.save();
        res.json({ message: 'Feedback submitted', enrollment });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc Submit a doubt
const submitDoubt = async (req, res) => {
    try {
        const enrollment = await Enrollment.findById(req.params.id);
        const material = enrollment.materials.id(req.params.materialId);
        material.doubts.push({ question: req.body.question });
        await enrollment.save();
        res.json({ message: 'Doubt submitted', enrollment });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc Reply to doubt (Tutor)
const replyToDoubt = async (req, res) => {
    try {
        const enrollment = await Enrollment.findById(req.params.id);
        const material = enrollment.materials.id(req.params.materialId);
        const doubt = material.doubts.id(req.params.doubtId);
        doubt.answer = req.body.answer;
        doubt.answeredAt = Date.now();
        await enrollment.save();
        res.json({ message: 'Reply sent', enrollment });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc Award points (Tutor)
const awardPoints = async (req, res) => {
    try {
        const enrollment = await Enrollment.findByIdAndUpdate(req.params.id, { totalPoints: req.body.points }, { new: true });
        res.json({ message: 'Points awarded', enrollment });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc Final Rating (Student)
const submitFinalRating = async (req, res) => {
    try {
        const { rating, review } = req.body;
        const enrollment = await Enrollment.findById(req.params.id);

        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        // Update enrollment
        enrollment.finalRating = rating;
        enrollment.finalReview = review;
        enrollment.isCompleted = true;
        await enrollment.save();

        // Also create a Review document to contribute to tutor stats
        const newReview = new Review({
            studentId: enrollment.studentId,
            tutorId: enrollment.tutorId,
            rating: rating,
            comment: review
        });
        await newReview.save();

        res.json({ message: 'Final rating submitted and recorded', enrollment });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc Nudge student (Tutor)
const nudgeStudent = async (req, res) => {
    try {
        const enrollment = await Enrollment.findById(req.params.id);
        enrollment.nudgeCount += 1;
        enrollment.lastNudgeAt = new Date();
        await enrollment.save();
        res.json({ message: 'Student nudged', enrollment });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { 
    joinCourse, getMyCourses, getTutorRequests, approveAccess, 
    uploadMaterial, updateMaterialStatus, submitFeedback, 
    submitDoubt, replyToDoubt, awardPoints, submitFinalRating, nudgeStudent 
};
