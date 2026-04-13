const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tutorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseTitle: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['paid', 'approved'],
        default: 'paid'
    },
    materials: [{
        dayNumber: { type: Number, default: 1 },
        title: { type: String, required: true },
        fileUrl: { type: String, required: true },
        status: { type: String, enum: ['incomplete', 'learning', 'completed'], default: 'incomplete' },
        feedback: String,
        doubts: [{
            question: String,
            answer: String,
            askedAt: { type: Date, default: Date.now },
            answeredAt: Date
        }],
        uploadedAt: { type: Date, default: Date.now }
    }],
    progress: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    finalRating: { type: Number },
    finalReview: { type: String },
    isCompleted: { type: Boolean, default: false },
    nudgeCount: { type: Number, default: 0 },
    lastNudgeAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
