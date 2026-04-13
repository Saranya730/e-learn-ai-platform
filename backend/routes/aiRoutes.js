const express = require('express');
const router = express.Router();
const { getAIRecommendation } = require('../controllers/aiController');

router.post('/recommend', getAIRecommendation);

module.exports = router;