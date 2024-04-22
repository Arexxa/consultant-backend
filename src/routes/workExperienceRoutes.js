// routes/workExperienceRoutes.js
const express = require('express');
const router = express.Router();
const { getWorkExperience, insertWorkExperience } = require('../controllers/workExperienceController');

// Route for retrieving all registered users
router.get('/list', getWorkExperience);

// Route for registering a new user
router.post('/work', insertWorkExperience);

module.exports = router;
