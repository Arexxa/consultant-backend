// routes/registerRoute.js
const express = require('express');
const router = express.Router();
const { getAllUsers, registerConsultantUser, updateRegisterConsultantUser } = require('../controllers/registerConsultantController');

// Route for retrieving all registered users
router.get('/list', getAllUsers);

// Route for registering a new user
router.post('/', registerConsultantUser);

router.put('/update', updateRegisterConsultantUser);

module.exports = router;
