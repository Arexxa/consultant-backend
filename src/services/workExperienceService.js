// services/workExperienceService.js
const db = require('../db');
const { generateTimestamp, dateTime } = require('../utils/timestamp');
const { generateErrorResponse, generateSuccessResponse } = require('../utils/response');
const logger = require('../utils/logger');

function insertWorkExperience(userId, workExperiences, callback) {
    const insertPromises = workExperiences.map(workExperience => {
        const { position, company, currentEmployer, description, startDate, endDate } = workExperience;
        const uploadDate = generateTimestamp();

        logger.info(`Inserting work experience: ${userId}, ${position}, ${company}, ${currentEmployer}, ${description}, ${startDate}, ${endDate}`);

        return new Promise((resolve, reject) => {
            db.query(
                'INSERT INTO cons_workexperience (userId, position, company, currentEmployer, description, startDate, endDate, uploadDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [userId, position, company, currentEmployer, description, startDate, endDate, uploadDate],
                (error, results) => {
                    if (error) {
                        logger.error('Error executing MySQL query:', error);
                        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                            const response = generateErrorResponse('User ID not found', 'User ID does not exist in the database', 400);
                            logger.error(`Error inserting work experience: ${response.transaction.detail}`);
                            return reject(response);
                        } else {
                            const response = generateErrorResponse('Internal Server Error', 'Error executing MySQL query');
                            logger.error('Internal Server Error');
                            return reject(response);
                        }
                    }
                    const response = generateSuccessResponse({ message: 'Work experience inserted successfully' });
                    logger.info('Work experience inserted successfully');
                    resolve(response);
                }
            );
        });
    });

    Promise.all(insertPromises)
        .then(responses => {
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
            logger.error('Error executing MySQL query:', error);
            const response = generateErrorResponse('Internal Server Error', 'Error executing MySQL query');
            return callback(response, null);
        }

        const transaction = {
            message: 'OK',
            dateTime: dateTime()
        };

        if (!userId) {
            const response = {
                transaction: transaction,
                result: []
            };
            return callback(null, response);
        }

        if (results.length === 0) {
            const response = generateErrorResponse('User ID not found', 'User ID does not exist in the database', 400);
            logger.error(`Error fetching work experience: ${response.transaction.detail}`);
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

        const response = generateSuccessResponse({ result: workExperiences });
        logger.info(`Work experiences retrieved successfully for userId ${userId}`);
        callback(null, response);
    });
}

function updateWorkExperience(userId, workExperienceId, workExperienceData, callback) {
    const { position, company, currentEmployer, description, startDate, endDate } = workExperienceData;
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    const uploadDate = generateTimestamp();

    db.query(
        'UPDATE cons_workexperience SET position = ?, company = ?, currentEmployer = ?, description = ?, startDate = ?, endDate = ?, uploadDate = ? WHERE userId = ? AND WorkExperienceID = ?',
        [position, company, currentEmployer, description, formattedStartDate, formattedEndDate, uploadDate, userId, workExperienceId],
        (error, results) => {
            if (error) {
                logger.error('Error executing MySQL query:', error);
                const response = generateErrorResponse('Internal Server Error', 'Error executing MySQL query');
                return callback(response, null);
            }

            const response = generateSuccessResponse({ message: 'Work Experience updated successfully' });
            logger.info(`Work experience updated successfully for userId ${userId}, workExperienceId ${workExperienceId}`);
            callback(null, response);
        }
    );
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1) < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
}

module.exports = { insertWorkExperience, getWorkExperience, updateWorkExperience };
