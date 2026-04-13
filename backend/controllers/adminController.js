const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const TutorProfile = require('../models/TutorProfile');
const bcrypt = require('bcryptjs');

// @desc Get Admin Dashboard stats
// @route GET /api/admin/stats
const getAdminStats = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalTutors = await User.countDocuments({ role: 'tutor' });
        const totalEnrollments = await Enrollment.countDocuments();

        const enrollments = await Enrollment.find()
            .populate('studentId', 'name email')
            .populate('tutorId', 'name email')
            .sort({ createdAt: -1 });

        const students = await User.find({ role: 'student' }).select('name email createdAt');
        const tutors = await User.find({ role: 'tutor' }).select('name email createdAt');

        res.json({
            stats: {
                totalStudents,
                totalTutors,
                totalEnrollments
            },
            enrollments,
            students,
            tutors
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc Create a Tutor account (Admin only)
// @route POST /api/admin/create-tutor
const createTutor = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newTutor = new User({
            name,
            email,
            password: hashedPassword,
            role: 'tutor'
        });

        await newTutor.save();

        const newProfile = new TutorProfile({
            userId: newTutor._id,
            bio: "New Tutor Profile",
            experience: 0
        });

        await newProfile.save();

        res.status(201).json({ message: 'Tutor account created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc Delete a user (Admin only)
// @route DELETE /api/admin/user/:id
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user is an admin (optional: prevent self-deletion or deleting other admins)
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot delete admin accounts' });
        }

        // If tutor, delete their profile too
        if (user.role === 'tutor') {
            await TutorProfile.findOneAndDelete({ userId: user._id });
        }

        // Also might want to cleanup Enrollments or Reviews if necessary
        // For now, just delete the user
        await User.findByIdAndDelete(req.params.id);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getAdminStats, createTutor, deleteUser };
