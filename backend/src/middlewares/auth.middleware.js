const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const JWT_SECRET = config.jwt.secret;

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};
const verifyInstructor = (req, res, next) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};
const verifyModerator = (req, res, next) => {
  if (req.user.role !== 'moderator') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};
const verifyLearner = (req, res, next) => {
  if (req.user.role !== 'learner') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};
const verifyInstructorOrAdmin = (req, res, next) => {
  if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Instructor or Admin required.' });
  }
  next();
};
module.exports = {
  verifyToken,
  verifyAdmin,
  verifyInstructor,
  verifyInstructorOrAdmin,
  verifyModerator,
  verifyLearner,
};
