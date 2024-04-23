// services/profileService.js
const db = require('../db');
const { dateTime } = require('../utils/timestamp');

function getUserProfile(userId, callback) {
    db.query('SELECT * FROM cons_profile WHERE userId = ?',
        [userId],
        (error, results) => {
            if (error) {
                console.error('Error executing MySQL query:', error);
                return callback({ error: 'Internal Server Error' }, null);
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
                insert_datetime: row.insert_datetime
            }));
            const response = {
                transaction: {
                    message: 'OK',
                    dateTime: dateTime()
                },
                result: userProfile
            };
            callback(null, response);
        });
}

module.exports = { getUserProfile };
