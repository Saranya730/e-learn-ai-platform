import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TutorList = ({ onSelectTutor }) => {
    const [tutors, setTutors] = useState([]);
    const [filter, setFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTutors();
    }, []);

    const fetchTutors = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/tutor/all-tutors', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Fetched Tutors:", res.data);
            setTutors(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching tutors:", error);
            setError("Failed to load tutors. Please try again later.");
            setLoading(false);
        }
    };

    const filteredTutors = tutors.filter(tutor =>
        (tutor.skills && tutor.skills.some(skill => skill.toLowerCase().includes(filter.toLowerCase()))) ||
        (tutor.name && tutor.name.toLowerCase().includes(filter.toLowerCase()))
    );

    if (loading) return <div className="tutor-container"><p>⏳ Loading available tutors...</p></div>;
    if (error) return <div className="tutor-container"><p className="error-message">❌ {error}</p></div>;

    return (
        <div className="tutor-container" style={{ padding: 'var(--space-8)' }}>
            <div className="section-header" style={{ marginBottom: 'var(--space-10)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Discovery Mode</p>
                  <h2 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 900 }}>👨‍🏫 Select a Tutor</h2>
                </div>
                <div className="filter-wrapper" style={{ position: 'relative', width: '320px' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }}>🔍</span>
                  <input
                      type="text"
                      placeholder="Search by skill or name..."
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="filter-input-premium"
                      style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '14px', border: '1px solid var(--slate-200)', background: 'white', boxSizing: 'border-box', fontWeight: 600, fontSize: '0.9rem' }}
                  />
                </div>
            </div>

            <div className="tutor-grid">
                {filteredTutors.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 'var(--space-20)', background: 'white', borderRadius: 'var(--radius-2xl)', border: '2px dashed var(--slate-200)' }}>
                        <p style={{ color: 'var(--slate-500)', fontWeight: 600 }}>No tutors found matching your search.</p>
                    </div>
                ) : filteredTutors.map(tutor => (
                    <div key={tutor._id} className="tutor-card-premium">
                        <div className="tutor-header-modern">
                            {tutor.profileImage ? (
                                <img src={tutor.profileImage} alt={tutor.name} className="avatar-box" style={{ objectFit: 'cover' }} />
                            ) : (
                                <div className="avatar-box">{tutor.name.charAt(0)}</div>
                            )}
                            <div className="tutor-info-header">
                                <h4>{tutor.name}</h4>
                                <div className="rating-badge-premium">
                                  <span style={{ color: '#fbbf24' }}>⭐</span>
                                  <span>{tutor.rating || '0.0'}</span>
                                </div>
                            </div>
                        </div>
                        <p className="bio-text">{tutor.bio.substring(0, 120)}...</p>
                        <div className="skills-row">
                            {tutor.skills.slice(0, 3).map(skill => (
                                <span key={skill} className="skill-pill">{skill}</span>
                            ))}
                            {tutor.skills.length > 3 && <span className="skill-pill-more">+{tutor.skills.length - 3} more</span>}
                        </div>
                        <button onClick={() => onSelectTutor(tutor)} className="select-tutor-btn">
                          View Professional Profile →
                        </button>
                    </div>
                ))}
            </div>

            <style>{`
                .tutor-card-premium {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(10px);
                    padding: var(--space-8);
                    border-radius: 24px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    height: 100%;
                }
                .tutor-card-premium:hover {
                    transform: translateY(-12px) scale(1.02);
                    box-shadow: 0 30px 60px -12px rgba(0,0,0,0.1);
                    border-color: var(--primary-300);
                    background: white;
                }
                .tutor-header-modern {
                    display: flex;
                    align-items: center;
                    gap: var(--space-4);
                    margin-bottom: var(--space-6);
                }
                .avatar-box {
                    width: 64px;
                    height: 64px;
                    min-width: 64px;
                    background: linear-gradient(135deg, var(--primary-600), var(--primary-400));
                    color: white;
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    font-weight: 800;
                    box-shadow: 0 8px 16px -4px rgba(79, 70, 229, 0.2);
                }
                .tutor-info-header h4 {
                    margin: 0 0 4px 0;
                    font-size: 1.15rem;
                    color: var(--slate-900);
                    font-weight: 800;
                }
                .rating-badge-premium {
                    background: #fef3c7;
                    color: #92400e;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    width: fit-content;
                }
                .bio-text {
                    color: var(--slate-500);
                    font-size: 0.9rem;
                    line-height: 1.6;
                    margin-bottom: var(--space-6);
                    flex-grow: 1;
                }
                .skills-row {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-bottom: var(--space-8);
                }
                .skill-pill {
                    background: var(--slate-50);
                    padding: 6px 12px;
                    border-radius: 10px;
                    font-size: 0.75rem;
                    color: var(--slate-700);
                    font-weight: 700;
                    border: 1px solid var(--slate-100);
                }
                .skill-pill-more {
                    color: var(--primary-600);
                    font-size: 0.75rem;
                    font-weight: 700;
                    align-self: center;
                }
                .select-tutor-btn {
                    width: 100%;
                    padding: 12px;
                    background: white;
                    color: var(--primary-600);
                    border: 2px solid var(--primary-600);
                    border-radius: 12px;
                    cursor: pointer;
                    font-weight: 800;
                    transition: 0.2s;
                    font-size: 0.9rem;
                }
                .select-tutor-btn:hover {
                    background: var(--primary-600);
                    color: white;
                    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
                }
                .filter-input-premium:focus {
                    outline: none;
                    border-color: var(--primary-400);
                    box-shadow: 0 0 0 4px var(--primary-50);
                }
            `}</style>
        </div>
    );
};

export default TutorList;
