// routes/consultantRoutes.js
const express = require('express');
const router = express.Router();
const consultantController = require('../controllers/consultantController'); // Import consultantController

router.get('/', consultantController.getUserList);
router.post('/notes', consultantController.addOrUpdateNote);
router.post('/status', consultantController.updateUserStatus);

module.exports = router;
