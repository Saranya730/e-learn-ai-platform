const mongoose = require('mongoose');

const tutorProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    experience: {
        type: Number,
        required: true,
        default: 0
    },
    languagesSpecialist: {
        type: [String],
        default: []
    },
    awards: {
        type: [String],
        default: []
    },
    bio: {
        type: String,
        required: true
    },
    profileImage: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('TutorProfile', tutorProfileSchema);
