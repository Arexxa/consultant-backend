// services/registerController.js
const adminRegister = require('../services/adminRegister');

// Route for retrieving all roles
function getRolesId(req, res) {
    adminRegister.getRolesId((error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        res.json(results);
    });
}

// Route for registering as admin
function registerAdmin(req, res) {
    const { roleId, name, email, password, contact_no, address, school, certificate } = req.body;

    adminRegister.registerAdmin({ roleId, name, email, password, contact_no, address, school, certificate }, (error, result) => {
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

module.exports = { getRolesId, registerAdmin };
