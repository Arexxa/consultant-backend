// routes/adminRoute.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController'); // Import consultantController

router.get('/', adminController.getUserListByAdmin);

module.exports = router;
