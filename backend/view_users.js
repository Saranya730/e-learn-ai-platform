require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const viewUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB...");

        const users = await User.find({}, 'name email role password');
        
        console.log("\n--- USER COLLECTIONS ---");
        if (users.length === 0) {
            console.log("No users found in the database.");
        } else {
            console.table(users.map(u => ({
                Name: u.name,
                Email: u.email,
                Role: u.role,
                Password: " [HASHED] " // Do not show full hash for privacy, just confirm it's hashed
            })));
        }

        console.log("\n[NOTE] Passwords are securely hashed using bcrypt and cannot be seen as plain text.");
        
        await mongoose.disconnect();
    } catch (err) {
        console.error("Error:", err.message);
        process.exit(1);
    }
};

viewUsers();
