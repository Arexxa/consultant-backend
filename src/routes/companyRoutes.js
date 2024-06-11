// routes/educationRoutes.js
const express = require('express');
const router = express.Router();
const { getCompany, insertCompany, updateCompany } = require('../controllers/companyController');

router.get('/list', getCompany);
router.post('/add', insertCompany);
router.put('/update', updateCompany);

module.exports = router;
