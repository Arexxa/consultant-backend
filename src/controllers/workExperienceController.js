const experienceService = require('../services/workExperienceService');
const logger = require('../utils/logger');

function getWorkExperience(req, res) {
    const userId = req.query.userId;
    experienceService.getWorkExperience(userId, (error, results) => {
        if (error) {
            logger.error('Error retrieving work experience:', error);
            res.status(500).json(response);
            return;
        }
        logger.info('Work experience retrieved successfully for user:', userId);
        res.json(response);
    });
}

function insertWorkExperience(req, res) {
    const { userId, workExperiences } = req.body;

    experienceService.insertWorkExperience(userId, workExperiences, (error, result) => {
        if (error) {
            logger.error('Error inserting work experience:', error);
            if (error.status === 400) {
                return res.status(400).json(response);
            } else {
                return res.status(500).json(response);
            }
        }
        logger.info('Work experience inserted successfully for user:', userId);
        res.status(200).json(response);
    });
}

function updateWorkExperience(req, res) {
    const { userId, workExperienceId } = req.query;
    const { position, company, currentEmployer, description, startDate, endDate } = req.body;

    experienceService.updateWorkExperience(userId, workExperienceId, { position, company, currentEmployer, description, startDate, endDate }, (error, result) => {
        if (error) {
            logger.error('Error updating work experience:', error);
            return res.status(500).json(response);
        }
        logger.info('Work experience updated successfully for user:', userId);
        res.status(200).json(response);
    });
}

module.exports = { getWorkExperience, insertWorkExperience, updateWorkExperience };
