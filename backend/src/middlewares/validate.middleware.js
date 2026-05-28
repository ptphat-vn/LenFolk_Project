const AppError = require('../utils/AppError');
const { ZodError } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    const parsedData = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // Replace request data with parsed/sanitized data from zod
    if (parsedData.body) req.body = parsedData.body;
    if (parsedData.query) req.query = parsedData.query;
    if (parsedData.params) req.params = parsedData.params;

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = error.issues.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      
      const errorMessage = formattedErrors
        .map((err) => `${err.path}: ${err.message}`)
        .join(', ');

      return next(new AppError(`Validation Failed: ${errorMessage}`, 400));
    }
    next(error);
  }
};

module.exports = validate;
