// services/applicationController.js
const applicationService = require('../services/applicationService');

function getApplication(req, res) {
    const userId = req.query.userId;
    applicationService.getApplication(userId, (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        res.json(results);
    });
}

function insertApplication(req, res) {
    const { userId, applications } = req.body;

    applicationService.insertApplication(userId, applications, (error, result) => {
        if (error) {
            if (error.status === 400) {
                return res.status(400).json({ transaction: error.transaction });
            } else {
                return res.status(500).json({ transaction: error.transaction });
            }
        }
        return res.status(200).json(result);
    });
}

function updateApplication(req, res) {
    const userId = req.query.userId;
    const documentId = req.query.documentId;
    const updatedData = req.body;

    applicationService.updateApplication(userId, documentId, updatedData, (error, result) => {
        if (error) {
            if (error.status === 400) {
                return res.status(400).json({ transaction: error.transaction });
            } else {
                return res.status(500).json({ transaction: error.transaction });
            }
        }
        return res.status(200).json(result);
    });
}

function deleteApplication(req, res) {
    const userId = req.query.userId;
    const documentId = req.query.documentId;

    applicationService.deleteApplication(userId, documentId, (error, result) => {
        if (error) {
            if (error.status === 400) {
                return res.status(400).json({ transaction: error.transaction });
            } else {
                return res.status(500).json({ transaction: error.transaction });
            }
        }
        return res.status(200).json(result);
    });
}

module.exports = { getApplication, insertApplication, updateApplication, deleteApplication };
