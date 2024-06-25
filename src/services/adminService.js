const db = require('../db');
const { generateTimestamp, dateTime } = require('../utils/timestamp');
const { generateErrorResponse, generateSuccessResponse } = require('../utils/response');
const logger = require('../utils/logger');

function getUserListByAdmin(callback) {
    db.query(
        `SELECT
            p.userId,
            p.roleId,
            p.name,
            p.status,
            w.WorkExperienceID AS workExperienceId,
            w.position AS workPosition,
            w.currentEmployer AS workCurrentEmployer,
            a.documentID AS documentId,
            a.documentType,
            a.fileData,
            a.uploadDate,
            n.noteId,
            n.title,
            n.description
        FROM cons_profile p
        LEFT JOIN cons_application a ON p.userId = a.userId AND a.documentType = 'Resume'
        LEFT JOIN cons_workexperience w ON p.userId = w.userId
        LEFT JOIN cons_notes n ON p.userId = n.userId
        WHERE p.roleId != '1'`,
        (error, results) => {
            if (error) {
                logger.error('Error executing MySQL query:', error);
                const response = generateErrorResponse('Internal Server Error', 'Error executing MySQL query');
                return callback(response, null);
            }

            if (results.length === 0) {
                const response = generateErrorResponse('Users not found', 'No users found in the database', 404);
                logger.error('Users not found');
                return callback(null, response);
            }

            const userMap = {};

            // Organize the results by userId
            results.forEach(row => {
                if (!userMap[row.userId]) {
                    userMap[row.userId] = {
                        userId: row.userId,
                        roleId: row.roleId,
                        name: row.name,
                        status: row.status,
                        applications: [],
                        workExperience: [],
                        notes: []
                    };
                }

                // Populate applications (only Resumes)
                if (row.documentId && row.documentType === 'Resume') {
                    const existingApplicationIndex = userMap[row.userId].applications.findIndex(app => app.documentId === row.documentId);
                    if (existingApplicationIndex === -1) {
                        userMap[row.userId].applications.push({
                            documentId: row.documentId,
                            fileData: row.fileData,
                            uploadDate: row.uploadDate,
                            documentType: row.documentType
                        });
                    }
                }

                // Populate work experience (only 1)
                if (row.workExperienceId && row.workCurrentEmployer === 1) {
                    const currentEmployerIndex = userMap[row.userId].workExperience.findIndex(we => we.workCurrentEmployer === 1);
                    if (currentEmployerIndex === -1) {
                        userMap[row.userId].workExperience.push({
                            workExperienceId: row.workExperienceId,
                            position: row.workPosition,
                            currentEmployer: row.workCurrentEmployer,
                        });
                    }
                }

                // Populate notes
                if (row.noteId) {
                    const existingNoteIndex = userMap[row.userId].notes.findIndex(note => note.noteId === row.noteId);
                    if (existingNoteIndex === -1) {
                        userMap[row.userId].notes.push({
                            noteId: row.noteId,
                            title: row.title,
                            description: row.description
                        });
                    }
                }
            });

            const userProfiles = Object.values(userMap);

            const response = generateSuccessResponse({ result: userProfiles });
            logger.info('User profiles retrieved successfully');
            callback(null, response);
        }
    );
}

module.exports = { getUserListByAdmin };
