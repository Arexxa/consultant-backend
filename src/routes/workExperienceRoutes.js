// routes/workExperienceRoutes.js
const express = require('express');
const router = express.Router();
const { getWorkExperience, insertWorkExperience, updateWorkExperience } = require('../controllers/workExperienceController');

router.get('/list', getWorkExperience);
router.post('/add', insertWorkExperience);
router.put('/update', updateWorkExperience);

module.exports = router;
