// services/loginController.js
const loginService = require('../services/loginService');

// Route for login
function login(req, res) {
    const { username, password } = req.body;

    loginService.login(username, password, (error, result) => {
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


module.exports = { login };
