import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Interceptor to add JWT token to headers
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const tutorApi = {
    getDashboard: () => api.get('tutor/dashboard'),
    updateProfile: (data) => api.put('tutor/update-profile', data),
};

export const reviewApi = {
    getTutorReviews: (tutorId) => api.get(`/review/${tutorId}`),
    addReview: (data) => api.post('/review/add', data),
};

export default api;
