// services/registerService.js
const bcrypt = require('bcrypt');
const db = require('../db');
const Register = require('../models/Register');
const { generateTimestamp, dateTime } = require('../utils/timestamp');
const logger = require('../utils/logger');
const { generateErrorResponse, generateSuccessResponse } = require('../utils/response');

function getAllUsers(callback) {
    db.query('SELECT * FROM cons_profile', (error, results) => {
        if (error) {
            logger.error(`Error executing MySQL query: ${error.message}`);
            callback(generateErrorResponse('Internal Server Error'), null);
            return;
        }

        const registers = results.map(row => new Register(row.userId, row.roleId, row.name, row.email, null, row.insert_datetime));

        const response = generateSuccessResponse({ result: registers });
        callback(null, response);
    });
}

function getLastUserId(callback) {
    db.query('SELECT MAX(userId) AS lastUserId FROM cons_profile', (error, results) => {
        if (error) {
            console.error('Error executing MySQL query:', error);
            callback(error, null);
            return;
        }
        const lastUserId = results[0].lastUserId;
        callback(null, lastUserId);
    });
}

function registerUser(name, email, password, callback) {
    // Set the default role based on the user's role
    let defaultRoleName = 'User'; // Default role is User

    // Check if required fields are provided
    if (!email || !password) {
        const response = generateErrorResponse('Please provide email and password', 'Missing email or password');
        return callback(response, null);
    }

    if (!name) {
        const response = generateErrorResponse('Please provide your name', 'Missing name');
        return callback(response, null);
    }

    // Hash the password
    bcrypt.hash(password, 10, (hashError, hashedPassword) => {
        if (hashError) {
            logger.error(`Error hashing password: ${hashError.message}`);
            const response = generateErrorResponse('Internal Server Error');
            return callback(response, null);
        }

        // Get the roleId based on the roleName from the cons_role table
        db.query('SELECT roleId FROM cons_role WHERE role_name = ?', [defaultRoleName], (error, results) => {
            if (error) {
                logger.error(`Error executing MySQL query: ${error.message}`);
                const response = generateErrorResponse('Internal Server Error');
                return callback(response, null);
            }
            if (results.length === 0) {
                const response = generateErrorResponse('Role not found');
                return callback(response, null);
            }
            const roleId = results[0].roleId;

            // Check if the email already exists
            db.query('SELECT COUNT(*) AS count FROM cons_profile WHERE email = ?', [email], (error, results) => {
                if (error) {
                    logger.error(`Error executing MySQL query: ${error.message}`);
                    const response = generateErrorResponse('Internal Server Error');
                    return callback(response, null);
                }
                const count = results[0].count;
                if (count > 0) {
                    const response = generateErrorResponse('Email already exists');
                    return callback(response, null);
                }

                // Get the last userId from the database
                getLastUserId((error, lastUserId) => {
                    if (error) {
                        logger.error(`Error getting last userId: ${error.message}`);
                        const response = generateErrorResponse('Internal Server Error');
                        return callback(response, null);
                    }

                    // Generate the userId based on the last userId or start from 1001 if there are no existing userIds
                    let nextUserIdNumber = lastUserId ? parseInt(lastUserId.split('-')[1]) + 1 : 1001;
                    const userId = `user-${nextUserIdNumber}`;

                    // Generate the current timestamp for insert_datetime
                    const insertDateTime = generateTimestamp();

                    // Insert user data into the database with hashed password
                    db.query('INSERT INTO cons_profile (userId, roleId, name, email, password, insert_datetime) VALUES (?, ?, ?, ?, ?, ?)', [userId, roleId, name, email, hashedPassword, insertDateTime], (error, results) => {
                        if (error) {
                            // Handle duplicate email error
                            if (error.code === 'ER_DUP_ENTRY') {
                                const response = generateErrorResponse('Email already exists');
                                return callback(response, null);
                            }
                            logger.error(`Error executing MySQL query: ${error.message}`);
                            const response = generateErrorResponse('Internal Server Error');
                            return callback(response, null);
                        }
                        const response = generateSuccessResponse({ userRegister: { userId, email } });
                        callback(null, response);
                    });
                });
            });
        });
    });
}

function updateRegisterUser(userId, contactNo, address, city, state, country, profileDescription, portfolio, website, callback) {
    db.query('UPDATE cons_profile SET contact_no = ?, address = ?, city = ?, state = ?, country = ?, profile_description = ?, portfolio = ?, website = ? WHERE userId = ?', [contactNo, address, city, state, country, profileDescription, portfolio, website, userId], (error, updateResult) => {
        if (error) {
            logger.error(`Error updating profile: ${error.message}`);
            // If there's an error during profile update, return it
            return callback(generateErrorResponse('Internal Server Error'), null);
        }

        const response = generateSuccessResponse({ result: updateResult });

        // Return the profile update result
        callback(null, response);
    });
}

module.exports = { getAllUsers, registerUser, getLastUserId, updateRegisterUser};
