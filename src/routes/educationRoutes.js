// routes/educationRoutes.js
const express = require('express');
const router = express.Router();
const { getEducation, insertEducation, updateEducation } = require('../controllers/educationController');

router.get('/list', getEducation);
router.post('/add', insertEducation);
router.put('/update', updateEducation);

module.exports = router;
