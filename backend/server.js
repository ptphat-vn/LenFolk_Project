require('dotenv').config()
const app = require('./src/app')
const connectDB = require('./src/config/db')
const logger = require('./src/config/logger')

const PORT = process.env.PORT || 5000

// Connect database
connectDB()

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port http://localhost:${PORT}`);
  logger.info(`API docs available at http://localhost:${PORT}/api/docs`);
})