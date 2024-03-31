// services/loginService.js
const bcrypt = require('bcrypt');
const db = require('../db');
const { dateTime } = require('../utils/timestamp');

function login(email, password, callback) {
    // Check if email and password are provided
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

    // Retrieve user data from the database based on the provided email
    db.query('SELECT * FROM cons_profile WHERE email = ?', [email], (error, results) => {
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

        // Check if the user with the provided email exists
        if (results.length === 0) {
            const response = {
                transaction: {
                    message: 'Error',
                    detail: 'Email not found',
                    dateTime: dateTime()
                }
            };
            return callback(response, null);
        }

        // Compare the provided password with the hashed password stored in the database
        bcrypt.compare(password, results[0].password, (compareError, isMatch) => {
            if (compareError) {
                console.error('Error comparing passwords:', compareError);
                const response = {
                    transaction: {
                        message: 'Error',
                        detail: 'Internal Server Error',
                        dateTime: dateTime()
                    }
                };
                return callback(response, null);
            }

            // Check if the password matches
            if (!isMatch) {
                const response = {
                    transaction: {
                        message: 'Error',
                        detail: 'Invalid credentials',
                        dateTime: dateTime()
                    }
                };
                return callback(response, null);
            }

            // If the credentials are valid, return the user data excluding the password
            const user = {
                userId: results[0].userId,
                roleId: results[0].roleId,
                email: results[0].email,
                insert_datetime: results[0].insert_datetime
            };

            const response = {
                transaction: {
                    message: 'OK',
                    dateTime: dateTime()
                },
                user: user
            };

            callback(null, response);
        });
    });
}

module.exports = { login };
