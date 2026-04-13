import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TutorDashboard.css';
import CourseManagement from './CourseManagement';
import StarRating from './StarRating';

const AdminDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState("dashboard");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch admin data');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const view = params.get('view');
        setActiveView(view || 'dashboard');
    }, [location.search]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateTutor = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/admin/create-tutor', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Tutor created successfully!');
            setFormData({ name: '', email: '', password: '' });
            fetchStats();
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating tutor');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/admin/user/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('User deleted successfully');
            fetchStats();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting user');
        }
    };

    if (loading) return <div className="loading">Loading Admin Panel...</div>;
    if (error) return <div className="error-message">{error}</div>;

    const { stats, enrollments, students, tutors } = data;

    const renderContent = () => {
        switch (activeView) {
            case 'users':
                return (
                    <div className="admin-users-view">
                        <section className="admin-card-premium">
                            <div className="card-header-modern">
                                <div className="header-icon">👨‍🎓</div>
                                <h2>Student Registry</h2>
                            </div>
                            <div className="user-table-wrapper-premium">
                                <table className="user-table-modern">
                                    <thead>
                                        <tr><th>Name</th><th>Email</th><th>Actions</th></tr>
                                    </thead>
                                    <tbody>
                                        {students.map(s => (
                                            <tr key={s._id}>
                                                <td><div className="name-cell"><strong>{s.name}</strong><span className="tiny-badge">Student</span></div></td>
                                                <td>{s.email}</td>
                                                <td><button onClick={() => handleDeleteUser(s._id)} className="delete-action-btn">Delete User</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="admin-card-premium">
                            <div className="card-header-modern">
                                <div className="header-icon">👨‍🏫</div>
                                <h2>Verified Tutors</h2>
                            </div>
                            <div className="user-table-wrapper-premium">
                                <table className="user-table-modern">
                                    <thead>
                                        <tr><th>Name</th><th>Email</th><th>Actions</th></tr>
                                    </thead>
                                    <tbody>
                                        {tutors.map(t => (
                                            <tr key={t._id}>
                                                <td><div className="name-cell"><strong>{t.name}</strong><span className="tiny-badge tutor">Expert</span></div></td>
                                                <td>{t.email}</td>
                                                <td><button onClick={() => handleDeleteUser(t._id)} className="delete-action-btn">Delete User</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                );
            case 'audits':
                return (
                    <section className="admin-card-premium full-width">
                        <div className="card-header-modern">
                            <div className="header-icon">🕵️‍♂️</div>
                            <h2>Enrollment & Completion Audits</h2>
                        </div>
                        <div className="audits-timeline-modern">
                            {enrollments.map((en) => (
                                <div key={en._id} className="audit-row-premium">
                                    <div className="audit-main">
                                        <div className="audit-subject">
                                            <strong>{en.studentId?.name}</strong> 
                                            <span className="connector">enrolled in</span>
                                            <span className="course-ref">{en.courseTitle}</span>
                                        </div>
                                        <div className="audit-meta">
                                            Mentor: {en.tutorId?.name} • Status: <span className={`audit-status-badge ${en.status}`}>{en.status}</span>
                                        </div>
                                    </div>
                                    <div className="audit-side">
                                        {en.isCompleted ? (
                                            <div className="completion-summary-admin">
                                                <span className="grad-cap">🎓</span>
                                                <StarRating rating={en.finalRating} readOnly={true} />
                                            </div>
                                        ) : (
                                            <div className="progress-pill-admin">
                                                <div className="progress-bar-tiny">
                                                    <div className="bar-fill" style={{ width: `${en.progress}%` }}></div>
                                                </div>
                                                <span>{en.progress}% Active</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                );
            case 'courses':
                return <CourseManagement tutors={tutors} />;
            default:
                return (
                    <div className="admin-home-grid">
                        <div className="stats-mini-grid-admin">
                            <div className="glass-stat-card-admin student">
                                <span className="stat-icon">👨‍🎓</span>
                                <div className="stat-info">
                                    <span className="stat-val">{stats.totalStudents}</span>
                                    <span className="stat-lbl">Total Students</span>
                                </div>
                            </div>
                            <div className="glass-stat-card-admin tutor">
                                <span className="stat-icon">👨‍🏫</span>
                                <div className="stat-info">
                                    <span className="stat-val">{stats.totalTutors}</span>
                                    <span className="stat-lbl">Total Tutors</span>
                                </div>
                            </div>
                            <div className="glass-stat-card-admin enroll">
                                <span className="stat-icon">📚</span>
                                <div className="stat-info">
                                    <span className="stat-val">{stats.totalEnrollments}</span>
                                    <span className="stat-lbl">Active Enrollments</span>
                                </div>
                            </div>
                        </div>

                        <section className="admin-card-premium register-tutor-hub">
                            <div className="card-header-modern">
                                <div className="header-icon">🖋️</div>
                                <div>
                                    <h2>Tutor Onboarding</h2>
                                    <p>Register a new certified mentor to the platform.</p>
                                </div>
                            </div>
                            <form onSubmit={handleCreateTutor} className="onboard-form-premium">
                                <div className="form-row-modern">
                                    <div className="input-group-premium">
                                        <label>Full Name</label>
                                        <input name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
                                    </div>
                                    <div className="input-group-premium">
                                        <label>Email Address</label>
                                        <input name="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required />
                                    </div>
                                    <div className="input-group-premium">
                                        <label>Temporary Password</label>
                                        <input name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                                    </div>
                                </div>
                                <button type="submit" className="onboard-submit-btn">Authorize & Create Account 🚀</button>
                            </form>
                        </section>
                    </div>
                );
        }
    };

    return (
        <div className="dashboard-container" style={{ display: 'block', maxWidth: '1440px', margin: '0 auto' }}>
            <div className="main-content" style={{ padding: 'var(--space-8)', background: 'var(--slate-50)', minHeight: 'calc(100vh - var(--header-height))' }}>
                <header className="dashboard-header" style={{ marginBottom: 'var(--space-10)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Control Center</p>
                        <h1>Admin Dashboard 👋</h1>
                    </div>
                </header>

                {renderContent()}
            </div>

            <style>{`
                .admin-home-grid { display: flex; flex-direction: column; gap: var(--space-8); }
                .stats-mini-grid-admin { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-6); }
                .glass-stat-card-admin { background: white; padding: var(--space-6); border-radius: 24px; border: 1px solid var(--slate-100); display: flex; align-items: center; gap: var(--space-4); box-shadow: var(--shadow-sm); transition: 0.3s; }
                .glass-stat-card-admin:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
                .stat-icon { width: 50px; height: 50px; border-radius: 16px; background: var(--slate-50); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
                .stat-val { display: block; font-size: 1.75rem; font-weight: 800; color: var(--slate-900); }
                .stat-lbl { font-size: 0.8rem; color: var(--slate-400); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }

                .admin-card-premium { background: white; border-radius: 32px; padding: var(--space-8); box-shadow: var(--shadow-xl); border: 1px solid var(--slate-50); height: fit-content; }
                .card-header-modern { display: flex; gap: var(--space-4); align-items: center; margin-bottom: var(--space-8); border-bottom: 2px solid var(--slate-50); padding-bottom: 20px; }
                .header-icon { width: 44px; height: 44px; background: var(--primary-100); color: var(--primary-600); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
                .card-header-modern h2 { margin: 0; font-size: 1.5rem; font-weight: 800; }
                .card-header-modern p { margin: 4px 0 0 0; color: var(--slate-400); font-size: 0.9rem; }

                .onboard-form-premium { display: flex; flex-direction: column; gap: var(--space-8); }
                .input-group-premium { display: flex; flex-direction: column; gap: 8px; }
                .input-group-premium label { font-size: 0.8rem; font-weight: 800; color: var(--slate-500); text-transform: uppercase; }
                .input-group-premium input { background: var(--slate-50); border: 1px solid var(--slate-100); padding: 14px 18px; border-radius: 14px; font-size: 1rem; transition: 0.3s; }
                .input-group-premium input:focus { background: white; border-color: var(--primary-300); box-shadow: 0 0 0 4px var(--primary-50); outline: none; }
                .onboard-submit-btn { background: var(--primary-600); color: white; border: none; padding: 16px; border-radius: 16px; font-weight: 900; cursor: pointer; transition: 0.3s; }
                .onboard-submit-btn:hover { background: var(--primary-700); transform: translateY(-2px); box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.4); }

                .admin-users-view { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-8); }
                .user-table-modern { width: 100%; border-collapse: separate; border-spacing: 0 12px; }
                .user-table-modern th { text-align: left; padding: 0 16px; font-size: 0.75rem; color: var(--slate-400); text-transform: uppercase; }
                .user-table-modern td { padding: 16px; background: var(--slate-50); border-top: 1px solid var(--slate-100); border-bottom: 1px solid var(--slate-100); }
                .user-table-modern td:first-child { border-left: 1px solid var(--slate-100); border-radius: 12px 0 0 12px; }
                .user-table-modern td:last-child { border-right: 1px solid var(--slate-100); border-radius: 0 12px 12px 0; text-align: right; }
                .name-cell { display: flex; flex-direction: column; gap: 4px; }
                .tiny-badge { font-size: 0.65rem; background: var(--primary-100); color: var(--primary-700); padding: 2px 8px; border-radius: 6px; width: fit-content; font-weight: 800; text-transform: uppercase; }
                .tiny-badge.tutor { background: var(--success-100); color: var(--success); }
                .delete-action-btn { background: none; border: none; color: #ef4444; font-weight: 700; font-size: 0.8rem; cursor: pointer; opacity: 0.6; transition: 0.2s; }
                .delete-action-btn:hover { opacity: 1; text-decoration: underline; }

                .audits-timeline-modern { display: flex; flex-direction: column; gap: var(--space-4); }
                .audit-row-premium { display: flex; justify-content: space-between; align-items: center; padding: var(--space-5); background: var(--slate-50); border-radius: 20px; border: 1px solid var(--slate-100); transition: 0.3s; }
                .audit-row-premium:hover { background: white; border-color: var(--primary-200); box-shadow: var(--shadow-md); transform: translateX(8px); }
                .audit-subject { margin-bottom: 6px; }
                .connector { margin: 0 8px; color: var(--slate-400); font-style: italic; }
                .course-ref { color: var(--primary-600); font-weight: 800; }
                .audit-meta { font-size: 0.85rem; color: var(--slate-500); }
                .audit-status-badge { padding: 3px 8px; border-radius: 8px; font-size: 0.7rem; font-weight: 900; text-transform: uppercase; }
                .audit-status-badge.approved { background: var(--success-100); color: var(--success); }
                .audit-status-badge.pending { background: var(--warning-100); color: var(--warning-700); }
                .completion-summary-admin { display: flex; flex-direction: column; align-items: center; gap: 4px; }
                .grad-cap { font-size: 1.25rem; }
                .progress-pill-admin { text-align: center; }
                .progress-bar-tiny { width: 80px; height: 6px; background: var(--slate-200); border-radius: 10px; overflow: hidden; margin-bottom: 4px; }
                .progress-bar-tiny .bar-fill { height: 100%; background: var(--primary-600); }
                .progress-pill-admin span { font-size: 0.7rem; font-weight: 700; color: var(--slate-400); }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
