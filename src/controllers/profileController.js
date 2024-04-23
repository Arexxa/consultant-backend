// get user profile
const profileService = require('../services/profileService');

function getUserProfile(req, res) {
    const userId = req.query.userId;
    profileService.getUserProfile(userId, (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        res.json(results);
    });
}

module.exports = { getUserProfile };
