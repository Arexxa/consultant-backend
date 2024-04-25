// services/applicationService.js
const db = require('../db');
const { dateTime } = require('../utils/timestamp');
const fs = require('fs');

function insertApplication(userId, applications, callback) {
    const { documentType, fileName, fileData, uploadDate } = applications;

    // Assuming fileData is a base64-encoded string
    // Decode the base64 data to a Buffer
    const decodedFileData = Buffer.from(fileData, 'base64');

    // Save the decoded file data to a temporary file
    const tempFilePath = `temp/${fileName}`;
    fs.writeFile(tempFilePath, decodedFileData, (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return callback({ error: 'Error writing file' }, null);
        }

        // Insert the application data into the database
        db.query('INSERT INTO cons_application (userId, documentType, fileName, fileData, uploadDate) VALUES (?, ?, ?, ?, ?)',
            [userId, documentType, fileName, tempFilePath, uploadDate],
            (error, results) => {
                if (error) {
                    console.error('Error executing MySQL query:', error);
                    return callback({ error: 'Internal Server Error' }, null);
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

                // Delete the temporary file after insertion
                fs.unlink(tempFilePath, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                    }
                });

                callback(null, response);
            });
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
