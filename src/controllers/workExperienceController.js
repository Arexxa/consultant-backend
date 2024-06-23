const experienceService = require('../services/workExperienceService');
const logger = require('../utils/logger');
const { generateErrorResponse } = require('../utils/response');

function getWorkExperience(req, res) {
    const userId = req.query.userId;
    experienceService.getWorkExperience(userId, (error, results) => {
        if (error) {
            logger.error('Error retrieving work experience:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        logger.info('Work experience retrieved successfully for user:', userId);
        res.json(results);
    });
}

function insertWorkExperience(req, res) {
    const { userId, workExperiences } = req.body;

    experienceService.insertWorkExperience(userId, workExperiences, (error, result) => {
        if (error) {
            logger.error('Error inserting work experience:', error);
            const status = error.status === 400 ? 400 : 500;
            return res.status(status).json({ transaction: error.transaction });
        }
        logger.info('Work experience inserted successfully for user:', userId);
        res.status(200).json(result);
    });
}

function updateWorkExperience(req, res) {
    const { userId, workExperienceId } = req.query;
    const { position, company, currentEmployer, description, startDate, endDate } = req.body;

    experienceService.updateWorkExperience(userId, workExperienceId, { position, company, currentEmployer, description, startDate, endDate }, (error, result) => {
        if (error) {
            logger.error('Error updating work experience:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        logger.info('Work experience updated successfully for user:', userId);
        res.status(200).json(result);
    });
}

module.exports = { getWorkExperience, insertWorkExperience, updateWorkExperience };
