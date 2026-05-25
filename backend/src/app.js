const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

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

module.exports = app