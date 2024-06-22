// services/registerService.js
const bcrypt = require('bcrypt');
const db = require('../db');
const Register = require('../models/Register');
const { generateTimestamp, dateTime } = require('../utils/timestamp');
const { generateErrorResponse, generateSuccessResponse } = require('../utils/response');
const logger = require('../utils/logger');

function getAllUsers(callback) {
    db.query('SELECT * FROM cons_profile', (error, results) => {
        if (error) {
            logger.error('Error executing MySQL query:', error);
            const response = generateErrorResponse('Internal Server Error', 'Error executing MySQL query');
            return callback(response, null);
        }
        const registers = results.map(row => new Register(row.userId, row.roleId, row.name, row.email, null, row.insert_datetime));
        const response = generateSuccessResponse({ result: registers });
        callback(null, response);
    });
}

function getLastUserId(callback) {
    db.query('SELECT MAX(userId) AS lastUserId FROM cons_profile', (error, results) => {
        if (error) {
            logger.error('Error executing MySQL query:', error);
            const response = generateErrorResponse('Internal Server Error', 'Error executing MySQL query');
            return callback(response, null);
        }
        const lastUserId = results[0].lastUserId;
        callback(null, lastUserId);
    });
}

function registerConsultantUser(name, email, password, callback) {
    const defaultRoleName = 'Consultant';

    if (!email || !password) {
        const response = generateErrorResponse('Please provide email and password', 'Validation Error', 400);
        logger.error(`Error registering consultant: ${response.transaction.detail}`);
        return callback(response, null);
    }

    if (!name) {
        const response = generateErrorResponse('Please provide your name', 'Validation Error', 400);
        logger.error(`Error registering consultant: ${response.transaction.detail}`);
        return callback(response, null);
    }

    bcrypt.hash(password, 10, (hashError, hashedPassword) => {
        if (hashError) {
            logger.error('Error hashing password:', hashError);
            const response = generateErrorResponse('Internal Server Error', 'Error hashing password');
            return callback(response, null);
        }

        db.query('SELECT roleId FROM cons_role WHERE role_name = ?', [defaultRoleName], (error, results) => {
            if (error) {
                logger.error('Error executing MySQL query:', error);
                const response = generateErrorResponse('Internal Server Error', 'Error executing MySQL query');
                return callback(response, null);
            }
            if (results.length === 0) {
                const response = generateErrorResponse('Role not found', 'Validation Error', 400);
                logger.error(`Error registering consultant: ${response.transaction.detail}`);
                return callback(response, null);
            }
            const roleId = results[0].roleId;

            db.query('SELECT COUNT(*) AS count FROM cons_profile WHERE email = ?', [email], (error, results) => {
                if (error) {
                    logger.error('Error executing MySQL query:', error);
                    const response = generateErrorResponse('Internal Server Error', 'Error executing MySQL query');
                    return callback(response, null);
                }
                const count = results[0].count;
                if (count > 0) {
                    const response = generateErrorResponse('Email already exists', 'Duplicate Entry', 400);
                    logger.error(`Error registering consultant: ${response.transaction.detail}`);
                    return callback(response, null);
                }

                getLastUserId((error, lastUserId) => {
                    if (error) {
                        logger.error('Error getting last userId:', error);
                        const response = generateErrorResponse('Internal Server Error', 'Error getting last userId');
                        return callback(response, null);
                    }

                    let nextUserIdNumber = lastUserId ? parseInt(lastUserId.split('-')[1]) + 1 : 1001;
                    const userId = `user-${nextUserIdNumber}`;
                    const insertDateTime = generateTimestamp();

                    db.query('INSERT INTO cons_profile (userId, roleId, name, email, password, insert_datetime) VALUES (?, ?, ?, ?, ?, ?)', [userId, roleId, name, email, hashedPassword, insertDateTime], (error, results) => {
                        if (error) {
                            if (error.code === 'ER_DUP_ENTRY') {
                                const response = generateErrorResponse('Email already exists', 'Duplicate Entry', 400);
                                logger.error(`Error registering consultant: ${response.transaction.detail}`);
                                return callback(response, null);
                            }
                            logger.error('Error executing MySQL query:', error);
                            const response = generateErrorResponse('Internal Server Error', 'Error executing MySQL query');
                            return callback(response, null);
                        }
                        const response = generateSuccessResponse({
                            userRegister: {
                                userId,
                                email
                            }
                        });
                        logger.info(`Consultant registered successfully with userId ${userId}`);
                        callback(null, response);
                    });
                });
            });
        });
    });
}

function updateRegisterConsultantUser(userId, contactNo, address, city, state, country, profileDescription, portfolio, website, callback) {
    db.query('UPDATE cons_profile SET contact_no = ?, address = ?, city = ?, state = ?, country = ?, profile_description = ?, portfolio = ?, website = ? WHERE userId = ?', [contactNo, address, city, state, country, profileDescription, portfolio, website, userId], (error, updateResult) => {
        if (error) {
            logger.error('Error updating profile:', error);
            const response = generateErrorResponse('Internal Server Error', 'Error updating profile');
            return callback(response, null);
        }

        const response = generateSuccessResponse({ result: updateResult });
        logger.info(`Consultant profile updated successfully for userId ${userId}`);
        callback(null, response);
    });
}

module.exports = { getAllUsers, registerConsultantUser, getLastUserId, updateRegisterConsultantUser };
