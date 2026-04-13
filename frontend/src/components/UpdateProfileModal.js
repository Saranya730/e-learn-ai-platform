import React, { useState } from 'react';
import { tutorApi } from '../api/tutorApi';

const UpdateProfileModal = ({ profile, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: profile.name,
        experience: profile.experience,
        bio: profile.bio,
        languagesSpecialist: profile.languagesSpecialist.join(', '),
        awards: profile.awards.join(', ')
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const processedData = {
                ...formData,
                languagesSpecialist: formData.languagesSpecialist.split(',').map(s => s.trim()).filter(s => s),
                awards: formData.awards.split(',').map(s => s.trim()).filter(s => s)
            };

            await tutorApi.updateProfile(processedData);
            onUpdate();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Update Profile</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name</label>
                        <input name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Experience (Years)</label>
                        <input type="number" name="experience" value={formData.experience} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Bio</label>
                        <textarea name="bio" value={formData.bio} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Languages (comma separated)</label>
                        <input name="languagesSpecialist" value={formData.languagesSpecialist} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Awards (comma separated)</label>
                        <input name="awards" value={formData.awards} onChange={handleChange} />
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
                        <button type="submit" disabled={loading} className="save-btn">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateProfileModal;
