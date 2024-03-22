// services/registerController.js
const registerService = require('../services/registerService');

// Route for retrieving all registered users
function getAllUsers(req, res) {
    registerService.getAllUsers((error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        res.json(results);
    });
}

// Route for registering a new user
function registerUser(req, res) {
    const { username, password } = req.body;

    registerService.registerUser(username, password, (error, result) => {
        if (error) {
            return res.status(400).json({ transaction: error.transaction });
        }
        res.status(200).json(result);
    });
}

module.exports = { getAllUsers, registerUser };
