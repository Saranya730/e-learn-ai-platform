const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const UserSchema = new mongoose.Schema({
    name: String,
    role: String
});
const User = mongoose.model('User', UserSchema);

const CourseSchema = new mongoose.Schema({
    title: String,
    instructor: String
});
const Course = mongoose.model('Course', CourseSchema);

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected');
        
        const users = await User.find({ role: 'tutor' });
        console.log('Tutors:', JSON.stringify(users, null, 2));
        
        const courses = await Course.find();
        console.log('Courses:', JSON.stringify(courses, null, 2));
        
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}
check();
