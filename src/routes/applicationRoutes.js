// routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const { getApplication, insertApplication } = require('../controllers/applicationController');

router.get('/list', getApplication);
router.post('/add', insertApplication);

module.exports = router;
