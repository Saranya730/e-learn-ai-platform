# 🎓 E-Learn AI Platform

A premium, full-stack E-Learning ecosystem integrated with an **AI Career Counselor**. This platform bridges the gap between students and tutors with a seamless, feature-rich interface and robust back-end logic.

---

## 🌟 Features

### 🤖 AI Career Counselor
- **Smart Recommendations:** Integrated AI chatbot (Groq SDK) that analyzes user interests and recommends platform-specific courses.
- **Natural Interaction:** Conversational interface that acts as a personal tutor/counselor.

### 💳 Secure Payments
- **Razorpay Integration:** Secure and fast checkout process for course enrollments.
- **Transaction Verification:** Built-in signature verification for safe payments.

### 📊 Role-Based Dashboards
- **Student Dashboard:** View enrolled courses, track progress, and provide feedback.
- **Tutor Dashboard:** Create & manage courses, upload materials (via Multer), and monitor student engagement stats.
- **Admin Dashboard:** Total control over users, tutors, and course approvals.

### 🏫 Course Management
- **Rich Content:** Support for course descriptions, durations, and pricing.
- **Reviews & Ratings:** Interactive star-rating system for community feedback.
- **Dynamic Search:** Find courses and tutors based on categories and expertise.

---

## 🛠️ Tech Stack

### Frontend
- **React.js**: Modern component-based UI.
- **React Router**: Seamless client-side navigation.
- **Axios**: Efficient API communication.
- **Vanilla CSS**: Premium, custom-tailored aesthetics.

### Backend
- **Node.js & Express**: High-performance server-side logic.
- **MongoDB Atlas**: Scalable NoSQL database (Mongoose ODM).
- **JWT**: Secure JSON Web Token authentication.
- **Groq SDK**: Blazing-fast AI completions for recommendations.
- **Multer**: Robust multi-part file processing for uploads.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas Account
- Razorpay API Keys
- Groq API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Saranya730/e-learn-ai-platform.git
   cd e-learn-ai-platform
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   GROQ_API_KEY=your_groq_key
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the App

1. **Start Backend:**
   ```bash
   # From the backend directory
   node server.js
   ```

2. **Start Frontend:**
   ```bash
   # From the frontend directory
   npm start
   ```

---

## 📁 Project Structure

```text
e-learn-ai-platform/
├── backend/
│   ├── controllers/    # Route controllers (AI, Auth, Course)
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express API endpoints
│   ├── uploads/        # Static file storage
│   └── server.js       # Entry point
├── frontend/
│   ├── public/         # Static assets
│   └── src/
│       ├── components/ # Reusable UI components
│       └── App.js      # Main router & app logic
└── README.md
```

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the ISC License.

---
**Developed with ❤️ by Saranya730**
