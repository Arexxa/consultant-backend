// services/applicationController.js
const applicationService = require('../services/applicationService');

function getApplication(req, res) {
    const userId = req.query.userId;
    applicationService.getEducation(userId, (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        res.json(results);
    });
}

function insertApplication(req, res) {
    const { userId, documentType, fileName, fileData, uploadDate } = req.body;

    applicationService.insertEducation(userId, { documentType, fileName, fileData, uploadDate }, (error, result) => {
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

module.exports = { getApplication, insertApplication };
