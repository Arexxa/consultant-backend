// services/registerService.js
const bcrypt = require('bcrypt');
const db = require('../db');
const Register = require('../models/Register');
const { generateTimestamp, dateTime } = require('../utils/timestamp');
const insertWorkExperience = require('../services/workExperienceService');
const { insertEducation } = require('../services/educationService');

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

function registerUser(name, email, password, callback) {
    // Set the default role based on the user's role
    let defaultRoleName = 'User'; // Default role is User

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

function registerUserWithWorkExperienceAndEducation(name, email, password, address, contactNo, city, state, country, profileDescription, workExperience, education, callback) {
    registerUser(name, email, password, (error, registrationResult) => {
        if (error) {
            // If there's an error during user registration, return it
            return callback(error, null);
        }

        // Extract userId from the registration result
        const { userId } = registrationResult.userRegister;

        // Insert work experience data into cons_workexperience table
        insertWorkExperience(userId, workExperience, (error, workExperienceResult) => {
            if (error) {
                // If there's an error during work experience insertion, return it
                return callback(error, null);
            }

            // Insert education data into cons_education table
            insertEducation(userId, education, (error, educationResult) => {
                if (error) {
                    // If there's an error during education insertion, return it
                    return callback(error, null);
                }

                // Update user profile with address, contact number, city, state, country, and profile description
                db.query('UPDATE cons_profile SET contact_no = ?, address = ?, city = ?, state = ?, country = ?, profile_description = ? WHERE userId = ?', [contactNo, address, city, state, country, profileDescription, userId], (error, updateResult) => {
                    if (error) {
                        console.error('Error updating profile:', error);
                        // If there's an error during profile update, return it
                        return callback({ error: 'Internal Server Error' }, null);
                    }

                    // Merge registration, work experience, education, and profile update results
                    const response = {
                        transaction: {
                            message: 'OK',
                            dateTime: dateTime()
                        },
                        result: {
                            ...registrationResult,
                            ...workExperienceResult,
                            ...educationResult,
                            address: address,
                            contactNo: contactNo
                        }
                    };

                    // Return combined registration, work experience, education, and profile update result
                    callback(null, response);
                });
            });
        });
    });
}

module.exports = { getAllUsers, registerUser, getLastUserId, registerUserWithWorkExperienceAndEducation };
