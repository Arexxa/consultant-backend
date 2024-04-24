// routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile } = require('../controllers/profileController');

router.get('/', getUserProfile);

// Update user profile
router.put('/update', updateUserProfile);

module.exports = router;
