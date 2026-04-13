import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CourseManagement = ({ tutors = [] }) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: '',
        price: '',
        skills: '',
        instructor: ''
    });
    const [editingId, setEditingId] = useState(null);

    const fetchCourses = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/courses');
            setCourses(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching courses:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const payload = {
            ...formData,
            skills: formData.skills.split(',').map(s => s.trim()),
            price: Number(formData.price)
        };

        try {
            if (editingId) {
                await axios.put(`http://localhost:5000/api/courses/${editingId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Course updated!');
            } else {
                await axios.post('http://localhost:5000/api/courses', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Course created!');
            }
            setFormData({ title: '', description: '', duration: '', price: '', skills: '', instructor: '' });
            setEditingId(null);
            fetchCourses();
        } catch (error) {
            alert('Operation failed: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEdit = (course) => {
        setEditingId(course._id);
        setFormData({
            title: course.title,
            description: course.description,
            duration: course.duration,
            price: course.price,
            skills: course.skills.join(', '),
            instructor: course.instructor
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:5000/api/courses/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCourses();
        } catch (error) {
            alert('Delete failed');
        }
    };

    if (loading) return <p>Loading courses...</p>;

    return (
        <div className="admin-mgmt-container">
            <section className="admin-card-premium">
                <div className="card-header-modern">
                    <div className="header-icon">{editingId ? '📝' : '✨'}</div>
                    <div>
                        <h2>{editingId ? 'Refine Curriculum' : 'Design New Course'}</h2>
                        <p>{editingId ? 'Modify existing course details and pricing.' : 'Create a new learning path for students.'}</p>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} className="mgmt-form-premium">
                    <div className="form-grid-premium">
                        <div className="input-group-premium">
                            <label>Course Title</label>
                            <input name="title" placeholder="e.g. Master Web Development" value={formData.title} onChange={handleChange} required />
                        </div>
                        <div className="input-group-premium">
                            <label>Assign Mentor</label>
                            <select name="instructor" value={formData.instructor} onChange={handleChange} required className="premium-select">
                                <option value="">Select Instructor</option>
                                {tutors.map(t => (
                                    <option key={t._id} value={t.name}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group-premium">
                            <label>Program Duration</label>
                            <select name="duration" value={formData.duration} onChange={handleChange} required className="premium-select">
                                <option value="">Select Duration</option>
                                {[1, 2, 3, 4, 6, 8, 10, 12].map(num => (
                                    <option key={num} value={`${num} Weeks`}>{num} {num === 1 ? 'Week' : 'Weeks'}</option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group-premium">
                            <label>Price (INR)</label>
                            <input name="price" type="number" placeholder="4999" value={formData.price} onChange={handleChange} required />
                        </div>
                        <div className="input-group-premium full-width">
                            <label>Core Skills (Separate with Commas)</label>
                            <input name="skills" placeholder="React, Node.js, Database Design..." value={formData.skills} onChange={handleChange} required />
                        </div>
                        <div className="input-group-premium full-width">
                            <label>Curriculum Overview</label>
                            <textarea name="description" placeholder="Provide a detailed description of the course..." value={formData.description} onChange={handleChange} required rows="4" />
                        </div>
                    </div>
                    <div className="form-actions-premium">
                        <button type="submit" className="onboard-submit-btn">{editingId ? 'Save Changes' : 'Publish Course 🚀'}</button>
                        {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({ title: '', description: '', duration: '', price: '', skills: '', instructor: '' }); }} className="mgmt-cancel-btn">Cancel</button>}
                    </div>
                </form>
            </section>

            <section className="admin-card-premium" style={{ marginTop: 'var(--space-8)' }}>
                <div className="card-header-modern">
                    <div className="header-icon">📚</div>
                    <h2>Active Curriculum</h2>
                </div>
                <div className="course-table-wrapper-premium">
                    <table className="user-table-modern">
                        <thead>
                            <tr>
                                <th>Course Details</th>
                                <th>Mentor</th>
                                <th>Pricing</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map(c => (
                                <tr key={c._id}>
                                    <td>
                                        <div className="course-main-cell">
                                            <strong>{c.title}</strong>
                                            <span>{c.duration} Program</span>
                                        </div>
                                    </td>
                                    <td>{c.instructor}</td>
                                    <td><span className="price-tag-modern">₹{c.price}</span></td>
                                    <td>
                                        <div className="mgmt-actions">
                                            <button onClick={() => handleEdit(c)} className="mgmt-edit-btn">Edit</button>
                                            <button onClick={() => handleDelete(c._id)} className="mgmt-delete-btn">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <style>{`
                .admin-mgmt-container { display: flex; flex-direction: column; }
                .form-grid-premium { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6); }
                .full-width { grid-column: 1 / -1; }
                
                .input-group-premium { display: flex; flex-direction: column; gap: 8px; }
                .input-group-premium label { font-size: 0.75rem; font-weight: 800; color: var(--slate-500); text-transform: uppercase; }
                .input-group-premium input, .premium-select, .input-group-premium textarea { 
                    background: var(--slate-50); 
                    border: 1px solid var(--slate-200); 
                    padding: 14px; 
                    border-radius: 14px; 
                    font-size: 0.95rem; 
                    font-family: inherit;
                    transition: 0.3s;
                }
                .input-group-premium input:focus, .premium-select:focus, .input-group-premium textarea:focus {
                    background: white; border-color: var(--primary-400); box-shadow: 0 0 0 4px var(--primary-50); outline: none;
                }
                
                .form-actions-premium { display: flex; gap: 12px; margin-top: var(--space-6); }
                .mgmt-cancel-btn { background: var(--slate-200); color: var(--slate-600); border: none; padding: 14px 24px; border-radius: 14px; font-weight: 800; cursor: pointer; }
                
                .course-main-cell { display: flex; flex-direction: column; gap: 4px; }
                .course-main-cell span { font-size: 0.75rem; color: var(--slate-400); }
                .price-tag-modern { font-weight: 800; color: var(--success); }
                
                .mgmt-actions { display: flex; gap: 16px; justify-content: flex-end; }
                .mgmt-edit-btn { background: none; border: none; color: var(--primary-600); font-weight: 800; cursor: pointer; }
                .mgmt-delete-btn { background: none; border: none; color: #ef4444; font-weight: 800; cursor: pointer; opacity: 0.6; }
                .mgmt-delete-btn:hover { opacity: 1; }
            `}</style>
        </div>
    );
};

export default CourseManagement;
