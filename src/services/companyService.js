// services/educationService.js
const db = require('../db');
const { generateTimestamp, dateTime } = require('../utils/timestamp');

function insertCompany(userId, companyDetail, callback) {
    const { company, jobTitle, description } = companyDetail;

    db.query('INSERT INTO cons_companydetail (userId, company, jobTitle, description, insert_datetime) VALUES (?, ?, ?, ?, ?)',
    [userId, company, jobTitle, description, generateTimestamp()],
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
                    message: 'Company Details inserted successfully'
                }
            };
            callback(null, response);
        });
}

function getCompany(userId, callback) {
    db.query('SELECT * FROM cons_companydetail WHERE userId = ?',
        [userId],
        (error, results) => {
            if (error) {
                console.error('Error executing MySQL query:', error);
                return callback({ error: 'Internal Server Error' }, null);
            }
            const companyDetail = results.map(row => ({
                company: row.company,
                jobTitle: row.jobTitle,
                description: row.description,
                insert_datetime: row.insert_datetime,
            }));
            const response = {
                transaction: {
                    message: 'OK',
                    dateTime: dateTime()
                },
                result: companyDetail
            };
            callback(null, response);
        });
}

function updateCompany(userId, companyId, education, callback) {
    const { company, jobTitle, description } = education;

    db.query('UPDATE cons_companydetail SET company = ?, jobTitle = ?, description = ?, insert_datetime = ? WHERE userId = ? AND companyId = ?',
        [company, jobTitle, description, generateTimestamp(), userId, companyId],
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
                    message: 'Company details updated successfully'
                }
            };
            callback(null, response);
        });
}

module.exports = { insertCompany, getCompany, updateCompany };
