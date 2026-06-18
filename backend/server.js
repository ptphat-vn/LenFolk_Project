const config = require('./src/config')
const app = require('./src/app')
const connectDB = require('./src/config/db')
const logger = require('./src/config/logger')
const http = require('http')
const initAiAnalysisWebSocket = require('./src/websocket/ai-analysis.ws')

const PORT = config.port

// Connect database
connectDB()

const server = http.createServer(app)
initAiAnalysisWebSocket(server)

// Start server
server.listen(PORT, () => {
  logger.info(`Server running on port http://localhost:${PORT}`);
  logger.info(`API docs available at http://localhost:${PORT}/api/docs`);
  logger.info(`AI WebSocket available at ws://localhost:${PORT}/api/ai-analysis/stream`);
})
