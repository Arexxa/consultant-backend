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
            const userProfile = {
                userId: results[0].userId,
                roleId: results[0].roleId,
                name: results[0].name,
                email: results[0].email,
                // password: results[0].password,
                contact_no: results[0].contact_no,
                address: results[0].address,
                city: results[0].city,
                state: results[0].state,
                country: results[0].country,
                profile_description: results[0].profile_description,
                portfolio: results[0].portfolio,
                website: results[0].website,
                taggedByAdmin: results[0].taggedByAdmin,
                adminId: results[0].adminId,
                insert_datetime: results[0].insert_datetime
            };
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
