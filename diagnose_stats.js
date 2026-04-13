const mongoose = require('mongoose');
const Enrollment = require('./models/Enrollment');
const Review = require('./models/Review');
const User = require('./models/User');

const MONGO_URI = "mongodb://localhost:21017/elearn"; // Adjust if needed

async function diagnose() {
    await mongoose.connect(MONGO_URI);
    const tutorEmail = 'karthik@gmail.com';
    const tutor = await User.findOne({ email: tutorEmail });
    
    if (!tutor) {
        console.log("Tutor not found");
        return;
    }

    console.log(`Tutor ID: ${tutor._id}`);

    const enrollmentsWithRatings = await Enrollment.find({ 
        tutorId: tutor._id, 
        finalRating: { $exists: true } 
    });
    console.log(`Enrollments with finalRating: ${enrollmentsWithRatings.length}`);

    const reviews = await Review.find({ tutorId: tutor._id });
    console.log(`Review documents: ${reviews.length}`);

    if (enrollmentsWithRatings.length > reviews.length) {
        console.log("Detected missing Review records for existing Enrollments.");
    }

    mongoose.connection.close();
}

diagnose();
