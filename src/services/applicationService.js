// services/applicationService.js
const db = require('../db');
const { generateTimestamp, dateTime } = require('../utils/timestamp');
const fs = require('fs');

// Modify the insertApplication function to include response message
function insertApplication(userId, applications, callback) {
    if (!Array.isArray(applications)) {
        return callback({ error: 'Applications must be an array' }, null);
    }

    // Insert each application into the database
    Promise.all(applications.map(application => {
        const { documentType, fileName, fileData } = application;
        const uploadDate = generateTimestamp(); // Use generateTimestamp() for uploadDate

        // Prepare the data to be inserted into the database
        const dataToInsert = {
            userId,
            documentType,
            fileName,
            uploadDate
        };

        // Add fileData if provided
        if (fileData) {
            dataToInsert.fileData = fileData;
        }

        // Insert the application into the database
        return new Promise((resolve, reject) => {
            db.query('INSERT INTO cons_application SET ?', dataToInsert, (error, result) => {
                if (error) {
                    console.error('Error inserting application:', error);
                    return reject({ error: 'Internal Server Error' });
                }
                resolve(result);
            });
        });
    }))
    .then(() => {
        // All applications inserted successfully
        const response = {
            transaction: {
                message: 'OK',
                dateTime: dateTime()
            },
            result: {
                message: 'Applications inserted successfully'
            }
        };
        callback(null, response);
    })
    .catch(error => {
        // Handle any errors during insertion
        callback({ error: 'Internal Server Error' }, null);
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

            // Initialize objects for cover letter and resume
            let coverLetter = null;
            let resume = null;

            // Iterate over the results to organize into cover letter and resume objects
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

            // Construct the final response object
            const response = {
                transaction: {
                    message: 'OK',
                    dateTime: dateTime()
                },
                result: {
                    coverLetter: coverLetter,
                    resume: resume
                }
            };
            callback(null, response);
        });
}

module.exports = { insertApplication, getApplication };
