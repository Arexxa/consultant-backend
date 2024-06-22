const logger = require('../utils/logger');
const adminRegister = require('../services/adminRegister');

// Route for retrieving all roles
function getRolesId(req, res) {
    adminRegister.getRolesId((error, results) => {
        if (error) {
            logger.error(`Error retrieving roles: ${error.message}`);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        logger.info('Roles retrieved successfully');
        res.json(results);
    });
}

// Route for registering as admin
function registerAdmin(req, res) {
    const { roleId, name, email, password, contact_no, address, school, certificate } = req.body;

    adminRegister.registerAdmin({ roleId, name, email, password, contact_no, address, school, certificate }, (error, result) => {
        if (error) {
            logger.error(`Error registering admin: ${error.transaction.detail}`);
            const status = error.status === 400 ? 400 : 500;
            return res.status(status).json({ transaction: error.transaction });
        }
        logger.info('Admin registered successfully:', result.result.userId);
        res.status(200).json(result);
    });
}

module.exports = { getRolesId, registerAdmin };
