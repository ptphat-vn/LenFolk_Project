const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    if (decoded.tokenVersion !== user.tokenVersion) {
      return res
        .status(401)
        .json({ message: 'Session expired, please login again' });
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
module.exports = {
  verifyToken,
  verifyAdmin,
  verifyInstructor,
  verifyModerator,
  verifyLearner,
};
