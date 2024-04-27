const experienceService = require('../services/workExperienceService');

function getWorkExperience(req, res) {
    const userId = req.query.userId;
    experienceService.getWorkExperience(userId, (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        res.json(results);
    });
}

function insertWorkExperience(req, res) {
    const { userId, workExperiences } = req.body;

    experienceService.insertWorkExperience(userId, workExperiences, (error, result) => {
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

module.exports = { getWorkExperience, insertWorkExperience };
