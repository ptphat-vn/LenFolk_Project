const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let logMessage = `[${timestamp}] ${level}: ${message}`;
    if (stack) {
      logMessage += `\n${stack}`;
    }
    if (Object.keys(meta).length > 0) {
      logMessage += `\n${JSON.stringify(meta)}`;
    }
    return logMessage;
  })
);

// Define transports
const transports = [
  // Console output
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      logFormat
    ),
  }),
  // Daily rotate file for all logs
  new winston.transports.DailyRotateFile({
    filename: path.join(__dirname, '../../logger/application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'info'
  }),
  // Daily rotate file specifically for errors
  new winston.transports.DailyRotateFile({
    filename: path.join(__dirname, '../../logger/error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    level: 'error'
  })
];

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: logFormat,
  transports,
});

// Stream for Morgan integration
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = logger;
