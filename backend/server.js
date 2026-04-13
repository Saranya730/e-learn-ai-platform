require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Course = require("./models/Course");
const User = require("./models/User");
const authRoutes = require('./routes/authRoutes');
const tutorRoutes = require('./routes/tutorRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const aiRoutes = require('./routes/aiRoutes');
const courseRoutes = require('./routes/courseRoutes');

const path = require('path');
const fs = require('fs');

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from uploads folder
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_YourKeyId",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "YourKeySecret",
});

// Routes
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tutor', tutorRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/enrollment', enrollmentRoutes);
app.use('/api/courses', courseRoutes);

// --- MIDDLEWARE & UTILS ---

// Simple Request Logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Health Check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", uptime: process.uptime(), version: "1.1.0" });
});

// DEBUG ROUTE: View all users in browser (Remove after testing!)
app.get("/api/debug/users", async (req, res) => {
    try {
        const users = await User.find({}, 'name email role');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- EXISTING FEATURES ---

// Handled by courseRoutes

// 2. Get All Tutors (Redirect to tutorRoutes logic)
// Handled by app.use('/api/tutor', tutorRoutes) -> /api/tutor/all-tutors



// 4. Payment Integration (Razorpay)
app.get("/api/payment/key", (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY_ID || "rzp_test_YourKeyId" });
});

app.post("/api/payment/order", async (req, res) => {
    const { amount } = req.body;
    const options = {
        amount: amount * 100, // amount in smallest currency unit (paise)
        currency: "INR",
        receipt: "receipt_order_" + Date.now(),
    };

    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.post("/api/payment/verify", (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const hmac = crypto.createHmac('sha256', "YourKeySecret");
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === razorpay_signature) {
        res.json({ status: "success", message: "Payment Verified" });
    } else {
        res.status(400).json({ status: "failure", message: "Payment Verification Failed" });
    }
});


// Database connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://saranyaa730_db_user:O6cGMweyqHnwtMpN@cluster0.tnwhe79.mongodb.net/?appName=Cluster0");
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error("MongoDB Connection Error:");
        console.error(`- Message: ${err.message}`);
        if (err.name === 'MongooseServerSelectionError') {
            console.error("- Troubleshooting Tip: This usually means your IP is not whitelisted in MongoDB Atlas.");
            console.error("- Action: Go to Atlas -> Network Access -> Add IP Address.");
        }
        process.exit(1);
    }
};

connectDB();

mongoose.connection.on('error', err => {
    console.error(`Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});