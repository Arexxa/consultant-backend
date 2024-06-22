// services/educationService.js
const db = require('../db');
const { generateTimestamp, dateTime } = require('../utils/timestamp');
const { generateErrorResponse, generateSuccessResponse } = require('../utils/response');
const logger = require('../utils/logger');

function insertCompany(userId, companyDetail, callback) {
    const { company, jobTitle, description } = companyDetail;

    db.query('INSERT INTO cons_companydetail (userId, company, jobTitle, description, insert_datetime) VALUES (?, ?, ?, ?, ?)',
    [userId, company, jobTitle, description, generateTimestamp()],
        (error, results) => {
            if (error) {
                if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                    logger.error(`User ID not found: ${userId} - ${error.message}`);
                    return callback(generateErrorResponse('User ID not found', 'User ID not found', 400), null);
                } else {
                    logger.error(`Error executing MySQL query: ${error.message}`);
                    return callback(generateErrorResponse('Internal Server Error', 'Error inserting company details', 500), null);
                }
            }
            const response = generateSuccessResponse({
                result: {
                    message: 'Company details inserted successfully'
                }
            });
            logger.info(`Company details inserted successfully for userId ${userId}`);
            callback(null, response);
        });
}

function getCompany(userId, callback) {
    db.query('SELECT * FROM cons_companydetail WHERE userId = ?',
        [userId],
        (error, results) => {
            if (error) {
                logger.error(`Error executing MySQL query: ${error.message}`);
                return callback(generateErrorResponse('Internal Server Error', 'Error fetching company details', 500), null);
            }
            const companyDetail = results.map(row => ({
                company: row.company,
                jobTitle: row.jobTitle,
                description: row.description,
                insert_datetime: row.insert_datetime,
            }));
            const response = generateSuccessResponse({ result: companyDetail });
            logger.info(`Company details fetched successfully for userId ${userId}`);
            callback(null, response);
        });
}

function updateCompany(userId, companyId, companyDetail, callback) {
    const { company, jobTitle, description } = companyDetail;

    db.query('UPDATE cons_companydetail SET company = ?, jobTitle = ?, description = ?, insert_datetime = ? WHERE userId = ? AND companyId = ?',
        [company, jobTitle, description, generateTimestamp(), userId, companyId],
        (error, results) => {
            if (error) {
                logger.error(`Error executing MySQL query: ${error.message}`);
                return callback(generateErrorResponse('Internal Server Error', 'Error updating company details', 500), null);
            }
            const response = generateSuccessResponse({
                result: {
                    message: 'Company details updated successfully'
                }
            });
            logger.info(`Company details updated successfully for userId ${userId}`);
            callback(null, response);
        });
}

module.exports = { insertCompany, getCompany, updateCompany };
