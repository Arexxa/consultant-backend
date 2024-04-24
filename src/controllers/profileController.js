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

function updateUserProfile(req, res) {
    const userId = req.body.userId;
    const updatedProfile = req.body.updatedProfile; // Assuming updatedProfile contains updated profile information
    
    profileService.updateUserProfile(userId, updatedProfile, (error, result) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        res.json(result);
    });
}

module.exports = { getUserProfile, updateUserProfile };
