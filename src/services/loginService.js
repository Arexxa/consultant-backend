// services/loginService.js
const bcrypt = require('bcrypt');
const db = require('../db');
const { generateErrorResponse, generateSuccessResponse } = require('../utils/response');
const logger = require('../utils/logger');

function login(email, password, callback) {
    if (!email || !password) {
        const errorResponse = generateErrorResponse('Please provide email and password', 'Missing email or password', 400);
        logger.warn(`Login attempt failed: ${errorResponse.transaction.detail}`);
        return callback(errorResponse, null);
    }

    db.query('SELECT * FROM cons_profile WHERE email = ?', [email], (error, results) => {
        if (error) {
            logger.error(`Error executing MySQL query: ${error.message}`);
            return callback(generateErrorResponse('Internal Server Error', 'Database query error'), null);
        }

        if (results.length === 0) {
            const errorResponse = generateErrorResponse('Email not found', 'User does not exist', 400);
            logger.warn(`Login attempt failed: ${errorResponse.transaction.detail} for email ${email}`);
            return callback(errorResponse, null);
        }

        bcrypt.compare(password, results[0].password, (compareError, isMatch) => {
            if (compareError) {
                logger.error(`Error comparing passwords: ${compareError.message}`);
                return callback(generateErrorResponse('Internal Server Error', 'Password comparison error'), null);
            }

            if (!isMatch) {
                const errorResponse = generateErrorResponse('Invalid credentials', 'Password does not match', 400);
                logger.warn(`Login attempt failed: ${errorResponse.transaction.detail} for email ${email}`);
                return callback(errorResponse, null);
            }

            const user = {
                userId: results[0].userId,
                roleId: results[0].roleId,
                email: results[0].email,
                insert_datetime: results[0].insert_datetime
            };

            logger.info(`Login successful for user ${user.userId}`);
            return callback(null, generateSuccessResponse({ user }));
        });
    });
}

module.exports = { login };
