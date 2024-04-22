// routes/educationRoutes.js
const express = require('express');
const router = express.Router();
const { getEducation, insertEducation } = require('../controllers/educationController');

router.get('/list', getEducation);
router.post('/add', insertEducation);

module.exports = router;
