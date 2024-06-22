// controllers/companyController.js
const companyService = require('../services/companyService');
const logger = require('../utils/logger');

function getCompany(req, res) {
    const userId = req.query.userId;
    companyService.getCompany(userId, (error, results) => {
        if (error) {
            logger.error(`Error getting company detail for userId ${userId}: ${error.transaction.detail}`);
            res.status(error.status || 500).json({ transaction: error.transaction });
            return;
        }
        res.status(200).json(results);
    });
}

function insertCompany(req, res) {
    const { userId, company, jobTitle, description } = req.body;

    companyService.insertCompany(userId, { company, jobTitle, description }, (error, result) => {
        if (error) {
            logger.error(`Error inserting company details for userId ${userId}: ${error.transaction.detail}`);
            res.status(error.status || 500).json({ transaction: error.transaction });
            return;
        }
        logger.info(`Company details inserted successfully for userId ${userId}`);
        res.status(200).json(result);
    });
}

function updateCompany(req, res) {
    const { userId, companyId } = req.query;
    const { company, jobTitle, description } = req.body;

    companyService.updateCompany(userId, companyId, { company, jobTitle, description }, (error, result) => {
        if (error) {
            logger.error(`Error updating company details for userId ${userId}: ${error.transaction.detail}`);
            res.status(error.status || 500).json({ transaction: error.transaction });
            return;
        }
        logger.info(`Company details updated successfully for userId ${userId}`);
        res.status(200).json(result);
    });
}

module.exports = { getCompany, insertCompany, updateCompany };
