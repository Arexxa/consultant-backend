const educationService = require('../services/educationService');

function getEducation(req, res) {
    const userId = req.query.userId;
    educationService.getEducation(userId, (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        res.json(results);
    });
}

function insertEducation(req, res) {
    const { userId, university, course, startDate, endDate } = req.body;

    educationService.insertEducation(userId, { university, course, startDate, endDate }, (error, result) => {
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

module.exports = { getEducation, insertEducation };
