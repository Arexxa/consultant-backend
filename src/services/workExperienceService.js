// services/workExperienceService.js
const db = require('../db');
const { dateTime } = require('../utils/timestamp');

function insertWorkExperience(userId, workExperience, callback) {
    const { position, company, startDate, endDate } = workExperience;

    console.log('Inserting work experience:', userId, position, company, currentEmployer, description, startDate, endDate);

    db.query('INSERT INTO cons_workexperience (userId, position, company, currentEmployer, description, startDate, endDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, position, company, startDate, endDate],
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
                    return callback(response, null);
                } else {
                    console.error('Internal Server Error');
                    return callback({ error: 'Internal Server Error' }, null);
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
            callback(null, response);
        });
}

function getWorkExperience(userId, callback) {
    db.query('SELECT * FROM cons_workexperience WHERE userId = ?',
        [userId],
        (error, results) => {
            if (error) {
                console.error('Error executing MySQL query:', error);
                return callback({ error: 'Internal Server Error' }, null);
            }
            const workExperiences = results.map(row => ({
                position: row.position,
                company: row.company,
                startDate: row.startDate,
                endDate: row.endDate
            }));
            const response = {
                transaction: {
                    message: 'OK',
                    dateTime: dateTime()
                },
                result: workExperiences
            };
            callback(null, response);
        });
}

module.exports = { insertWorkExperience, getWorkExperience };
