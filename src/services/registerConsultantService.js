// services/registerService.js
const bcrypt = require('bcrypt');
const db = require('../db');
const Register = require('../models/Register');
const { generateTimestamp, dateTime } = require('../utils/timestamp');

function getAllUsers(callback) {
    db.query('SELECT * FROM cons_profile', (error, results) => {
        if (error) {
            console.error('Error executing MySQL query:', error);
            callback(error, null);
            return;
        }
        // Map database results to Register objects
        const registers = results.map(row => new Register(row.userId, row.roleId, row.name, row.email, null, row.insert_datetime));

        const response = {
            transaction: {
                message: 'OK',
                dateTime: dateTime()
            },
            result: registers
        };

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

function registerConsultantUser(name, email, password, callback) {
    // Set the default role based on the user's role
    let defaultRoleName = 'Consultant';

    // Check if required fields are provided
    if (!email || !password) {
        const response = {
            transaction: {
                message: 'Error',
                detail: 'Please provide email and password',
                dateTime: dateTime()
            }
        };
        return callback(response, null);
    }

    if (!name) {
        const response = {
            transaction: {
                message: 'Error',
                detail: 'Please provide your name',
                dateTime: dateTime()
            }
        };
        return callback(response, null);
    }

    // Hash the password
    bcrypt.hash(password, 10, (hashError, hashedPassword) => {
        if (hashError) {
            console.error('Error hashing password:', hashError);
            const response = {
                transaction: {
                    message: 'Error',
                    detail: 'Internal Server Error',
                    dateTime: dateTime()
                }
            };
            return callback(response, null);
        }

        // Get the roleId based on the roleName from the cons_role table
        db.query('SELECT roleId FROM cons_role WHERE role_name = ?', [defaultRoleName], (error, results) => {
            if (error) {
                console.error('Error executing MySQL query:', error);
                const response = {
                    transaction: {
                        message: 'Error',
                        detail: 'Internal Server Error',
                        dateTime: dateTime()
                    }
                };
                return callback(response, null);
            }
            if (results.length === 0) {
                const response = {
                    transaction: {
                        message: 'Error',
                        detail: 'Role not found',
                        dateTime: dateTime()
                    }
                };
                return callback(response, null);
            }
            const roleId = results[0].roleId;

            // Check if the email already exists
            db.query('SELECT COUNT(*) AS count FROM cons_profile WHERE email = ?', [email], (error, results) => {
                if (error) {
                    console.error('Error executing MySQL query:', error);
                    return callback({ error: 'Internal Server Error' }, null);
                }
                const count = results[0].count;
                if (count > 0) {
                    const response = {
                        transaction: {
                            message: 'Error',
                            detail: 'Email already exists',
                            dateTime: dateTime()
                        }
                    };
                    return callback(response, null);
                }

                // Get the last userId from the database
                getLastUserId((error, lastUserId) => {
                    if (error) {
                        console.error('Error getting last userId:', error);
                        return callback({ error: 'Internal Server Error' }, null);
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
                                const response = {
                                    transaction: {
                                        message: 'Error',
                                        detail: 'Email already exists',
                                        dateTime: dateTime()
                                    }
                                };
                                return callback(response, null);
                            }
                            console.error('Error executing MySQL query:', error);
                            return callback({ error: 'Internal Server Error' }, null);
                        }
                        const response = {
                            transaction: {
                                message: 'OK',
                                dateTime: dateTime()
                            },
                            userRegister: {
                                userId,
                                email
                            }
                        };
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
            console.error('Error updating profile:', error);
            // If there's an error during profile update, return it
            return callback({ error: 'Internal Server Error' }, null);
        }

        const response = {
            transaction: {
                message: 'OK',
                dateTime: dateTime()
            },
            result: updateResult
        };

        // Return the profile update result
        callback(null, response);
    });
}

module.exports = { getAllUsers, registerConsultantUser, getLastUserId, updateRegisterConsultantUser};
