// services/adminRegister.js
const bcrypt = require('bcrypt');
const db = require('../db');
const { generateTimestamp, dateTime } = require('../utils/timestamp');
const { generateErrorResponse, generateSuccessResponse } = require('../utils/response');
const logger = require('../utils/logger');
const Role = require('../models/Roles');
const AdminRegister = require('../models/Admin/Register');

function getRolesId(callback) {
    db.query('SELECT * FROM cons_role', (error, results) => {
        if (error) {
            logger.error('Error executing MySQL query:', error);
            const response = generateErrorResponse('Internal Server Error', 'Error executing MySQL query');
            return callback(response, null);
        }
        const roles = results.map(row => new Role(row.roleId, row.role_name));
        const response = generateSuccessResponse({ result: roles });
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

    if (!email || !password) {
        const response = generateErrorResponse('Please provide email and password', 'Validation Error', 400);
        logger.error(`Error registering admin: ${response.transaction.detail}`);
        return callback(response, null);
    }

    if (!name) {
        const response = generateErrorResponse('Please provide your name', 'Validation Error', 400);
        logger.error(`Error registering admin: ${response.transaction.detail}`);
        return callback(response, null);
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            logger.error('Error hashing password:', err);
            return callback(generateErrorResponse('Internal Server Error', 'Error hashing password'), null);
        }

        getLastUserId((error, lastUserId) => {
            if (error) {
                logger.error('Error getting last userId:', error);
                return callback(generateErrorResponse('Internal Server Error', 'Error getting last userId'), null);
            }

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
                            const response = generateErrorResponse('Email already exists', 'Duplicate Entry', 400);
                            logger.error(`Error registering admin: ${response.transaction.detail}`);
                            return callback(response, null);
                        }
                        logger.error('Error executing MySQL query:', error);
                        return callback(generateErrorResponse('Internal Server Error', 'Error executing MySQL query'), null);
                    }

                    const response = generateSuccessResponse({
                        result: {
                            userId: results.insertId,
                            ...admin
                        }
                    });
                    logger.info(`Admin registered successfully with userId ${userId}`);
                    callback(null, response);
                }
            );
        });
    });
}

module.exports = { getRolesId, registerAdmin, getLastUserId };
