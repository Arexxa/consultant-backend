// services/loginService.js
const bcrypt = require('bcrypt');
const db = require('../db');
const { dateTime } = require('../utils/timestamp');

function login(username, password, callback) {
    // Check if username and password are provided
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

    // Retrieve user data from the database based on the provided username
    db.query('SELECT * FROM cons_registration WHERE username = ?', [username], (error, results) => {
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

        // Check if the user with the provided username exists
        if (results.length === 0) {
            const response = {
                transaction: {
                    message: 'Error',
                    detail: 'User not found',
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
                username: results[0].username,
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
