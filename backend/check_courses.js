const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const CourseSchema = new mongoose.Schema({
    title: String,
    instructor: String
});
const Course = mongoose.model('Course', CourseSchema);

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected');
        const courses = await Course.find();
        console.log('Courses:', JSON.stringify(courses, null, 2));
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}
check();
