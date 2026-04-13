const TutorProfile = require('../models/TutorProfile');
const Review = require('../models/Review');
const User = require('../models/User');
const Course = require('../models/Course');
const mongoose = require('mongoose');

// @desc Get Tutor Dashboard data
// @route GET /api/tutor/dashboard
const getDashboard = async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch tutor profile and user details
        let tutorProfile = await TutorProfile.findOne({ userId }).populate('userId', 'name email');

        if (!tutorProfile) {
            console.log("Creating missing tutor profile for user:", userId);
            tutorProfile = new TutorProfile({
                userId: userId,
                bio: "Bio needs update",
                experience: 0,
                languagesSpecialist: [],
                awards: []
            });
            await tutorProfile.save();
            // Re-fetch to get populated fields
            tutorProfile = await TutorProfile.findOne({ userId }).populate('userId', 'name email');
        }

        // Aggregate review stats
        const reviewStats = await Review.aggregate([
            { $match: { tutorId: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: '$tutorId',
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        const stats = reviewStats.length > 0 ? reviewStats[0] : { averageRating: 0, totalReviews: 0 };

        // Get recent reviews
        const recentReviews = await Review.find({ tutorId: userId })
            .populate('studentId', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        // Get assigned courses
        const assignedCourses = await Course.find({ instructor: req.user.name });

        res.json({
            profile: {
                name: tutorProfile.userId.name,
                email: tutorProfile.userId.email,
                experience: tutorProfile.experience,
                languagesSpecialist: tutorProfile.languagesSpecialist,
                awards: tutorProfile.awards,
                bio: tutorProfile.bio,
                profileImage: tutorProfile.profileImage
            },
            stats: {
                averageRating: stats.averageRating.toFixed(1),
                totalReviews: stats.totalReviews
            },
            reviews: recentReviews,
            courses: assignedCourses
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc Update Tutor Profile
// @route PUT /api/tutor/update-profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { experience, languagesSpecialist, awards, bio, name, profileImage } = req.body;

        // Update User name if provided
        if (name) {
            await User.findByIdAndUpdate(userId, { name });
        }

        // Update TutorProfile
        const updatedProfile = await TutorProfile.findOneAndUpdate(
            { userId },
            { experience, languagesSpecialist, awards, bio, profileImage },
            { new: true, runValidators: true }
        );

        if (!updatedProfile) {
            return res.status(404).json({ message: 'Tutor profile not found' });
        }

        res.json({ message: 'Profile updated successfully', profile: updatedProfile });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc Get All Tutors (for student search)
// @route GET /api/tutor/all-tutors
const getAllTutors = async (req, res) => {
    try {
        // Find all profiles and populate user details
        const tutors = await TutorProfile.find().populate('userId', 'name email role');

        // Enhance with review stats
        const tutorsWithStats = await Promise.all(tutors.map(async (tutor) => {
            try {
                // Skip if user details are missing (orphaned profile)
                if (!tutor.userId) {
                    return null;
                }

                const userId = tutor.userId._id;

                // Aggregate review stats
                const reviewStats = await Review.aggregate([
                    { $match: { tutorId: new mongoose.Types.ObjectId(userId) } },
                    {
                        $group: {
                            _id: '$tutorId',
                            averageRating: { $avg: '$rating' },
                            totalReviews: { $sum: 1 }
                        }
                    }
                ]);

                const stats = reviewStats.length > 0 ? reviewStats[0] : { averageRating: 0, totalReviews: 0 };

                return {
                    _id: tutor._id,
                    userId: userId,
                    name: tutor.userId.name,
                    bio: tutor.bio || "No bio available",
                    experience: tutor.experience || 0,
                    skills: tutor.languagesSpecialist || [],
                    awards: tutor.awards || [],
                    profileImage: tutor.profileImage || "",
                    rating: stats.averageRating ? stats.averageRating.toFixed(1) : "0.0",
                    totalReviews: stats.totalReviews
                };
            } catch (err) {
                console.error(`Error processing tutor ${tutor._id}:`, err.message);
                return null;
            }
        }));

        // Filter out any null entries
        const finalTutors = tutorsWithStats.filter(t => t !== null);
        res.json(finalTutors);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getDashboard, updateProfile, getAllTutors };
