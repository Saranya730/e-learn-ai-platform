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
        
        const tutors = await User.find({ role: 'tutor' });
        tutors.forEach(t => {
            console.log(`Tutor Name: [${t.name}] (Length: ${t.name.length})`);
        });
        
        const courses = await Course.find();
        courses.forEach(c => {
            console.log(`Course: [${c.title}] - Instructor: [${c.instructor}] (Length: ${c.instructor?.length || 0})`);
        });
        
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}
check();
