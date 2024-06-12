// controllers/loginController.js
const loginService = require('../services/loginService');
const logger = require('../utils/logger');

function login(req, res) {
    const { email, password } = req.body;

    loginService.login(email, password, (error, result) => {
        if (error) {
            logger.error(`Login failed: ${error.transaction.detail}`);
            return res.status(error.status).json({ transaction: error.transaction });
        }
        logger.info(`Login response sent for user ${result.user.userId}`);
        res.status(200).json(result);
    });
}

module.exports = { login };
