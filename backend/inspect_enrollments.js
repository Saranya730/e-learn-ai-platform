const mongoose = require('mongoose');
const Enrollment = require('./models/Enrollment');
const User = require('./models/User');

const MONGO_URI = "mongodb+srv://saranyaa730_db_user:O6cGMweyqHnwtMpN@cluster0.tnwhe79.mongodb.net/?appName=Cluster0";

async function inspect() {
    try {
        await mongoose.connect(MONGO_URI);
        const tutorEmail = 'karthik@gmail.com';
        const tutor = await User.findOne({ email: tutorEmail });
        
        const enrollments = await Enrollment.find({ 
            tutorId: tutor._id, 
            finalRating: { $exists: true } 
        });

        for (const en of enrollments) {
            console.log(`Enrollment ID: ${en._id}`);
            console.log(`- Student ID: ${en.studentId}`);
            console.log(`- Rating: ${en.finalRating}`);
            console.log(`- Review: "${en.finalReview}"`);
            console.log(`- Course: ${en.courseTitle}`);
            console.log('---');
        }

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
}

inspect();
