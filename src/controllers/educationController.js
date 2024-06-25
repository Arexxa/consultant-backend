const educationService = require('../services/educationService');
const logger = require('../utils/logger');

function getEducation(req, res) {
    const userId = req.query.userId;
    educationService.getEducation(userId, (error, results) => {
        if (error) {
            logger.error(`Error getting user profile: ${error.message}`);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        res.json(results);
    });
}

function insertEducation(req, res) {
    const { userId, university, course, domain, startDate, endDate } = req.body;

    educationService.insertEducation(userId, { university, course, domain, startDate, endDate }, (error, result) => {
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

function updateEducation(req, res) {
    const { userId, educationId } = req.query;
    const { university, course, domain, startDate, endDate } = req.body;

    educationService.updateEducation(userId, educationId, { university, course, domain, startDate, endDate }, (error, result) => {
      if (error) {
        logger.error(`Error updating user profile: ${error.message}`);
        return res.status(500).json({ transaction: error.transaction });
      }
      res.status(200).json(result);
    });
}

module.exports = { getEducation, insertEducation, updateEducation };