// routes/registerRoute.js
const express = require('express');
const router = express.Router();
const { getAllUsers, registerUser } = require('../controllers/registerController');

// Route for retrieving all registered users
router.get('/', getAllUsers);

// Route for registering a new user
router.post('/', registerUser);

module.exports = router;
