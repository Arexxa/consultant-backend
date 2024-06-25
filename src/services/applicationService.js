// services/applicationService.js
const db = require('../db');
const { generateTimestamp, dateTime } = require('../utils/timestamp');
const { generateErrorResponse, generateSuccessResponse } = require('../utils/response');
const logger = require('../utils/logger');
const fs = require('fs');

function insertApplication(userId, applications, callback) {
    if (!Array.isArray(applications)) {
        const errorResponse = generateErrorResponse('Applications must be an array', 'Invalid input type', 400);
        logger.error(`Error inserting application for userId ${userId}: ${errorResponse.transaction.detail}`);
        return callback(errorResponse, null);
    }

    // Insert each application into the database
    Promise.all(applications.map(application => {
        const { documentType, fileName, fileData } = application;
        const uploadDate = generateTimestamp();

        const dataToInsert = {
            userId,
            documentType,
            fileName,
            uploadDate
        };

        if (fileData) {
            dataToInsert.fileData = fileData;
        }

        return new Promise((resolve, reject) => {
            db.query('INSERT INTO cons_application SET ?', dataToInsert, (error, result) => {
                if (error) {
                    logger.error(`Error inserting application for userId ${userId}: ${error.message}`);
                    return reject(generateErrorResponse('Internal Server Error', error.message));
                }
                resolve(result);
            });
        });
    }))
    .then(() => {
        const response = generateSuccessResponse({
            result: {
                message: 'Applications inserted successfully'
            }
        });
        logger.info(`Applications inserted successfully for userId ${userId}`);
        callback(null, response);
    })
    .catch(error => {
        callback(error, null);
    });
}

function getApplication(userId, callback) {
    db.query('SELECT * FROM cons_application WHERE userId = ?', [userId], (error, results) => {
        if (error) {
            logger.error(`Error executing MySQL query for userId ${userId}: ${error.message}`);
            return callback(generateErrorResponse('Internal Server Error', error.message), null);
        }

        let coverLetter = null;
        let resume = null;

        results.forEach(row => {
            if (row.documentType === 'Cover Letter') {
                coverLetter = {
                    documentType: row.documentType,
                    fileName: row.fileName,
                    fileData: row.fileData,
                    uploadDate: row.uploadDate
                };
            } else if (row.documentType === 'Resume') {
                resume = {
                    documentType: row.documentType,
                    fileName: row.fileName,
                    fileData: row.fileData,
                    uploadDate: row.uploadDate
                };
            }
        });

        const response = generateSuccessResponse({
            result: {
                coverLetter: coverLetter,
                resume: resume
            }
        });
        callback(null, response);
    });
}

function updateApplication(userId, applicationId, updatedData, callback) {
    const { documentType, fileName, fileData } = updatedData;
    const uploadDate = generateTimestamp();

    const dataToUpdate = {
        documentType,
        fileName,
        uploadDate
    };

    if (fileData) {
        dataToUpdate.fileData = fileData;
    }

    db.query('UPDATE cons_application SET ? WHERE userId = ? AND documentID = ?', [dataToUpdate, userId, applicationId], (error, result) => {
        if (error) {
            logger.error(`Error updating application for userId ${userId}: ${error.message}`);
            return callback(generateErrorResponse('Internal Server Error', error.message), null);
        }
        const response = generateSuccessResponse({
            result: {
                message: 'Application updated successfully'
            }
        });
        logger.info(`Application updated successfully for userId ${userId}`);
        callback(null, response);
    });
}

function deleteApplication(userId, applicationId, callback) {
    db.query('DELETE FROM cons_application WHERE userId = ? AND documentID = ?', [userId, applicationId], (error, result) => {
        if (error) {
            logger.error(`Error deleting application for userId ${userId}: ${error.message}`);
            return callback(generateErrorResponse('Internal Server Error', error.message), null);
        }
        const response = generateSuccessResponse({
            result: {
                message: 'Application deleted successfully'
            }
        });
        logger.info(`Application deleted successfully for userId ${userId}`);
        callback(null, response);
    });
}

module.exports = { insertApplication, getApplication, updateApplication, deleteApplication };
