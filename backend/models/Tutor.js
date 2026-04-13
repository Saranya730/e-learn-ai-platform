const mongoose = require('mongoose');

const tutorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    bio: { type: String, required: true },
    skills: [{ type: String }], // e.g., ['Python', 'Machine Learning']
    experience: { type: Number, required: true }, // Years of experience
    achievements: [{ type: String }],
    reviews: [{
        studentName: String,
        comment: String,
        rating: Number
    }]
});

module.exports = mongoose.model('Tutor', tutorSchema);
