// routes/workExperienceRoutes.js
const express = require('express');
const router = express.Router();
const { getWorkExperience, insertWorkExperience } = require('../controllers/workExperienceController');

router.get('/list', getWorkExperience);
router.post('/add', insertWorkExperience);

module.exports = router;
