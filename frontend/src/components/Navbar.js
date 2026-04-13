import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');
    
    // Parse user role from JWT token (simple decode for demo/dev)
    const getUserRole = () => {
        if (!token) return null;
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload).role;
        } catch (e) {
            return null;
        }
    };

    const role = getUserRole();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    if (location.pathname === '/' || location.pathname === '/register') {
        return null; // Don't show on login/register pages
    }

    const navLinks = {
        student: [
            { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
            { name: 'My Courses', path: '/dashboard', view: 'my-courses', icon: '📖' },
            { name: 'AI Assistant', path: '/dashboard', view: 'chat', icon: '🤖' },
            { name: 'Find Tutors', path: '/dashboard', view: 'tutors', icon: '👨‍🏫' },
        ],
        tutor: [
            { name: 'Dashboard', path: '/tutor-dashboard', icon: '🏠' },
            { name: 'My Students', path: '/tutor-dashboard', view: 'students', icon: '👥' },
            { name: 'My Courses', path: '/tutor-dashboard', view: 'courses', icon: '📚' },
            { name: 'Edit Profile', path: '/update-profile', icon: '👤' },
        ],
        admin: [
            { name: 'Dashboard', path: '/admin-dashboard', icon: '🏠' },
            { name: 'User Manage', path: '/admin-dashboard', view: 'users', icon: '👥' },
            { name: 'Course Audits', path: '/admin-dashboard', view: 'audits', icon: '🔍' },
            { name: 'Course Manage', path: '/admin-dashboard', view: 'courses', icon: '📚' },
        ]
    };

    const links = navLinks[role] || [];

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo" onClick={() => navigate(role === 'admin' ? '/admin-dashboard' : role === 'tutor' ? '/tutor-dashboard' : '/dashboard')}>
                    <span className="logo-icon">{role === 'admin' ? '🛡️' : '🎓'}</span>
                    <span className="logo-text">E-Learn</span>
                </div>

                <ul className="navbar-links">
                    {links.map((link, index) => (
                        <li 
                            key={index} 
                            className={location.pathname === link.path && (!link.view || new URLSearchParams(location.search).get('view') === link.view) ? 'active' : ''}
                            onClick={() => {
                                const target = link.view ? `${link.path}?view=${link.view}` : link.path;
                                navigate(target);
                            }}
                        >
                            <span className="nav-icon">{link.icon}</span>
                            <span className="nav-name">{link.name}</span>
                        </li>
                    ))}
                </ul>

                <div className="navbar-actions">
                    <button className="logout-btn-nav" onClick={handleLogout}>
                        Logout
                    </button>
                    <div className="user-avatar" title={role}>
                        {role?.charAt(0).toUpperCase() || 'U'}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
