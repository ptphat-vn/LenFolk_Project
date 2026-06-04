const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const logger = require('./config/logger')
app.use(morgan('dev', { stream: logger.stream }))

// Routes
const routes = require('./routes')

app.use('/api', routes)

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running'
  })
})
// Handle undefined routes
app.all('/{*splat}', (req, res, next) => {
  class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});


// Global Error Handler Middleware
const globalErrorHandler = require('./middlewares/error.middleware');
app.use(globalErrorHandler);

module.exports = app
