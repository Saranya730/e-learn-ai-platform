import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tutorApi } from '../api/tutorApi';
import './TutorDashboard.css'; // Reusing some dashboard styles

const UpdateProfile = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        experience: 0,
        bio: '',
        languagesSpecialist: '',
        awards: ''
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await tutorApi.getDashboard();
                const { profile } = response.data;
                setFormData({
                    name: profile.name,
                    experience: profile.experience,
                    bio: profile.bio,
                    languagesSpecialist: profile.languagesSpecialist.join(', '),
                    awards: profile.awards.join(', ')
                });
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch profile data');
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const processedData = {
                ...formData,
                languagesSpecialist: formData.languagesSpecialist.split(',').map(s => s.trim()).filter(s => s),
                awards: formData.awards.split(',').map(s => s.trim()).filter(s => s)
            };

            await tutorApi.updateProfile(processedData);
            alert('Profile updated successfully! ✅');
            navigate('/tutor-dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loading">Loading Profile Data...</div>;

    return (
        <div className="profile-update-container" style={{ padding: 'var(--space-8)', maxWidth: '1200px', margin: '0 auto', background: 'var(--slate-50)', minHeight: 'calc(100vh - var(--header-height))' }}>
            <header className="dashboard-header" style={{ marginBottom: 'var(--space-10)' }}>
                <div>
                    <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Settings</p>
                    <h1>Update Your Profile</h1>
                </div>
            </header>

                <div className="card" style={{ maxWidth: '800px', padding: 'var(--space-10)' }}>
                    {error && <div className="error-message" style={{ marginBottom: 'var(--space-6)' }}>{error}</div>}

                    <form onSubmit={handleSubmit} className="update-form">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
                            <div className="form-group">
                                <label style={{ fontWeight: 600, color: 'var(--slate-700)', marginBottom: '8px', display: 'block' }}>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your full name"
                                    style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ fontWeight: 600, color: 'var(--slate-700)', marginBottom: '8px', display: 'block' }}>Years of Experience</label>
                                <input
                                    type="number"
                                    name="experience"
                                    value={formData.experience}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. 5"
                                    style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: 'var(--space-6)' }}>
                            <label style={{ fontWeight: 600, color: 'var(--slate-700)', marginBottom: '8px', display: 'block' }}>Professional Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                required
                                placeholder="Tell students about your teaching style and expertise..."
                                style={{ height: '150px', width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', resize: 'vertical' }}
                            />
                        </div>

                        <div className="form-group" style={{ marginTop: 'var(--space-6)' }}>
                            <label style={{ fontWeight: 600, color: 'var(--slate-700)', marginBottom: '8px', display: 'block' }}>Languages Specialist</label>
                            <input
                                type="text"
                                name="languagesSpecialist"
                                value={formData.languagesSpecialist}
                                onChange={handleChange}
                                placeholder="e.g. JavaScript, Python, React"
                                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}
                            />
                            <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '8px' }}>Separate each skill with a comma.</p>
                        </div>

                        <div className="form-group" style={{ marginTop: 'var(--space-6)' }}>
                            <label style={{ fontWeight: 600, color: 'var(--slate-700)', marginBottom: '8px', display: 'block' }}>Key Achievements & Awards</label>
                            <input
                                type="text"
                                name="awards"
                                value={formData.awards}
                                onChange={handleChange}
                                placeholder="e.g. Best Tutor 2023, Certified Developer"
                                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}
                            />
                        </div>

                        <div className="form-actions" style={{ marginTop: 'var(--space-10)', display: 'flex', gap: 'var(--space-4)', justifyContent: 'flex-start', borderTop: '1px solid var(--slate-100)', paddingTop: 'var(--space-8)' }}>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="update-btn"
                                style={{ padding: '12px 32px', minWidth: '200px' }}
                            >
                                {submitting ? 'Saving Changes...' : 'Save Profile Changes'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/tutor-dashboard')}
                                className="nav-link-btn"
                                style={{ padding: '12px 24px' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
        </div>
    );
};

export default UpdateProfile;
