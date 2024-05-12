// services/educationService.js
const db = require('../db');
const { dateTime } = require('../utils/timestamp');

function insertEducation(userId, education, callback) {
    const { university, course, startDate, endDate } = education;

    db.query('INSERT INTO cons_education (userId, university, course, startDate, endDate) VALUES (?, ?, ?, ?, ?)',
        [userId, university, course, startDate, endDate],
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
                    message: 'Education inserted successfully'
                }
            };
            callback(null, response);
        });
}

function getEducation(userId, callback) {
    db.query('SELECT * FROM cons_education WHERE userId = ?',
        [userId],
        (error, results) => {
            if (error) {
                console.error('Error executing MySQL query:', error);
                return callback({ error: 'Internal Server Error' }, null);
            }
            const education = results.map(row => ({
                university: row.university,
                course: row.course,
                startDate: row.startDate,
                endDate: row.endDate
            }));
            const response = {
                transaction: {
                    message: 'OK',
                    dateTime: dateTime()
                },
                result: education
            };
            callback(null, response);
        });
}

function updateEducation(userId, educationId, education, callback) {
    const { university, course, startDate, endDate } = education;

    db.query('UPDATE cons_education SET university = ?, course = ?, startDate = ?, endDate = ? WHERE userId = ? AND educationId = ?',
        [university, course, startDate, endDate, userId, educationId],
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
                    message: 'Education updated successfully'
                }
            };
            callback(null, response);
        });
}

module.exports = { insertEducation, getEducation, updateEducation };
