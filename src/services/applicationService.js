// services/applicationService.js
const db = require('../db');
const { dateTime } = require('../utils/timestamp');

function insertApplication(userId, applications, callback) {
    const { documentType, fileName, fileData, uploadDate } = applications;

    db.query('INSERT INTO application (userId, documentType, fileName, fileData, uploadDate) VALUES (?, ?, ?, ?, ?)',
        [userId, documentType, fileName, fileData, uploadDate],
        (error, results) => {
            if (error) {
                if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                    const response = {
                        transaction: {
                            message: 'Error',
                            detail: 'User ID not found',
                            dateTime: dateTime()
                        }
                    };
                    return callback(response, null);
                } else {
                    console.error('Error executing MySQL query:', error);
                    return callback({ error: 'Internal Server Error' }, null);
                }
            }
            const response = {
                transaction: {
                    message: 'OK',
                    dateTime: dateTime()
                },
                result: {
                    message: 'Application inserted successfully'
                }
            };
            callback(null, response);
        });
}

function getApplication(userId, callback) {
    db.query('SELECT * FROM cons_application WHERE userId = ?',
        [userId],
        (error, results) => {
            if (error) {
                console.error('Error executing MySQL query:', error);
                return callback({ error: 'Internal Server Error' }, null);
            }
            const application = results.map(row => ({
                documentType: row.documentType,
                fileName: row.fileName,
                fileData: row.fileData,
                uploadDate: row.uploadDate
            }));
            const response = {
                transaction: {
                    message: 'OK',
                    dateTime: dateTime()
                },
                result: application
            };
            callback(null, response);
        });
}

module.exports = { insertApplication, getApplication };
