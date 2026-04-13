const User = require('../models/User');
const TutorProfile = require('../models/TutorProfile');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// ====================== REGISTER ======================
const register = async (req, res) => {
    try {
        let { name, email, password, role } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        email = email.trim().toLowerCase();

        const userRole = role || "student";

        // Check existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: userRole
        });

        await newUser.save();

        // If tutor → create tutor profile
        if (userRole === "tutor") {
            const newTutorProfile = new TutorProfile({
                userId: newUser._id,
                bio: "Update your bio",
                experience: 0,
                languagesSpecialist: [],
                awards: []
            });

            await newTutorProfile.save();
        }

        res.status(201).json({
            message: "User registered successfully"
        });

    } catch (error) {
        console.error("REGISTER ERROR:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};



// ====================== LOGIN ======================
const login = async (req, res) => {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        email = email.trim().toLowerCase();

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "User not found"
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Password incorrect"
            });
        }

        // Generate token
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET || "secretkey",
            { expiresIn: "1d" }
        );

        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = { register, login };