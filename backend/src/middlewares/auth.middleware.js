const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const JWT_SECRET = config.jwt.secret;

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Chưa cung cấp token' });
    }
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Không tìm thấy người dùng' });
    }
    if (!user.isActive) {
      return res.status(401).json({ message: 'Tài khoản đã bị vô hiệu hóa' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
};
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Không có quyền truy cập' });
  }
  next();
};
const verifyInstructor = (req, res, next) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ message: 'Không có quyền truy cập' });
  }
  next();
};
const verifyUser = (req, res, next) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: 'Không có quyền truy cập' });
  }
  next();
};
const verifyInstructorOrAdmin = (req, res, next) => {
  if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
    return res
      .status(403)
      .json({ message: 'Không có quyền truy cập. Yêu cầu quyền giảng viên hoặc admin.' });
  }
  next();
};

// Token optional — nếu không có/token lỗi thì req.user = null, không trả 401
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    req.user = user && user.isActive ? user : null;
  } catch {
    req.user = null;
  }
  next();
};

module.exports = {
  verifyToken,
  optionalAuth,
  verifyAdmin,
  verifyInstructor,
  verifyInstructorOrAdmin,
  verifyUser,
};
