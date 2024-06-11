// get user list
const adminService = require('../services/adminService');

function getUserListByAdmin(req, res) {
    adminService.getUserListByAdmin((error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        res.json(results);
    });
}

module.exports = { getUserListByAdmin };
