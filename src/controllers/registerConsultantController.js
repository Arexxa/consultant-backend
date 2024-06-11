// services/registerController.js
const registerConsultantService = require('../services/registerConsultantService');

// Route for retrieving all registered users
function getAllUsers(req, res) {
    registerConsultantService.getAllUsers((error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        res.json(results);
    });
}

// Route for registering a new user
function registerConsultantUser(req, res) {
    const { name, email, password } = req.body;

    registerConsultantService.registerConsultantUser(name, email, password, (error, result) => {
        if (error) {
            if (error.status === 400) {
                return res.status(400).json({ transaction: error.transaction });
            } else {
                return res.status(500).json({ transaction: error.transaction });
            }
        }
        res.status(200).json(result);
    });
}

function updateRegisterConsultantUser(req, res) {
    const { userId, contactNo, address, city, state, country, profileDescription, portfolio, website } = req.body;

    registerConsultantService.updateRegisterConsultantUser(userId, contactNo, address, city, state, country, profileDescription, portfolio, website, (error, result) => {
        if (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json(result);
    });
}

module.exports = { getAllUsers, registerConsultantUser, updateRegisterConsultantUser };
