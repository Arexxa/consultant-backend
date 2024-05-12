// routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const { getApplication, insertApplication, updateWorkExperience } = require('../controllers/applicationController');

router.get('/list', getApplication);
router.post('/add', insertApplication);
router.put('/update', updateWorkExperience);

module.exports = router;
