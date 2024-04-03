// routes/adminRegisterRoutes.js
const express = require('express');
const router = express.Router();
const { getRolesId, registerAdmin } = require('../controllers/adminRegController');

// Route for retrieving all roles
router.get('/roles', getRolesId);

router.post('/register', registerAdmin);

module.exports = router;
