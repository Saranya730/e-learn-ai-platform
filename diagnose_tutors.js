require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const User = require('./backend/models/User');
const Course = require('./backend/models/Course');

const diagnose = async () => {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const tutors = await User.find({ role: 'tutor' });
        console.log('Tutors in DB:', tutors.map(t => t.name));

        const courses = await Course.find();
        console.log('Courses in DB:', courses.map(c => c.title));

        process.exit(0);
    } catch (err) {
        console.error('Diagnosis Failed:', err);
        process.exit(1);
    }
};

diagnose();
