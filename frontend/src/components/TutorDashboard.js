import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import StarRating from './StarRating';
import { tutorApi } from '../api/tutorApi';
import './TutorDashboard.css';

const TutorDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeView, setActiveView] = useState("dashboard");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enrollRequests, setEnrollRequests] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [uploading, setUploading] = useState(null); // ID of enrollment being uploaded to
    const [materialTitle, setMaterialTitle] = useState("");
    const [materialFile, setMaterialFile] = useState(null);
    const [materialDay, setMaterialDay] = useState("");
    const [replyText, setReplyText] = useState({}); // {doubtId: text}
    const [pointsAward, setPointsAward] = useState({}); // {enrollId: points}
    const [activeEnrollment, setActiveEnrollment] = useState(null); // Selected student for classroom view
    const [showUploadModal, setShowUploadModal] = useState(false);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const [dashRes, enrollRes] = await Promise.all([
                tutorApi.getDashboard(),
                axios.get("http://localhost:5000/api/enrollment/tutor-requests", {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            setData(dashRes.data);
            setEnrollRequests(enrollRes.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch dashboard data');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const view = params.get('view');
        setActiveView(view || 'dashboard');
    }, [location.search]);

    useEffect(() => {
        if (activeEnrollment) {
            const updated = enrollRequests.find(e => e._id === activeEnrollment._id);
            if (updated) setActiveEnrollment(updated);
        }
    }, [enrollRequests]);

    const handleApprove = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/enrollment/approve/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Access granted! ✅');
            fetchDashboardData();
        } catch (err) {
            alert('Approval failed');
        }
    };

    const handleUploadMaterial = async (e, id) => {
        e.preventDefault();
        if (!materialTitle || !materialFile || !materialDay) {
            alert("Please provide title, file and week number");
            return;
        }

        const formData = new FormData();
        formData.append("dayNumber", materialDay);
        formData.append("title", materialTitle);
        formData.append("file", materialFile);

        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/enrollment/upload-material/${id}`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Material uploaded for Week ' + materialDay + '! 📁');
            setMaterialTitle("");
            setMaterialFile(null);
            setMaterialDay("");
            setUploading(null);
            fetchDashboardData();
        } catch (err) {
            alert('Upload failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleReplyDoubt = async (enrollId, materialId, doubtId, answer) => {
        try {
            if (!answer || !answer.trim()) {
                alert("Please type an answer before sending.");
                return;
            }
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/enrollment/reply-doubt/${enrollId}/${materialId}/${doubtId}`, { answer }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Reply sent! ✅");
            fetchDashboardData();
        } catch (err) { alert("Failed to reply"); }
    };

    const handleAwardPoints = async (enrollId, manualPoints) => {
        try {
            const token = localStorage.getItem('token');
            const pointsToAward = manualPoints || pointsAward[enrollId];
            await axios.put(`http://localhost:5000/api/enrollment/award-points/${enrollId}`, { points: pointsToAward }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Points awarded! ⭐");
            fetchDashboardData();
        } catch (err) { alert("Failed to award points"); }
    };

    const handleNudge = async (enrollId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/enrollment/nudge/${enrollId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Student notified! 🔔");
            fetchDashboardData();
        } catch (err) { alert("Failed to nudge"); }
    };

    if (loading) return <div className="loading">Loading Dashboard...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!data) return null;

    const { profile, stats, reviews, courses } = data;

    const renderContent = () => {
        switch (activeView) {
            case 'students':
                const completed = enrollRequests.filter(req => req.status === 'approved' && req.isCompleted);
                const ongoing = enrollRequests.filter(req => req.status === 'approved' && !req.isCompleted);
                const pending = enrollRequests.filter(req => req.status === 'paid');

                return (
                    <section className="students-view-premium">
                        {pending.length > 0 && (
                            <div className="section-block">
                                <div className="section-headline">
                                    <div className="headline-icon warn">🎟️</div>
                                    <h3>New Enrollment Requests</h3>
                                </div>
                                <div className="students-grid-big">
                                    {pending.map(req => (
                                        <div key={req._id} className="student-card-big pending">
                                            <div className="card-accent-warn"></div>
                                            <div className="card-body">
                                                <div className="student-profile-main">
                                                    <div className="avatar-big warn">{req.studentId?.name?.charAt(0)}</div>
                                                    <div className="student-info">
                                                        <h4>{req.studentId?.name}</h4>
                                                        <p className="course-ref">{req.courseTitle}</p>
                                                    </div>
                                                </div>
                                                <div className="card-footer-premium">
                                                    <span className="status-label">Awaiting Approval</span>
                                                    <button onClick={() => handleApprove(req._id)} className="action-btn-premium success">Grant Access ✨</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="section-block">
                            <div className="section-headline">
                                <div className="headline-icon primary">📖</div>
                                <h3>Ongoing Learning</h3>
                            </div>
                            {ongoing.length === 0 ? (
                                <div className="empty-state-card">No active students at the moment.</div>
                            ) : (
                                <div className="students-grid-big">
                                    {ongoing.map(req => (
                                        <div key={req._id} className="student-card-big">
                                            <div className="card-body">
                                                <div className="student-profile-main">
                                                    <div className="avatar-big">{req.studentId?.name?.charAt(0)}</div>
                                                    <div className="student-info">
                                                        <h4>{req.studentId?.name}</h4>
                                                        <p className="course-ref">{req.courseTitle}</p>
                                                    </div>
                                                </div>
                                                <div className="progress-container-premium">
                                                    <div className="progress-lbl">
                                                        <span>Learning Progress</span>
                                                        <span>{req.progress}%</span>
                                                    </div>
                                                    <div className="progress-bar-bg">
                                                        <div className="progress-bar-fill" style={{ width: `${req.progress}%` }}></div>
                                                    </div>
                                                </div>
                                                <div className="card-footer-premium">
                                                    <div className="activity-stamp">Last check-in: {new Date(req.updatedAt).toLocaleDateString()}</div>
                                                    <button onClick={() => { setActiveEnrollment(req); setActiveView('tutor-classroom'); }} className="action-btn-premium primary">Open Classroom →</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="section-block">
                            <div className="section-headline">
                                <div className="headline-icon success">🎓</div>
                                <h3>Completed Students</h3>
                            </div>
                            {completed.length === 0 ? (
                                <div className="empty-state-card">No students have finished their courses yet.</div>
                            ) : (
                                <div className="students-grid-big">
                                    {completed.map(req => (
                                        <div key={req._id} className="student-card-big completed">
                                            <div className="card-body">
                                                <div className="student-profile-main">
                                                    <div className="avatar-big success">{req.studentId?.name?.charAt(0)}</div>
                                                    <div className="student-info">
                                                        <h4>{req.studentId?.name}</h4>
                                                        <p className="course-ref">{req.courseTitle}</p>
                                                    </div>
                                                </div>
                                                <div className="rating-summary-box">
                                                    <p className="lbl">Their Feedback</p>
                                                    <StarRating value={req.finalRating} readOnly={true} size="1.25rem" />
                                                    <p className="feedback-snippet">"{req.finalReview?.substring(0, 80)}..."</p>
                                                </div>
                                                <div className="card-footer-premium">
                                                    <span className="completion-badge">COMPLETED</span>
                                                    <button onClick={() => { setActiveEnrollment(req); setActiveView('tutor-classroom'); }} className="action-btn-premium slate">View Full Review →</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                );
            case 'tutor-classroom':
                if (!activeEnrollment) return <div className="empty-state-card">Select a student from "My Students" to manage their classroom.</div>;
                const req = activeEnrollment;

                return (
                    <section className="teaching-hub-premium">
                        <div className="hub-sidebar-glass">
                            <div className="student-profile-hub">
                                <div className="avatar-huge">{req.studentId?.name?.charAt(0)}</div>
                                <h3>{req.studentId?.name}</h3>
                                <p className="course-name">{req.courseTitle}</p>
                                <div className="progress-mini">
                                    <div className="bar-bg"><div className="bar-fill" style={{ width: `${req.progress}%` }}></div></div>
                                    <span>{req.progress}% Complete</span>
                                </div>
                            </div>
                            <nav className="hub-nav">
                                <button className="hub-nav-item active">📚 Learning Track</button>
                                <button onClick={() => {
                                    const pts = prompt("How many points to award? (0-100)");
                                    if(pts) handleAwardPoints(req._id, pts);
                                }} className="hub-nav-item">⭐ Award Overall Points</button>
                                <button onClick={() => handleNudge(req._id)} className="hub-nav-item">🔔 Nudge Student</button>
                                <button onClick={() => setActiveView('students')} className="hub-nav-item back">← All Students</button>
                            </nav>
                        </div>

                        <div className="hub-main-content">
                            <div className="hub-section-card">
                                <div className="section-header-row">
                                    <h3>Resource Center</h3>
                                    <button onClick={() => setShowUploadModal(true)} className="upload-trigger-btn">＋ Upload New Material</button>
                                </div>
                                
                                <div className="materials-timeline">
                                    {req.materials?.sort((a,b)=>a.dayNumber-b.dayNumber).map((m, idx) => (
                                        <div key={idx} className="material-node">
                                            <div className="node-marker">Week {m.dayNumber}</div>
                                            <div className="node-content">
                                                <div className="node-top">
                                                    <h4>{m.title}</h4>
                                                    <span className="file-type">Resource</span>
                                                </div>
                                                <div className="node-feedback-box">
                                                    <p className="lbl">Student Feedback</p>
                                                    <p className="txt">{m.feedback || "Awaiting study completion..."}</p>
                                                </div>
                                                {m.doubts?.length > 0 && (
                                                    <div className="doubts-hub">
                                                        <h5>Question & Answer</h5>
                                                        {m.doubts.map((d, i) => (
                                                            <div key={i} className={`doubt-chat ${d.answer ? 'resolved' : 'pending'}`}>
                                                                <div className="q-bubble">
                                                                    <span className="q-lbl">Q</span>
                                                                    <p>{d.question}</p>
                                                                </div>
                                                                {d.answer ? (
                                                                    <div className="a-bubble">
                                                                        <span className="a-lbl">A</span>
                                                                        <p>{d.answer}</p>
                                                                    </div>
                                                                ) : (
                                                                    <div className="reply-form-premium">
                                                                        <textarea 
                                                                            id={`reply-${idx}-${i}`} 
                                                                            placeholder="Type your expert answer here..."
                                                                            rows="2"
                                                                        />
                                                                        <button onClick={() => {
                                                                            const ans = document.getElementById(`reply-${idx}-${i}`).value;
                                                                            handleReplyDoubt(req._id, m._id, d._id, ans);
                                                                        }} className="submit-reply-btn">Send Answer →</button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="reward-node-box">
                                                    <p className="lbl">Week {m.dayNumber} Status</p>
                                                    <div className="reward-actions">
                                                        <span className={`status-badge-modern ${m.status}`}>{m.status.toUpperCase()}</span>
                                                        <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="view-file-link">View File 📄</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!req.materials || req.materials.length === 0) && (
                                        <div className="empty-materials">
                                            <p>No materials uploaded yet. Start the learning journey by uploading Week 1 resources!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {showUploadModal && (
                            <div className="modal-overlay">
                                <div className="modal-content-premium">
                                    <div className="modal-header-accent"></div>
                                    <div className="modal-inner">
                                        <button className="modal-close" onClick={() => setShowUploadModal(false)}>×</button>
                                        <h2>Upload Learning Material</h2>
                                        <p className="modal-sub">Create a new milestone for {req.studentId?.name}</p>
                                        
                                        <form className="upload-form-premium" onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.target);
                                            // Extract fields for manual handling if needed, but the backend expect multipart
                                            const title = formData.get('title');
                                            const day = formData.get('dayNumber');
                                            const file = formData.get('file');
                                            
                                            // Call the original handler with manual state override or just use the local state
                                            // For simplicity, let's use the handler from the component scope
                                            setMaterialTitle(title);
                                            setMaterialDay(day);
                                            setMaterialFile(file);
                                            handleUploadMaterial(e, req._id);
                                            setShowUploadModal(false);
                                        }}>
                                            <div className="form-group-modern">
                                                <label>Material Title</label>
                                                <input name="title" placeholder="e.g. Introduction to Physics" required />
                                            </div>
                                            <div className="form-row-modern">
                                                <div className="form-group-modern">
                                                    <label>Week Number</label>
                                                    <input name="dayNumber" type="number" placeholder="1" required />
                                                </div>
                                                <div className="form-group-modern">
                                                    <label>Context/Note (Optional)</label>
                                                    <input name="nudge" placeholder="Read this carefully..." />
                                                </div>
                                            </div>
                                            <div className="form-group-modern">
                                                <label>Resource File (PDF)</label>
                                                <div className="file-input-wrapper">
                                                    <input name="file" type="file" accept="application/pdf" required />
                                                </div>
                                            </div>
                                            <div className="form-actions-modal">
                                                <button type="button" onClick={() => setShowUploadModal(false)} className="cancel-btn">Cancel</button>
                                                <button type="submit" className="submit-btn-premium">Publish Resource 🚀</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                );
            case 'courses':
                return (
                    <section className="courses-view-premium">
                        <div className="view-header">
                            <h2>Assigned Courses</h2>
                            <p>Manage the curriculum for the courses you mentor.</p>
                        </div>
                        <div className="courses-grid-big">
                            {courses.map(course => (
                                <div key={course._id} className="course-card-big-expert">
                                    <div className="course-icon-holder-expert">📚</div>
                                    <div className="course-card-content">
                                        <div className="course-top-meta">
                                            <span className="price-label">₹{course.price}</span>
                                            <span className="expert-badge">Mentor Pick</span>
                                        </div>
                                        <h3>{course.title}</h3>
                                        <p className="course-desc-expert">{course.description}</p>
                                        <div className="course-stats-expert">
                                            <div className="stat-chunk">
                                                <span className="val">{course.duration}</span>
                                                <span className="lbl">Weeks</span>
                                            </div>
                                            <div className="stat-chunk">
                                                <span className="val">{enrollRequests.filter(r => r.courseTitle === course.title).length}</span>
                                                <span className="lbl">Enrolled</span>
                                            </div>
                                        </div>
                                        <button onClick={() => { setSelectedCourse(course); }} className="expert-course-btn">View Full Curriculum →</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Course Details Modal */}
                        {selectedCourse && (
                            <div className="modal-overlay" onClick={() => setSelectedCourse(null)}>
                                <div className="modal-content-premium" onClick={e => e.stopPropagation()}>
                                    <button className="modal-close" onClick={() => setSelectedCourse(null)}>&times;</button>
                                    <div className="modal-header-accent"></div>
                                    <div className="modal-inner">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
                                            <div>
                                                <h2 style={{ fontSize: '1.75rem', color: 'var(--slate-900)', marginBottom: '8px' }}>{selectedCourse.title}</h2>
                                                <p style={{ color: 'var(--primary-600)', fontWeight: 700, fontSize: '1.1rem' }}>Admin Assigned Curriculum</p>
                                            </div>
                                            <div className="modal-price-badge">₹{selectedCourse.price}</div>
                                        </div>

                                        <div className="details-grid-premium">
                                            <div className="details-main-info">
                                                <h4 style={{ color: 'var(--slate-800)', marginBottom: '12px' }}>Course Description</h4>
                                                <p style={{ color: 'var(--slate-600)', lineHeight: 1.6, fontSize: '0.95rem' }}>{selectedCourse.description}</p>
                                                
                                                <h4 style={{ color: 'var(--slate-800)', marginTop: '24px', marginBottom: '12px' }}>What students will learn:</h4>
                                                <div className="skills-grid-modal">
                                                    {selectedCourse.skills?.map((skill, i) => (
                                                        <div key={i} className="skill-check-item">
                                                            <span className="check-icon">✓</span> {skill}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="details-sidebar-info">
                                                <div className="sidebar-stat-box">
                                                    <span className="lbl">Duration</span>
                                                    <span className="val">{selectedCourse.duration}</span>
                                                </div>
                                                <div className="sidebar-stat-box">
                                                    <span className="lbl">Instructor</span>
                                                    <span className="val">{selectedCourse.instructor}</span>
                                                </div>
                                                <div className="sidebar-stat-box">
                                                    <span className="lbl">Level</span>
                                                    <span className="val">Professional</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer-premium">
                                        <button onClick={() => setSelectedCourse(null)} className="close-action-btn">Close Details</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                );
            default:
                const doubts = [];
                enrollRequests.forEach(req => {
                    req.materials?.forEach(m => {
                        m.doubts?.forEach(d => {
                            if (!d.answer) {
                                doubts.push({
                                    enrollId: req._id,
                                    studentName: req.studentId?.name,
                                    course: req.courseTitle,
                                    day: m.dayNumber,
                                    question: d.question,
                                    date: d.askedAt
                                });
                            }
                        });
                    });
                });
                const newRequests = enrollRequests.filter(r => r.status === 'paid');
                const allFeedbacks = [];
                enrollRequests.forEach(req => {
                    req.materials?.forEach(m => {
                        if (m.feedback) {
                            allFeedbacks.push({
                                studentName: req.studentId?.name,
                                course: req.courseTitle,
                                day: m.dayNumber,
                                text: m.feedback,
                                date: m.updatedAt || req.updatedAt
                            });
                        }
                    });
                });
                const sortedFeedbacks = allFeedbacks.sort((a,b) => new Date(b.date) - new Date(a.date));

                return (
                    <div className="dashboard-grid-premium">
                        <section className="profile-card-premium">
                            <div className="profile-background-mesh"></div>
                            <div className="profile-content-overlay">
                                <div className="profile-top-row">
                                    {profile.profileImage ? (
                                        <img src={profile.profileImage} alt={profile.name} className="expert-avatar" />
                                    ) : (
                                        <div className="expert-avatar-placeholder">{profile.name?.charAt(0)}</div>
                                    )}
                                    <div className="expert-meta">
                                        <span className="expert-label">Verified Expert</span>
                                        <h3>{profile.name}</h3>
                                        <p>{profile.email}</p>
                                    </div>
                                </div>
                                <div className="expert-bio-box">
                                    <p><strong>Bio:</strong> {profile.bio}</p>
                                    <p><strong>Exp:</strong> {profile.experience} Years Professional Experience</p>
                                </div>
                                <div className="specialties-box">
                                    <p className="lbl">Specialties</p>
                                    <div className="tags-premium">
                                        {profile.languagesSpecialist.map((lang, idx) => (
                                            <span key={idx} className="tag-modern">{lang}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="stats-center-column">
                            <div className="performance-hub-card">
                                <h3>Performance Summary</h3>
                                <div className="stats-mini-grid">
                                    <div className="glass-stat-card">
                                        <span className="stat-val" style={{ color: '#fbbf24' }}>⭐ {stats.averageRating}</span>
                                        <span className="stat-lbl">Avg. Rating</span>
                                    </div>
                                    <div className="glass-stat-card">
                                        <span className="stat-val">{stats.totalReviews}</span>
                                        <span className="stat-lbl">Total Reviews</span>
                                    </div>
                                    <div className="glass-stat-card">
                                        <span className="stat-val">{enrollRequests.filter(r => r.status === 'approved').length}</span>
                                        <span className="stat-lbl">Active Students</span>
                                    </div>
                                    <div className="glass-stat-card">
                                        <span className="stat-val">{courses?.length || 0}</span>
                                        <span className="stat-lbl">Assigned Courses</span>
                                    </div>
                                </div>
                            </div>

                            <section className="activity-hub-card">
                                <div className="hub-header">
                                    <h3>Activity Center</h3>
                                    <div className="pulse-indicator"></div>
                                </div>
                                
                                <div className="hub-content">
                                    {doubts.length === 0 && newRequests.length === 0 && sortedFeedbacks.length === 0 ? (
                                        <p className="empty-hub-text">No recent activity detected.</p>
                                    ) : (
                                        <div className="timeline-activity">
                                            {newRequests.map(req => (
                                                <div key={req._id} className="activity-item pending">
                                                    <div className="activity-icon">🎟️</div>
                                                    <div className="activity-details">
                                                        <p><strong>Enrollment Request</strong> from {req.studentId?.name}</p>
                                                        <span>Course: {req.courseTitle}</span>
                                                        <button onClick={() => setActiveView('students')} className="hub-action-btn">Manage →</button>
                                                    </div>
                                                </div>
                                            ))}
                                            {doubts.sort((a,b) => new Date(b.date) - new Date(a.date)).map((d, i) => (
                                                <div key={i} className="activity-item doubt">
                                                    <div className="activity-icon">❓</div>
                                                    <div className="activity-details">
                                                        <p><strong>New Doubt</strong> asked by {d.studentName}</p>
                                                        <span>"{d.question.substring(0, 40)}..."</span>
                                                        <button onClick={() => {
                                                            const req = enrollRequests.find(r => r._id === d.enrollId);
                                                            setActiveEnrollment(req);
                                                            setActiveView('tutor-classroom');
                                                        }} className="hub-action-btn">Reply →</button>
                                                    </div>
                                                </div>
                                            ))}
                                            {sortedFeedbacks.slice(0, 5).map((f, i) => (
                                                <div key={i} className="activity-item feedback">
                                                    <div className="activity-icon">💬</div>
                                                    <div className="activity-details">
                                                        <p><strong>Feedback received</strong> for Week {f.day}</p>
                                                        <span>"{f.text.substring(0, 40)}..."</span>
                                                        <p className="student-ref">-{f.studentName}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="dashboard-container" style={{ display: 'block', maxWidth: '1440px', margin: '0 auto' }}>
            <div className="tutor-content" style={{ padding: 'var(--space-8)', background: 'var(--slate-50)', minHeight: 'calc(100vh - var(--header-height))' }}>
                <header className="dashboard-header" style={{ marginBottom: 'var(--space-10)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Expert Panel</p>
                        <h1>Tutor Dashboard 👋</h1>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                        <button className="update-btn" onClick={() => navigate('/update-profile')}>Edit Profile</button>
                    </div>
                </header>

                {renderContent()}
            </div>

            <style>{`
                .dashboard-grid-premium { display: grid; grid-template-columns: 380px 1fr; gap: var(--space-8); }
                .profile-card-premium { background: white; border-radius: 32px; overflow: hidden; position: relative; box-shadow: var(--shadow-xl); height: fit-content; }
                .profile-background-mesh { position: absolute; top: 0; left: 0; width: 100%; height: 160px; background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%); z-index: 1; }
                .profile-content-overlay { position: relative; z-index: 2; padding: var(--space-8); padding-top: 80px; }
                .profile-top-row { display: flex; align-items: flex-end; gap: var(--space-6); margin-bottom: var(--space-8); }
                .expert-avatar { width: 110px; height: 110px; border-radius: 28px; border: 6px solid white; object-fit: cover; box-shadow: var(--shadow-lg); }
                .expert-avatar-placeholder { width: 110px; height: 110px; border-radius: 28px; border: 6px solid white; background: var(--primary-600); color: white; display: flex; align-items: center; justify-content: center; font-size: 3rem; font-weight: 900; box-shadow: var(--shadow-lg); }
                .expert-meta h3 { margin: 0 0 4px 0; font-size: 1.5rem; color: var(--slate-900); font-weight: 800; }
                .expert-meta p { margin: 0; font-size: 0.9rem; color: var(--slate-500); }
                .expert-label { display: block; background: var(--primary-100); color: var(--primary-700); padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; width: fit-content; margin-bottom: 8px; }
                .expert-bio-box { background: var(--slate-50); padding: var(--space-6); border-radius: 20px; margin-bottom: var(--space-8); border: 1px solid var(--slate-100); }
                .expert-bio-box p { margin: 0 0 8px 0; font-size: 0.95rem; color: var(--slate-600); line-height: 1.6; }
                .expert-bio-box p:last-child { margin-bottom: 0; font-weight: 800; color: var(--primary-600); }
                .specialties-box .lbl { font-size: 0.875rem; font-weight: 800; color: var(--slate-700); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
                .tags-premium { display: flex; flex-wrap: wrap; gap: 8px; }
                .tag-modern { background: white; border: 1px solid var(--slate-200); color: var(--slate-600); padding: 6px 14px; border-radius: 12px; font-size: 0.85rem; font-weight: 700; box-shadow: var(--shadow-sm); }

                .stats-center-column { display: flex; flex-direction: column; gap: var(--space-8); }
                .performance-hub-card { background: white; border-radius: 32px; padding: var(--space-8); box-shadow: var(--shadow-xl); border: 1px solid var(--slate-50); }
                .performance-hub-card h3 { margin: 0 0 24px 0; font-size: 1.25rem; font-weight: 800; color: var(--slate-900); }
                .stats-mini-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-6); }
                .glass-stat-card { background: rgba(248, 250, 252, 0.8); backdrop-filter: blur(8px); padding: var(--space-6); border-radius: 24px; border: 1px solid white; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
                .stat-val { font-size: 2rem; font-weight: 900; color: var(--primary-600); line-height: 1; margin-bottom: 8px; }
                .stat-lbl { font-size: 0.8rem; color: var(--slate-400); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }

                .activity-hub-card { background: white; border-radius: 32px; padding: var(--space-8); box-shadow: var(--shadow-xl); border: 1px solid var(--slate-50); }
                .hub-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .hub-header h3 { margin: 0; font-size: 1.25rem; font-weight: 800; color: var(--slate-900); }
                .pulse-indicator { width: 12px; height: 12px; background: var(--success); border-radius: 50%; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); animation: pulse 2s infinite; }
                @keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
                .timeline-activity { display: flex; flex-direction: column; gap: var(--space-4); }
                .activity-item { display: flex; gap: var(--space-4); padding: var(--space-4); border-radius: 20px; background: var(--slate-50); border: 1px solid var(--slate-100); transition: 0.3s; }
                .activity-item:hover { transform: translateX(8px); background: white; border-color: var(--primary-200); box-shadow: var(--shadow-lg); }
                .activity-icon { width: 44px; height: 44px; min-width: 44px; border-radius: 14px; background: white; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; box-shadow: var(--shadow-sm); }
                .activity-details { flex-grow: 1; }
                .activity-details p { margin: 0; font-size: 0.95rem; color: var(--slate-800); }
                .activity-details span { font-size: 0.8rem; color: var(--slate-500); }
                .student-ref { margin: 4px 0 0 0 !important; color: var(--primary-600) !important; font-weight: 800; }
                .hub-action-btn { margin-top: 10px; background: none; border: none; color: var(--primary-600); font-weight: 800; cursor: pointer; padding: 0; font-size: 0.875rem; }
                .empty-hub-text { text-align: center; color: var(--slate-400); padding: 40px 0; }
                .teaching-hub-premium { display: grid; grid-template-columns: 320px 1fr; gap: var(--space-8); background: var(--slate-50); border-radius: 32px; overflow: hidden; height: 800px; }
                .hub-sidebar-glass { background: white; border-right: 1px solid var(--slate-100); padding: var(--space-10) var(--space-6); display: flex; flex-direction: column; }
                .student-profile-hub { text-align: center; margin-bottom: var(--space-10); }
                .avatar-huge { width: 100px; height: 100px; border-radius: 32px; background: var(--primary-600); color: white; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 900; box-shadow: var(--shadow-xl); }
                .student-profile-hub h3 { margin: 0 0 4px 0; font-size: 1.25rem; font-weight: 800; color: var(--slate-900); }
                .student-profile-hub .course-name { margin: 0 0 20px 0; font-size: 0.85rem; color: var(--slate-500); font-weight: 600; }
                .progress-mini { width: 100%; }
                .progress-mini .bar-bg { height: 8px; background: var(--slate-100); border-radius: 4px; overflow: hidden; margin-bottom: 8px; }
                .progress-mini .bar-fill { height: 100%; background: var(--primary-600); border-radius: 4px; transition: 1s; }
                .progress-mini span { font-size: 0.75rem; font-weight: 800; color: var(--slate-600); }
                .hub-nav { display: flex; flex-direction: column; gap: 8px; margin-top: auto; }
                .hub-nav-item { padding: 14px 20px; border-radius: 14px; border: none; background: transparent; text-align: left; font-weight: 700; color: var(--slate-600); cursor: pointer; transition: 0.2s; }
                .hub-nav-item:hover { background: var(--slate-50); color: var(--primary-600); }
                .hub-nav-item.active { background: var(--primary-50); color: var(--primary-700); }
                .hub-nav-item.back { margin-top: 20px; color: var(--slate-400); font-size: 0.85rem; }

                .hub-main-content { padding: var(--space-8); overflow-y: auto; }
                .hub-section-card { background: white; border-radius: 24px; padding: var(--space-8); box-shadow: var(--shadow-sm); border: 1px solid var(--slate-50); }
                .section-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-8); border-bottom: 2px solid var(--slate-50); padding-bottom: 20px; }
                .section-header-row h3 { margin: 0; font-size: 1.5rem; font-weight: 800; }
                .upload-trigger-btn { background: var(--primary-600); color: white; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.2s; }
                .upload-trigger-btn:hover { background: var(--primary-700); transform: translateY(-2px); }

                .materials-timeline { display: flex; flex-direction: column; gap: var(--space-10); position: relative; }
                .materials-timeline::before { content: ''; position: absolute; left: 24px; top: 0; bottom: 0; width: 2px; background: var(--slate-100); }
                .material-node { display: grid; grid-template-columns: 48px 1fr; gap: var(--space-4); position: relative; }
                .node-marker { width: 48px; height: 48px; background: white; border: 2px solid var(--primary-600); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 900; color: var(--primary-600); z-index: 2; box-shadow: 0 0 0 6px white; }
                .node-content { background: var(--slate-50); border: 1px solid var(--slate-100); border-radius: 20px; padding: var(--space-6); transition: 0.3s; }
                .node-content:hover { border-color: var(--primary-200); background: white; box-shadow: var(--shadow-md); }
                .node-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
                .node-top h4 { margin: 0; font-size: 1.15rem; font-weight: 800; color: var(--slate-900); }
                .file-type { font-size: 0.7rem; font-weight: 800; color: var(--primary-600); background: var(--primary-100); padding: 4px 10px; border-radius: 6px; }
                .node-feedback-box { background: rgba(255,255,255,0.8); padding: 14px; border-radius: 12px; margin-bottom: 16px; }
                .node-feedback-box .lbl { font-size: 0.75rem; font-weight: 800; color: var(--slate-400); text-transform: uppercase; margin-bottom: 4px; }
                .node-feedback-box .txt { margin: 0; font-size: 0.9rem; color: var(--slate-600); font-style: italic; }
                
                .doubts-hub { background: white; border-radius: 14px; padding: 16px; border: 1px solid var(--slate-200); margin-bottom: 16px; }
                .doubts-hub h5 { margin: 0 0 16px 0; font-size: 0.9rem; font-weight: 800; color: var(--slate-800); }
                .doubt-chat { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--slate-50); }
                .doubt-chat:last-child { margin-bottom: 0; padding-bottom: 0; border: none; }
                .q-bubble, .a-bubble { display: flex; gap: 12px; }
                .q-lbl, .a-lbl { width: 24px; height: 24px; min-width: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 900; }
                .q-lbl { background: var(--primary-100); color: var(--primary-600); }
                .a-lbl { background: var(--success-100); color: var(--success); }
                .q-bubble p, .a-bubble p { margin: 0; font-size: 0.875rem; color: var(--slate-700); line-height: 1.5; }
                .reply-form-premium { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
                .reply-form-premium textarea { width: 100%; border: 1px solid var(--slate-200); border-radius: 10px; padding: 12px; font-size: 0.85rem; background: var(--slate-50); }
                .submit-reply-btn { background: var(--primary-600); color: white; border: none; padding: 8px 16px; border-radius: 10px; font-weight: 800; font-size: 0.85rem; align-self: flex-end; cursor: pointer; }
                
                .reward-node-box { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--slate-100); padding-top: 16px; }
                .reward-node-box .lbl { font-size: 0.75rem; font-weight: 800; color: var(--slate-400); text-transform: uppercase; }
                .reward-actions { display: flex; align-items: center; gap: 12px; }
                .points-badge { font-size: 0.9rem; font-weight: 800; color: var(--warning-700); background: var(--warning-100); padding: 4px 12px; border-radius: 10px; }
                .award-mini-btn { background: none; border: none; color: var(--primary-600); font-weight: 800; font-size: 0.75rem; cursor: pointer; }

                .students-view-premium { display: flex; flex-direction: column; gap: var(--space-10); }
                .section-block { margin-bottom: var(--space-8); }
                .section-headline { display: flex; align-items: center; gap: var(--space-4); margin-bottom: var(--space-6); }
                .headline-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
                .headline-icon.warn { background: var(--warning-100); color: var(--warning-700); }
                .headline-icon.primary { background: var(--primary-100); color: var(--primary-600); }
                .headline-icon.success { background: var(--success-100); color: var(--success); }
                .section-headline h3 { margin: 0; font-size: 1.25rem; font-weight: 800; color: var(--slate-800); }

                .students-grid-big { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-8); }
                .student-card-big { background: white; border-radius: 32px; border: 1px solid var(--slate-100); overflow: hidden; box-shadow: var(--shadow-xl); transition: 0.3s; position: relative; }
                .student-card-big:hover { transform: translateY(-4px); box-shadow: var(--shadow-2xl); border-color: var(--primary-200); }
                .card-accent-warn { height: 6px; background: var(--warning-400); }
                .card-body { padding: var(--space-8); }
                .student-profile-main { display: flex; align-items: center; gap: var(--space-4); margin-bottom: var(--space-6); }
                .avatar-big { width: 64px; height: 64px; border-radius: 20px; background: var(--slate-100); color: var(--slate-700); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 900; }
                .avatar-big.warn { background: var(--warning-100); color: var(--warning-700); }
                .avatar-big.success { background: var(--success-100); color: var(--success); }
                .student-info h4 { margin: 0 0 4px 0; font-size: 1.15rem; font-weight: 800; color: var(--slate-900); }
                .student-info .course-ref { margin: 0; font-size: 0.85rem; color: var(--primary-600); font-weight: 700; }

                .progress-container-premium { margin-bottom: var(--space-6); background: var(--slate-50); padding: 16px; border-radius: 16px; }
                .progress-lbl { display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 800; color: var(--slate-500); text-transform: uppercase; margin-bottom: 8px; }
                .progress-bar-bg { height: 8px; background: var(--slate-200); border-radius: 4px; overflow: hidden; }
                .progress-bar-fill { height: 100%; background: var(--primary-600); border-radius: 4px; transition: 1s cubic-bezier(0.16, 1, 0.3, 1); }

                .card-footer-premium { display: flex; justify-content: space-between; align-items: center; margin-top: auto; border-top: 1px solid var(--slate-50); pt: var(--space-4); }
                .activity-stamp { font-size: 0.75rem; color: var(--slate-400); font-weight: 600; }
                .action-btn-premium { padding: 10px 20px; border-radius: 12px; border: none; font-weight: 800; cursor: pointer; transition: 0.2s; font-size: 0.85rem; }
                .action-btn-premium.success { background: var(--success); color: white; }
                .action-btn-premium.primary { background: var(--primary-600); color: white; }
                .action-btn-premium.slate { background: var(--slate-900); color: white; }
                .action-btn-premium:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); opacity: 0.9; }

                .rating-summary-box { background: var(--slate-50); padding: 16px; border-radius: 16px; margin-bottom: var(--space-6); }
                .rating-summary-box .lbl { font-size: 0.75rem; font-weight: 800; color: var(--slate-400); text-transform: uppercase; margin-bottom: 8px; }
                .feedback-snippet { font-size: 0.85rem; color: var(--slate-600); font-style: italic; margin-top: 8px; line-height: 1.5; }
                .completion-badge { font-size: 0.7rem; font-weight: 900; color: var(--success); background: var(--success-50); padding: 4px 10px; border-radius: 8px; }

                .courses-view-premium { }
                .view-header { margin-bottom: var(--space-8); }
                .view-header h2 { margin: 0 0 8px 0; font-size: 2rem; font-weight: 900; }
                .course-card-big-expert { background: white; border-radius: 32px; overflow: hidden; box-shadow: var(--shadow-xl); border: 1px solid var(--slate-100); transition: 0.3s; display: flex; position: relative; }
                .course-card-big-expert:hover { transform: translateY(-4px); box-shadow: var(--shadow-2xl); border-color: var(--primary-100); }
                .course-icon-holder-expert { width: 120px; background: var(--primary-600); display: flex; align-items: center; justify-content: center; font-size: 3rem; color: white; font-weight: 900; opacity: 0.9; }
                .course-card-content { flex-grow: 1; padding: var(--space-8); }
                .course-top-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
                .price-label { font-size: 1.25rem; font-weight: 900; color: var(--success); }
                .expert-badge { background: var(--primary-50); color: var(--primary-600); padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; }
                .course-desc-expert { color: var(--slate-500); font-size: 0.95rem; line-height: 1.6; margin: 12px 0 24px 0; }
                .course-stats-expert { display: flex; gap: var(--space-10); margin-bottom: 24px; }
                .stat-chunk { display: flex; flex-direction: column; }
                .stat-chunk .val { font-size: 1.25rem; font-weight: 900; color: var(--slate-900); }
                .stat-chunk .lbl { font-size: 0.75rem; font-weight: 700; color: var(--slate-400); text-transform: uppercase; }
                .expert-course-btn { width: fit-content; min-width: 220px; padding: 14px 28px; border-radius: 16px; background: var(--slate-900); color: white; border: none; font-weight: 800; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: auto; }
                .expert-course-btn:hover { background: black; transform: scale(1.02); box-shadow: var(--shadow-lg); }

                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
                .modal-content-premium { background: white; width: 100%; max-width: 850px; border-radius: 32px; overflow: hidden; position: relative; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); animation: modalIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes modalIn { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                .modal-close { position: absolute; top: 20px; right: 28px; background: none; border: none; font-size: 2rem; color: var(--slate-400); cursor: pointer; z-index: 10; transition: 0.2s; }
                .modal-close:hover { color: var(--slate-900); transform: rotate(90deg); }
                .modal-header-accent { height: 8px; background: linear-gradient(90deg, var(--primary-500), var(--primary-700)); }
                .modal-inner { padding: var(--space-10); max-height: 80vh; overflow-y: auto; }
                .modal-price-badge { background: var(--success-50); color: var(--success); padding: 8px 20px; border-radius: 12px; font-weight: 900; font-size: 1.25rem; }
                
                .details-grid-premium { display: grid; grid-template-columns: 1fr 280px; gap: var(--space-10); margin-top: var(--space-10); border-top: 2px solid var(--slate-50); padding-top: var(--space-8); }
                .details-sidebar-info { display: flex; flex-direction: column; gap: 16px; }
                .sidebar-stat-box { background: var(--slate-50); padding: 20px; border-radius: 20px; border: 1px solid var(--slate-100); }
                .sidebar-stat-box .lbl { font-size: 0.7rem; font-weight: 800; color: var(--slate-400); text-transform: uppercase; display: block; margin-bottom: 4px; }
                .sidebar-stat-box .val { font-size: 1.1rem; font-weight: 800; color: var(--slate-900); }
                
                .skills-grid-modal { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                .skill-check-item { display: flex; align-items: center; gap: 10px; font-size: 0.95rem; color: var(--slate-600); font-weight: 600; }
                .check-icon { width: 20px; height: 20px; background: var(--success-100); color: var(--success); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 900; }
                
                .modal-footer-premium { padding: var(--space-6) var(--space-10); background: var(--slate-50); border-top: 1px solid var(--slate-100); display: flex; justify-content: flex-end; }
                .close-action-btn { background: var(--slate-900); color: white; border: none; padding: 12px 28px; border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.2s; }
                .close-action-btn:hover { background: black; }

                .form-group-modern { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
                .form-group-modern label { font-size: 0.875rem; font-weight: 800; color: var(--slate-700); }
                .form-group-modern input { background: var(--slate-50); border: 1px solid var(--slate-200); padding: 12px 16px; border-radius: 12px; font-size: 1rem; transition: 0.3s; }
                .form-group-modern input:focus { border-color: var(--primary-500); background: white; outline: none; box-shadow: 0 0 0 4px var(--primary-50); }
                .form-row-modern { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .file-custom-btn { background: var(--primary-50); color: var(--primary-700); padding: 16px; border-radius: 12px; text-align: center; border: 2px dashed var(--primary-200); cursor: pointer; font-weight: 800; transition: 0.3s; }
                .file-custom-btn:hover { background: var(--primary-100); border-color: var(--primary-400); }
                #file-upload { display: none; }
                .form-actions-modal { display: flex; justify-content: flex-end; gap: 12px; margin-top: 30px; }
                .cancel-btn { background: var(--slate-100); color: var(--slate-600); border: none; padding: 12px 24px; border-radius: 12px; font-weight: 800; cursor: pointer; }
                .submit-btn-premium { background: var(--primary-600); color: white; border: none; padding: 12px 32px; border-radius: 12px; font-weight: 900; cursor: pointer; box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.4); }
                .modal-sub { color: var(--slate-400); margin: 0 0 30px 0; }
            `}</style>
        </div>
    );
};

export default TutorDashboard;
