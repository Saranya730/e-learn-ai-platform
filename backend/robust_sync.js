const mongoose = require('mongoose');
const Enrollment = require('./models/Enrollment');
const Review = require('./models/Review');
const User = require('./models/User');

const MONGO_URI = "mongodb+srv://saranyaa730_db_user:O6cGMweyqHnwtMpN@cluster0.tnwhe79.mongodb.net/?appName=Cluster0";

async function sync() {
    try {
        await mongoose.connect(MONGO_URI);
        const enrollments = await Enrollment.find({ 
            finalRating: { $exists: true, $ne: null } 
        });

        console.log(`Found ${enrollments.length} enrollments with ratings total.`);

        for (const en of enrollments) {
            try {
                // Check if a review already exists
                const exists = await Review.findOne({
                    studentId: en.studentId,
                    tutorId: en.tutorId,
                    rating: en.finalRating,
                    comment: en.finalReview || "Course completed successfully."
                });

                if (!exists) {
                    const newReview = new Review({
                        studentId: en.studentId,
                        tutorId: en.tutorId,
                        rating: en.finalRating,
                        comment: en.finalReview || "Course completed successfully."
                    });
                    await newReview.save();
                    console.log(`✅ Synced review for Enrollment ${en._id}`);
                } else {
                    console.log(`⌛ Review already exists for Enrollment ${en._id}`);
                }
            } catch (innerErr) {
                console.error(`❌ Failed to sync Enrollment ${en._id}:`, innerErr.message);
            }
        }

    } catch (err) {
        console.error("Fatal Error:", err);
    } finally {
        mongoose.connection.close();
    }
}

sync();
