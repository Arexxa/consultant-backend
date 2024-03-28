// services/registerService.js
const bcrypt = require('bcrypt');
const db = require('../db');
const Register = require('../models/Register');
const { generateTimestamp, dateTime } = require('../utils/timestamp');


function getAllUsers(callback) {
    db.query('SELECT * FROM cons_registration', (error, results) => {
        if (error) {
            console.error('Error executing MySQL query:', error);
            callback(error, null);
            return;
        }
        // Map database results to Register objects
        const registers = results.map(row => new Register(row.userId, row.roleId, row.username, null, row.insert_datetime));

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
    db.query('SELECT MAX(userId) AS lastUserId FROM cons_registration', (error, results) => {
        if (error) {
            console.error('Error executing MySQL query:', error);
            callback(error, null);
            return;
        }
        const lastUserId = results[0].lastUserId;
        callback(null, lastUserId);
    });
}

function registerUser(username, password, callback) {
    // Set the default role based on the user's role
    let defaultRoleName = 'User'; // Default role is User

    // Check if required fields are provided
    if (!username || !password) {
        const response = {
            transaction: {
                message: 'Error',
                detail: 'Please provide username and password',
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

            // Check if the username already exists
            db.query('SELECT COUNT(*) AS count FROM cons_registration WHERE username = ?', [username], (error, results) => {
                if (error) {
                    console.error('Error executing MySQL query:', error);
                    return callback({ error: 'Internal Server Error' }, null);
                }
                const count = results[0].count;
                if (count > 0) {
                    const response = {
                        transaction: {
                            message: 'Error',
                            detail: 'Username already exists',
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
                    db.query('INSERT INTO cons_registration (userId, roleId, username, password, insert_datetime) VALUES (?, ?, ?, ?, ?)', [userId, roleId, username, hashedPassword, insertDateTime], (error, results) => {
                        if (error) {
                            // Handle duplicate username error
                            if (error.code === 'ER_DUP_ENTRY') {
                                const response = {
                                    transaction: {
                                        message: 'Error',
                                        detail: 'Username already exists',
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
                                username
                            }
                        };
                        callback(null, response);
                    });
                });
            });
        });
    });
}

module.exports = { getAllUsers, registerUser, getLastUserId };
