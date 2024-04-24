const db = require('../db');
const { dateTime } = require('../utils/timestamp');

function getUserProfile(userId, callback) {
    db.query(
        `SELECT 
            p.userId,
            p.roleId,
            p.name,
            p.email,
            p.contact_no,
            p.address,
            p.city,
            p.state,
            p.country,
            p.profile_description,
            p.portfolio,
            p.website,
            p.taggedByAdmin,
            p.adminId,
            p.insert_datetime,
            w.WorkExperienceID,
            w.position,
            w.company,
            w.currentEmployer,
            w.description AS work_description,
            w.startDate AS work_startDate,
            w.endDate AS work_endDate,
            e.educationId,
            e.university,
            e.course,
            e.startDate AS education_startDate,
            e.endDate AS education_endDate,
            a.documentID,
            a.documentType,
            a.fileName,
            a.uploadDate
        FROM cons_profile p
        LEFT JOIN cons_workexperience w ON p.userId = w.userId
        LEFT JOIN cons_education e ON p.userId = e.userId
        LEFT JOIN cons_application a ON p.userId = a.userId
        WHERE p.userId = ?`,
        [userId],
        (error, results) => {
            if (error) {
                console.error('Error executing MySQL query:', error);
                return callback({ error: 'Internal Server Error' }, null);
            }

            if (results.length === 0) {
                return callback({ error: 'User not found' }, null);
            }

            const userProfile = results.map(row => ({
                userId: row.userId,
                roleId: row.roleId,
                name: row.name,
                email: row.email,
                contact_no: row.contact_no,
                address: row.address,
                city: row.city,
                state: row.state,
                country: row.country,
                profile_description: row.profile_description,
                portfolio: row.portfolio,
                website: row.website,
                taggedByAdmin: row.taggedByAdmin,
                adminId: row.adminId,
                insert_datetime: row.insert_datetime,
                workExperience: [],
                education: [],
                applications: []
            }));
            
            // Populate work experiences
            results.forEach(row => {
                if (row.WorkExperienceID) {
                    userProfile[0].workExperience.push({
                        workExperienceId: row.WorkExperienceID,
                        position: row.position,
                        company: row.company,
                        currentEmployer: row.currentEmployer,
                        description: row.work_description,
                        startDate: row.work_startDate,
                        endDate: row.work_endDate
                    });
                }
            });
            
            // Populate education details
            results.forEach(row => {
                if (row.educationId) {
                    userProfile[0].education.push({
                        educationId: row.educationId,
                        university: row.university,
                        course: row.course,
                        startDate: row.education_startDate,
                        endDate: row.education_endDate
                    });
                }
            });
            
            // Populate applications
            results.forEach(row => {
                if (row.documentID) {
                    userProfile[0].applications.push({
                        documentId: row.documentID,
                        documentType: row.documentType,
                        fileName: row.fileName,
                        uploadDate: row.uploadDate
                    });
                }
            });
            

            const response = {
                transaction: {
                    message: 'OK',
                    dateTime: dateTime()
                },
                result: userProfile
            };
            callback(null, response);
        }
    );
}


// function updateUserProfile(userId, updatedProfile, callback) {
//     console.log('New profile data:', updatedProfile);

//     if (typeof callback !== 'function') {
//         console.error('Callback is not a function');
//         // Return an error if callback is missing or not a function
//         return;
//     }

//     db.query(
//         'UPDATE cons_profile SET name = ?, email = ?, contact_no = ?, address = ?, city = ?, state = ?, country = ?, profile_description = ?, portfolio = ?, website = ? WHERE userId = ?',
//         [
//             updatedProfile.name,
//             updatedProfile.email,
//             updatedProfile.contact_no,
//             updatedProfile.address,
//             updatedProfile.city,
//             updatedProfile.state,
//             updatedProfile.country,
//             updatedProfile.profile_description,
//             updatedProfile.portfolio,
//             updatedProfile.website,
//             userId
//         ],
//         (error, results) => {
//             if (error) {
//                 console.error('Error updating cons_profile:', error);
//                 return callback({ error: 'Internal Server Error' }, null);
//             }

//             console.log('Profile updated successfully');
//             callback(null, { message: 'Profile updated successfully' });
//         }
//     );
// }

function updateUserProfile(userId, updatedProfile, callback) {
    console.log('New profile data:', updatedProfile);

    if (typeof callback !== 'function') {
        console.error('Callback is not a function');
        // Return an error if callback is missing or not a function
        return;
    }

    db.beginTransaction((beginTransactionErr) => {
        if (beginTransactionErr) {
            console.error('Error beginning transaction:', beginTransactionErr);
            return callback({ error: 'Internal Server Error' }, null);
        }

        // Update profile details
        db.query(
            `UPDATE cons_profile
            SET
                name = ?,
                email = ?,
                contact_no = ?,
                address = ?,
                city = ?,
                state = ?,
                country = ?,
                profile_description = ?,
                portfolio = ?,
                website = ?
            WHERE userId = ?`,
            [
                updatedProfile.name,
                updatedProfile.email,
                updatedProfile.contact_no,
                updatedProfile.address,
                updatedProfile.city,
                updatedProfile.state,
                updatedProfile.country,
                updatedProfile.profile_description,
                updatedProfile.portfolio,
                updatedProfile.website,
                userId
            ],
            (profileUpdateErr, profileUpdateResults) => {
                if (profileUpdateErr) {
                    console.error('Error updating profile:', profileUpdateErr);
                    return db.rollback(() => {
                        callback({ error: 'Internal Server Error' }, null);
                    });
                }

                console.log('Profile updated successfully');

                // Update work experience
                db.query(
                    `UPDATE cons_workexperience
                    SET
                        position = ?,
                        company = ?,
                        currentEmployer = ?
                    WHERE userId = ?`,
                    [
                        updatedProfile.workExperience.position,
                        updatedProfile.workExperience.company,
                        updatedProfile.workExperience.currentEmployer,
                        userId
                    ],
                    (workExperienceUpdateErr, workExperienceUpdateResults) => {
                        if (workExperienceUpdateErr) {
                            console.error('Error updating work experience:', workExperienceUpdateErr);
                            return db.rollback(() => {
                                callback({ error: 'Internal Server Error' }, null);
                            });
                        }

                        console.log('Work experience updated successfully');

                        // Similarly, update education and applications tables here

                        db.commit((commitErr) => {
                            if (commitErr) {
                                console.error('Error committing transaction:', commitErr);
                                return db.rollback(() => {
                                    callback({ error: 'Internal Server Error' }, null);
                                });
                            }

                            console.log('Transaction committed successfully');
                            callback(null, { message: 'Profile updated successfully' });
                        });
                    }
                );
            }
        );
    });
}

module.exports = { getUserProfile, updateUserProfile };

