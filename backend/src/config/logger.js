const winston = require('winston');
const path = require('path');
const config = require('./index');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    let logMessage = `[${timestamp}] ${level}: ${message}`;
    if (stack) {
      logMessage += `\n${stack}`;
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
  // File specifically for errors
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/errors.log'),
    level: 'error'
  }),
  // File specifically for warnings
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/warnings.log'),
    level: 'warn'
  }),
  // File for info
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/info.log'),
    level: 'info'
  })
];

const logger = winston.createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
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
