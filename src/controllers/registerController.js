const logger = require('../utils/logger');
const registerService = require('../services/registerService');

// Route for retrieving all registered users
function getAllUsers(req, res) {
    registerService.getAllUsers((error, results) => {
        if (error) {
            logger.error(`Error retrieving all users: ${error.message}`);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        logger.info('All users retrieved successfully');
        res.json(results);
    });
}

// Route for registering a new user
function registerUser(req, res) {
    const { name, email, password } = req.body;

    registerService.registerUser(name, email, password, (error, result) => {
        if (error) {
            logger.error(`Error registering user: ${error.transaction.detail}`);
            const status = error.status === 400 ? 400 : 500;
            return res.status(status).json({ transaction: error.transaction });
        }
        logger.info('User registered successfully:', result.userRegister.userId);
        res.status(200).json(result);
    });
}

// Route for updating user profile
function updateRegisterUser(req, res) {
    const { userId, contactNo, address, city, state, country, profileDescription, portfolio, website } = req.body;

    registerService.updateRegisterUser(userId, contactNo, address, city, state, country, profileDescription, portfolio, website, (error, result) => {
        if (error) {
            logger.error(`Error updating user profile: ${error.transaction.detail}`);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        logger.info('User profile updated successfully:', userId);
        res.status(200).json(result);
    });
}

module.exports = { getAllUsers, registerUser, updateRegisterUser };
