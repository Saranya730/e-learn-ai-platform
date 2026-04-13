const mongoose = require('mongoose');
const Enrollment = require('./models/Enrollment');
const Review = require('./models/Review');
const User = require('./models/User');

const MONGO_URI = "mongodb+srv://saranyaa730_db_user:O6cGMweyqHnwtMpN@cluster0.tnwhe79.mongodb.net/?appName=Cluster0";

async function diagnose() {
    try {
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
            console.log("Migrating missing reviews...");
            
            for (const en of enrollmentsWithRatings) {
                // Check if a review already exists for this student/tutor/comment/rating combo
                const exists = await Review.findOne({
                    studentId: en.studentId,
                    tutorId: en.tutorId,
                    rating: en.finalRating,
                    comment: en.finalReview
                });
                
                if (!exists) {
                    const newReview = new Review({
                        studentId: en.studentId,
                        tutorId: en.tutorId,
                        rating: en.finalRating,
                        comment: en.finalReview
                    });
                    await newReview.save();
                    console.log(`Migrated review for Enrollment: ${en._id}`);
                }
            }
            console.log("Migration complete.");
        } else {
            console.log("All ratings are currently synced.");
        }

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
}

diagnose();
