import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student"
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", formData);
      alert("Registration Successful ✅");
      navigate("/");
    } catch (error) {
      alert("Error registering user ❌");
    }
  };

  return (
    <>
      <style>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: radial-gradient(circle at top left, var(--primary-500), transparent),
                      radial-gradient(circle at bottom right, var(--primary-800), transparent),
                      var(--slate-900);
          padding: var(--space-4);
        }

        .auth-box {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: var(--space-10);
          border-radius: var(--radius-2xl);
          width: 100%;
          max-width: 400px;
          box-shadow: var(--shadow-xl);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .auth-box h2 {
          text-align: center;
          margin-bottom: var(--space-2);
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--slate-900);
          letter-spacing: -0.025em;
        }

        .auth-subtitle {
          text-align: center;
          color: var(--slate-500);
          margin-bottom: var(--space-8);
          font-size: 0.875rem;
        }

        .form-group {
          margin-bottom: var(--space-5);
        }

        .form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--slate-700);
          margin-bottom: var(--space-1);
        }

        .auth-box input, .auth-box select {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-lg);
          border: 1px solid var(--slate-200);
          background: var(--slate-50);
          transition: var(--transition-base);
          font-size: 1rem;
        }

        .auth-box input:focus, .auth-box select:focus {
          outline: none;
          border-color: var(--primary-500);
          box-shadow: 0 0 0 4px var(--primary-100);
          background: white;
        }

        .auth-box button {
          width: 100%;
          padding: 0.875rem;
          background: var(--primary-600);
          color: white;
          border: none;
          border-radius: var(--radius-lg);
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
          transition: var(--transition-base);
          margin-top: var(--space-4);
          box-shadow: var(--shadow-md);
        }

        .auth-box button:hover {
          background: var(--primary-700);
          transform: translateY(-1px);
          box-shadow: var(--shadow-lg);
        }

        .auth-box button:active {
          transform: translateY(0);
        }

        .auth-footer {
          text-align: center;
          margin-top: var(--space-8);
          font-size: 0.875rem;
          color: var(--slate-600);
        }

        .auth-footer a {
          color: var(--primary-600);
          text-decoration: none;
          font-weight: 600;
          transition: var(--transition-fast);
        }

        .auth-footer a:hover {
          color: var(--primary-700);
          text-decoration: underline;
        }
      `}</style>

      <div className="auth-container">
        <div className="auth-box">
          <h2>Create Account</h2>
          <p className="auth-subtitle">Join our community of learners today</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="John Doe"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="name@company.com"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                onChange={handleChange}
                required
              />
            </div>

            {/* <div className="form-group">
              <label htmlFor="role">I am a...</label>
              <select id="role" name="role" onChange={handleChange}>
                <option value="student">Student</option>
                <option value="tutor">Tutor</option>
              </select>
            </div> */}

            <button type="submit">Join Now</button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/">Sign In</Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;