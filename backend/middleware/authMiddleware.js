// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const authMiddleware = async (req, res, next) => {
//     try {
//         const token = req.header('Authorization')?.replace('Bearer ', '');

//         if (!token) {
//             return res.status(401).json({ message: 'No authentication token, access denied' });
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
//         const user = await User.findById(decoded.id);

//         if (!user) {
//             return res.status(401).json({ message: 'User not found, authorization failed' });
//         }

//         req.user = user;
//         next();
//     } catch (error) {
//         res.status(401).json({ message: 'Token is invalid' });
//     }
// };

// module.exports = authMiddleware;


const jwt = require('jsonwebtoken');
const User = require('../models/User');


// ================= PROTECT (Check Token) =================
const protect = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;

        next();

    } catch (error) {
        return res.status(401).json({ message: 'Token is invalid' });
    }
};


// ================= ADMIN ONLY =================
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: 'Admin access only' });
    }
};

module.exports = { protect, adminOnly };