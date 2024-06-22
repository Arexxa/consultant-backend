// logger.js
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;
require('winston-daily-rotate-file');

// Custom function to format date
const dateTime = () => {
    const malaysiaOptions = { timeZone: 'Asia/Kuala_Lumpur' };
    return new Date().toLocaleString('en-GB', malaysiaOptions);
};

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Adjusted date pattern
    logFormat
  ),
  transports: [
    new transports.Console(), // Log to the console
    new transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    })
  ],
  exceptionHandlers: [
    new transports.File({ filename: 'logs/exceptions.log' })
  ]
});

module.exports = { logger, dateTime };
