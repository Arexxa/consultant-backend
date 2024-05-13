// services/workExperienceService.js
const db = require('../db');
const { dateTime } = require('../utils/timestamp');

function insertWorkExperience(userId, workExperiences, callback) {
    const insertPromises = workExperiences.map(workExperience => {
        const { position, company, currentEmployer, description, startDate, endDate } = workExperience;

        console.log('Inserting work experience:', userId, position, company, currentEmployer, description, startDate, endDate);

        return new Promise((resolve, reject) => {
            db.query('INSERT INTO cons_workexperience (userId, position, company, currentEmployer, description, startDate, endDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [userId, position, company, currentEmployer, description, startDate, endDate],
                (error, results) => {
                    if (error) {
                        console.error('Error executing MySQL query:', error);
                        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                            console.log('User ID not found:', userId);
                            const response = {
                                transaction: {
                                    message: 'Error',
                                    detail: 'User ID not found',
                                    dateTime: dateTime()
                                }
                            };
                            return reject(response);
                        } else {
                            console.error('Internal Server Error');
                            return reject({ error: 'Internal Server Error' });
                        }
                    }
                    console.log('Work experience inserted successfully');
                    const response = {
                        transaction: {
                            message: 'OK',
                            dateTime: dateTime()
                        },
                        result: {
                            message: 'Work experience inserted successfully'
                        }
                    };
                    resolve(response);
                });
        });
    });

    Promise.all(insertPromises)
        .then(responses => {
            // Return an array of responses for each inserted work experience
            callback(null, responses);
        })
        .catch(error => {
            callback(error, null);
        });
}


function getWorkExperience(userId, callback) {
    let query = 'SELECT * FROM cons_workexperience';
    let queryParams = [];

    if (userId) {
        query += ' WHERE userId = ?';
        queryParams.push(userId);
    }

    db.query(query, queryParams, (error, results) => {
        if (error) {
            console.error('Error executing MySQL query:', error);
            return callback({ error: 'Internal Server Error' }, null);
        }
        
        const transaction = {
            message: 'OK',
            dateTime: dateTime()
        };
        
        if (!userId) {
            // If userId is not provided, return empty array for result
            const response = {
                transaction: transaction,
                result: []
            };
            return callback(null, response);
        }

        if (results.length === 0) {
            // If userId is provided but no results are found, return error message
            const response = {
                transaction: transaction,
                error: {
                    message: 'User ID not found',
                    // detail: 'User ID does not exist in the database',
                    dateTime: dateTime()
                }
            };
            return callback(null, response);
        }
        
        const workExperiences = results.map(row => ({
            userId: row.userId,
            position: row.position,
            company: row.company,
            currentEmployer: row.currentEmployer,
            description: row.description,
            startDate: row.startDate,
            endDate: row.endDate
        }));
        
        const response = {
            transaction: transaction,
            result: workExperiences
        };
        
        callback(null, response);
    });
}

function updateWorkExperience(userId, workExperienceId, workExperienceData, callback) {
    const { position, company, currentEmployer, description, startDate, endDate } = workExperienceData;

    // Format the start date and end date
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);

    db.query('UPDATE cons_workexperience SET position = ?, company = ?, currentEmployer = ?, description = ?, startDate = ?, endDate = ? WHERE userId = ? AND WorkExperienceID = ?',
        [position, company, currentEmployer, description, formattedStartDate, formattedEndDate, userId, workExperienceId],
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
                    message: 'Work Experience updated successfully'
                }
            };
            callback(null, response);
        });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1) < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
}

module.exports = { insertWorkExperience, getWorkExperience, updateWorkExperience };
