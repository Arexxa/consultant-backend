// services/adminRegister.js
const bcrypt = require('bcrypt');
const db = require('../db');
const { generateTimestamp, dateTime } = require('../utils/timestamp');
const Role = require('../models/Roles');
const AdminRegister = require('../models/Admin/Register');

function getRolesId(callback) {
    db.query('SELECT * FROM cons_role', (error, results) => {
        if (error) {
            console.error('Error executing MySQL query:', error);
            callback(error, null);
            return;
        }
        const roles = results.map(row => new Role(row.roleId, row.role_name));

        const response = {
            transaction: {
                message: 'OK',
                dateTime: dateTime()
            },
            result: roles
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

function registerAdmin(adminData, callback) {
    const {
        roleId,
        name,
        email,
        password,
        contact_no,
        address,
        school,
        certificate
    } = adminData;

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

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            callback(err, null);
            return;
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

            const insertDateTime = generateTimestamp();

            const admin = new AdminRegister(
                userId,
                roleId,
                name,
                email,
                hashedPassword,
                contact_no,
                address,
                school,
                certificate,
                insertDateTime
            );

            db.query(
                'INSERT INTO cons_profile (userId, roleId, name, email, password, contact_no, address, school, certificate, insert_datetime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [admin.userId, admin.roleId, admin.name, admin.email, admin.password, admin.contact_no, admin.address, admin.school, admin.certificate, admin.insertDateTime],
                (error, results) => {
                    if (error) {
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
                            callback({ error: 'Internal Server Error' }, null);
                            return;
                    }

                    const response = {
                        transaction: {
                            message: 'Admin registered successfully',
                            dateTime: dateTime()
                        },
                        result: {
                            userId: results.insertId,
                            ...admin
                        }
                    };

                    callback(null, response);
                }
            );
        });
    });
}


module.exports = { getRolesId, registerAdmin, getLastUserId };
