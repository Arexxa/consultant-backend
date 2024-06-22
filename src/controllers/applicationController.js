// controllers/applicationController.js
const applicationService = require('../services/applicationService');
const logger = require('../utils/logger');

function getApplication(req, res) {
    const userId = req.query.userId;
    applicationService.getApplication(userId, (error, results) => {
        if (error) {
            logger.error(`Error getting application details for userId ${userId}: ${error.transaction.detail}`);
            res.status(error.status || 500).json({ transaction: error.transaction });
            return;
        }
        res.status(200).json(results);
    });
}

function insertApplication(req, res) {
    const { userId, applications } = req.body;

    applicationService.insertApplication(userId, applications, (error, result) => {
        if (error) {
            logger.error(`Error inserting application for userId ${userId}: ${error.transaction.detail}`);
            res.status(error.status || 500).json({ transaction: error.transaction });
            return;
        }
        logger.info(`Application inserted successfully for userId ${userId}`);
        res.status(200).json(result);
    });
}

function updateApplication(req, res) {
    const userId = req.query.userId;
    const documentId = req.query.documentId;
    const updatedData = req.body;

    applicationService.updateApplication(userId, documentId, updatedData, (error, result) => {
        if (error) {
            logger.error(`Error updating application for userId ${userId}: ${error.transaction.detail}`);
            res.status(error.status || 500).json({ transaction: error.transaction });
            return;
        }
        logger.info(`Application updated successfully for userId ${userId}`);
        res.status(200).json(result);
    });
}

function deleteApplication(req, res) {
    const userId = req.query.userId;
    const documentId = req.query.documentId;

    applicationService.deleteApplication(userId, documentId, (error, result) => {
        if (error) {
            logger.error(`Error deleting application for userId ${userId}: ${error.transaction.detail}`);
            res.status(error.status || 500).json({ transaction: error.transaction });
            return;
        }
        logger.info(`Application deleted successfully for userId ${userId}`);
        res.status(200).json(result);
    });
}

module.exports = { getApplication, insertApplication, updateApplication, deleteApplication };
