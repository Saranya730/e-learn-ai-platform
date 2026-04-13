import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReviewForm from './ReviewForm';

const TutorDetails = ({ tutor, courses = [], onBack, onPay }) => {
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(true);

    const fetchReviews = async () => {
        try {
            setLoadingReviews(true);
            const res = await axios.get(`http://localhost:5000/api/review/${tutor.userId}`);
            setReviews(res.data);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoadingReviews(false);
        }
    };

    useEffect(() => {
        if (tutor && tutor.userId) {
            fetchReviews();
        }
    }, [tutor]);

    if (!tutor) return <div>Loading...</div>;

    return (
        <div className="tutor-details-container">
            <button onClick={onBack} className="back-btn">← Back to Tutors</button>

            <div className="profile-header-premium">
                <div className="avatar-large-box">{tutor.name.charAt(0)}</div>
                <div className="profile-info-premium">
                    <h2>{tutor.name}</h2>
                    <p className="bio-premium">{tutor.bio}</p>
                    <div className="badges-row">
                        <span className="badge-modern exp">🏆 {tutor.experience} Yrs Experience</span>
                        <span className="badge-modern rate">⭐ {tutor.rating} Rating</span>
                    </div>
                </div>
            </div>

            <div className="section">
                <h3>🏆 Awards & Achievements</h3>
                <ul className="achievements-list">
                    {tutor.awards && tutor.awards.map((award, index) => (
                        <li key={index}>{award}</li>
                    ))}
                    {(!tutor.awards || tutor.awards.length === 0) && <p>No specific awards listed.</p>}
                </ul>
            </div>

            <div className="section">
                <h3>🗣 Student Reviews</h3>
                <div className="reviews-list">
                    {loadingReviews ? (
                        <p>Loading reviews...</p>
                    ) : reviews.length > 0 ? (
                        reviews.map((review, index) => (
                            <div key={review._id} className="review-card">
                                <div className="review-header">
                                    <span className="student-name">{review.studentId?.name || 'Anonymous Student'}</span>
                                    <span className="review-rating" style={{ color: '#fbbf24' }}>⭐ {review.rating}</span>
                                </div>
                                <p>"{review.comment}"</p>
                                <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '5px' }}>
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p>No reviews yet.</p>
                    )}
                </div>
            </div>

            <ReviewForm tutorId={tutor.userId || tutor._id} onReviewAdded={fetchReviews} />

            <div className="section" style={{ marginTop: '40px' }}>
                <h3 style={{ borderLeftColor: 'var(--primary-600)' }}>📚 Courses by {tutor.name}</h3>
                <div className="tutor-courses-grid">
                    {courses.length === 0 ? (
                        <p style={{ color: 'var(--slate-500)', fontStyle: 'italic' }}>This tutor currently has no active courses.</p>
                    ) : (
                        courses.map(course => (
                            <div key={course._id} className="tutor-course-card">
                                <div>
                                    <h4 className="tc-title">{course.title}</h4>
                                    <p className="tc-desc">{course.description.substring(0, 80)}...</p>
                                    <div className="tc-meta">
                                        <span>⏱ {course.duration}</span>
                                        <span>💎 {course.skills?.slice(0, 2).join(', ')}</span>
                                    </div>
                                </div>
                                <div className="tc-footer">
                                    <span className="tc-price">₹{course.price}</span>
                                    <button className="tc-enroll-btn" onClick={() => onPay(course.price, course.title)}>
                                        Enroll Now
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <style>{`
                .tutor-details-container {
                    padding: 20px;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                }
                .back-btn {
                    background: none;
                    border: none;
                    color: #64748b;
                    cursor: pointer;
                    font-size: 16px;
                    margin-bottom: 20px;
                }
                .back-btn:hover {
                    color: #1e293b;
                    text-decoration: underline;
                }
                .profile-header-premium {
                    display: flex;
                    align-items: center;
                    gap: var(--space-8);
                    margin-bottom: var(--space-12);
                    padding-bottom: var(--space-8);
                    border-bottom: 2px solid var(--slate-50);
                }
                .avatar-large-box {
                    width: 100px;
                    height: 100px;
                    background: linear-gradient(135deg, var(--primary-600), var(--primary-400));
                    color: white;
                    border-radius: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2.5rem;
                    font-weight: 900;
                    box-shadow: 0 12px 24px -10px rgba(79, 70, 229, 0.4);
                }
                .profile-info-premium h2 {
                    margin: 0 0 8px 0;
                    font-size: 2rem;
                    color: var(--slate-900);
                    font-weight: 900;
                }
                .bio-premium {
                    color: var(--slate-500);
                    margin-bottom: var(--space-4);
                    font-size: 1.1rem;
                    line-height: 1.6;
                }
                .badges-row {
                    display: flex;
                    gap: 12px;
                }
                .badge-modern {
                    padding: 8px 16px;
                    border-radius: 12px;
                    font-size: 0.9rem;
                    font-weight: 800;
                }
                .exp { background: var(--primary-50); color: var(--primary-700); }
                .rate { background: #fef3c7; color: #92400e; }
                
                .review-card-premium {
                    background: white;
                    padding: var(--space-6);
                    border-radius: var(--radius-xl);
                    border: 1px solid var(--slate-100);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                }
                .review-header-premium {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }
                .student-name-bold {
                    font-weight: 800;
                    color: var(--slate-900);
                }
                
                /* Tutor Courses Cards */
                .tutor-courses-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 20px;
                    margin-top: 20px;
                }
                .tutor-course-card {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                    transition: 0.2s;
                }
                .tutor-course-card:hover {
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
                    transform: translateY(-2px);
                    border-color: #cbd5e1;
                }
                .tc-title {
                    margin: 0 0 10px 0;
                    font-size: 1.15rem;
                    color: #0f172a;
                }
                .tc-desc {
                    font-size: 0.875rem;
                    color: #64748b;
                    line-height: 1.5;
                    margin-bottom: 15px;
                }
                .tc-meta {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                }
                .tc-meta span {
                    background: #f1f5f9;
                    color: #475569;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                .tc-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top: 1px solid #f1f5f9;
                    padding-top: 15px;
                }
                .tc-price {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #2563eb;
                }
                .tc-enroll-btn {
                    background: #2563eb;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .tc-enroll-btn:hover {
                    background: #1d4ed8;
                }
            `}</style>
        </div>
    );
};

export default TutorDetails;
