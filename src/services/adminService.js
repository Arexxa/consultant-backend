const db = require('../db');
const { generateTimestamp, dateTime } = require('../utils/timestamp');

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
                console.error('Error executing MySQL query:', error);
                return callback({ error: 'Internal Server Error' }, null);
            }

            if (results.length === 0) {
                return callback({ error: 'Users not found' }, null);
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

                // Populate workexperience (only 1)
                if (row.workExperienceId && row.workCurrentEmployer === 1) {
                    // Check if the user already has a work experience with current employer
                    const currentEmployerIndex = userMap[row.userId].workExperience.findIndex(we => we.workCurrentEmployer === 1);
                    if (currentEmployerIndex === -1) {
                        // If the user doesn't have a work experience with current employer, add it
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

            const response = {
                transaction: {
                    message: 'OK',
                    dateTime: dateTime()
                },
                result: userProfiles
            };

            callback(null, response);
        }
    );
}

module.exports = { getUserListByAdmin };