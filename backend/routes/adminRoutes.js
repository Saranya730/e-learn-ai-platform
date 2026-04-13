const express = require('express');
const router = express.Router();
const { getAdminStats, createTutor, deleteUser } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(protect);
router.use(roleMiddleware(['admin']));

router.get('/stats', getAdminStats);
router.post('/create-tutor', createTutor);
router.delete('/user/:id', deleteUser);

module.exports = router;
