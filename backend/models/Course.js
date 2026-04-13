const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: String, required: true },
    price: { type: Number, required: true },
    skills: [{ type: String }], // e.g., ['React', 'JavaScript']
    instructor: { type: String, required: true }, // Simple string for now, could be a reference to Tutor
});

module.exports = mongoose.model('Course', courseSchema);
