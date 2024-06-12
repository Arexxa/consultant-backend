// utils/response.js
const { dateTime } = require('./timestamp');

function generateErrorResponse(message, detail, statusCode = 500) {
    return {
        status: statusCode,
        transaction: {
            message: 'Error',
            detail: detail || message,
            dateTime: dateTime()
        }
    };
}

function generateSuccessResponse(data) {
    return {
        status: 200,
        transaction: {
            message: 'OK',
            dateTime: dateTime()
        },
        ...data
    };
}

module.exports = { generateErrorResponse, generateSuccessResponse };
