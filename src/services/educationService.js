// services/educationService.js
const db = require('../db');
const { dateTime } = require('../utils/timestamp');
const { generateErrorResponse, generateSuccessResponse } = require('../utils/response');
const logger = require('../utils/logger');

function insertEducation(userId, education, callback) {
    const { university, course, domain, startDate, endDate } = education;

    db.query('INSERT INTO cons_education (userId, university, course, domain, startDate, endDate) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, university, course, domain, startDate, endDate],
        (error, results) => {
            if (error) {
                if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                    logger.error(`User ID not found: ${userId} - ${error.message}`);
                    return callback(generateErrorResponse('User ID not found', 'User ID not found', 400), null);
                } else {
                    logger.error(`Error executing MySQL query: ${error.message}`);
                    return callback(generateErrorResponse('Internal Server Error', 'Error inserting education', 500), null);
                }
            }
            const response = generateSuccessResponse({
                result: {
                    message: 'Education inserted successfully'
                }
            });
            logger.info(`Education inserted successfully for userId ${userId}`);
            callback(null, response);
        });
}

function getEducation(userId, callback) {
    db.query('SELECT * FROM cons_education WHERE userId = ?',
        [userId],
        (error, results) => {
            if (error) {
                logger.error(`Error executing MySQL query: ${error.message}`);
                return callback(generateErrorResponse('Internal Server Error', 'Error fetching education', 500), null);
            }
            const education = results.map(row => ({
                university: row.university,
                course: row.course,
                startDate: row.startDate,
                endDate: row.endDate,
                domain: row.domain,
            }));
            const response = generateSuccessResponse({ result: education });
            logger.info(`Education fetched successfully for userId ${userId}`);
            callback(null, response);
        });
}

function updateEducation(userId, educationId, education, callback) {
    const { university, course, domain, startDate, endDate } = education;

    // Format the start date and end date
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);

    db.query('UPDATE cons_education SET university = ?, course = ?, domain = ?, startDate = ?, endDate = ? WHERE userId = ? AND educationId = ?',
        [university, course, domain, formattedStartDate, formattedEndDate, userId, educationId],
        (error, results) => {
            if (error) {
                logger.error(`Error executing MySQL query: ${error.message}`);
                return callback(generateErrorResponse('Internal Server Error', 'Error updating education', 500), null);
            }
            const response = generateSuccessResponse({
                result: {
                    message: 'Education updated successfully'
                }
            });
            logger.info(`Education updated successfully for userId ${userId}`);
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

module.exports = { insertEducation, getEducation, updateEducation };
