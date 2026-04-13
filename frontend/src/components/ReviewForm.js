import React, { useState } from 'react';
import axios from 'axios';
import StarRating from './StarRating';

const ReviewForm = ({ tutorId, onReviewAdded }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        setSubmitting(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/review/add', {
                tutorId,
                rating,
                comment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setComment('');
            setRating(5);
            if (onReviewAdded) onReviewAdded();
            alert('Review submitted successfully! ⭐');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="review-form-container">
            <h4>Leave a Review</h4>
            <form onSubmit={handleSubmit}>
                <div className="rating-input-premium">
                    <label style={{ fontWeight: 800, color: 'var(--slate-700)', marginBottom: '8px', display: 'block' }}>Rate your experience</label>
                    <StarRating value={rating} onChange={setRating} size="2.5rem" />
                    <p style={{ textAlign: 'center', marginTop: '8px', fontWeight: 900, fontSize: '1.25rem', color: '#fbbf24' }}>{rating} / 5.0</p>
                </div>
                <div className="comment-input">
                    <textarea
                        placeholder="Share your experience with this tutor..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error-text">{error}</p>}
                <button type="submit" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
            </form>

            <style>{`
                .review-form-container {
                    background: #f8fafc;
                    padding: 20px;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    margin-top: 20px;
                }
                .review-form-container h4 {
                    margin-top: 0;
                    margin-bottom: 15px;
                    color: #1e293b;
                }
                .rating-input {
                    margin-bottom: 15px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .rating-input select {
                    padding: 5px 10px;
                    border-radius: 6px;
                    border: 1px solid #cbd5e1;
                }
                .comment-input textarea {
                    width: 100%;
                    min-height: 100px;
                    padding: 12px;
                    border-radius: 8px;
                    border: 1px solid #cbd5e1;
                    margin-bottom: 15px;
                    font-family: inherit;
                    resize: vertical;
                }
                .review-form-container button {
                    background: #2563eb;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .review-form-container button:hover {
                    background: #1d4ed8;
                }
                .review-form-container button:disabled {
                    background: #94a3b8;
                    cursor: not-allowed;
                }
                .error-text {
                    color: #ef4444;
                    font-size: 14px;
                    margin-bottom: 15px;
                }
            `}</style>
        </div>
    );
};

export default ReviewForm;
