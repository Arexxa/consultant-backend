// routes/registerRoute.js
const express = require('express');
const router = express.Router();
const { getAllUsers, registerUser, updateRegisterUser } = require('../controllers/registerController');

// Route for retrieving all registered users
router.get('/list', getAllUsers);

// Route for registering a new user
router.post('/', registerUser);

router.put('/update', updateRegisterUser);

module.exports = router;
