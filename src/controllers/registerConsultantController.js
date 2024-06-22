const logger = require('../utils/logger');
const registerConsultantService = require('../services/registerConsultantService');

// Route for retrieving all registered users
function getAllUsers(req, res) {
    registerConsultantService.getAllUsers((error, results) => {
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
function registerConsultantUser(req, res) {
    const { name, email, password } = req.body;

    registerConsultantService.registerConsultantUser(name, email, password, (error, result) => {
        if (error) {
            logger.error(`Error registering consultant user: ${error.transaction.detail}`);
            const status = error.status === 400 ? 400 : 500;
            return res.status(status).json({ transaction: error.transaction });
        }
        logger.info('Consultant user registered successfully:', result.userRegister.userId);
        res.status(200).json(result);
    });
}

// Route for updating consultant user profile
function updateRegisterConsultantUser(req, res) {
    const { userId, contactNo, address, city, state, country, profileDescription, portfolio, website } = req.body;

    registerConsultantService.updateRegisterConsultantUser(userId, contactNo, address, city, state, country, profileDescription, portfolio, website, (error, result) => {
        if (error) {
            logger.error(`Error updating consultant user profile: ${error.transaction.detail}`);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        logger.info('Consultant user profile updated successfully:', userId);
        res.status(200).json(result);
    });
}

module.exports = { getAllUsers, registerConsultantUser, updateRegisterConsultantUser };
