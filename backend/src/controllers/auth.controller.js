const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config');

const signToken = (id, email, role, expiresIn) => {
  return jwt.sign({ id, email, role }, config.jwt.secret, {
    expiresIn,
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const newUser = await User.create({ name, email, passwordHash: password });

    const accessToken = signToken(
      newUser._id,
      newUser.email,
      newUser.role,
      config.jwt.accessExpiresIn,
    );
    const refreshToken = signToken(
      newUser._id,
      newUser.email,
      newUser.role,
      config.jwt.refreshExpiresIn,
    );

    newUser.refreshToken = refreshToken;
    await newUser.save({ validateBeforeSave: false });

    const userData = newUser.toJSON();

    res.status(201).json({
      success: true,
      data: {
        message: 'Đăng ký tài khoản thành công',
        user: userData,
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const accessToken = signToken(
      user._id,
      user.email,
      user.role,
      config.jwt.accessExpiresIn,
    );
    const refreshToken = signToken(
      user._id,
      user.email,
      user.role,
      config.jwt.refreshExpiresIn,
    );

    user.lastLoginAt = new Date();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: {
        message: 'Đăng nhập thành công',
        accessToken,
        refreshToken,
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }

    const decoded = jwt.verify(refreshToken, config.jwt.secret);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const accessToken = signToken(
      user._id,
      user.email,
      user.role,
      config.jwt.accessExpiresIn,
    );

    res.status(200).json({
      success: true,
      data: {
        message: 'Làm mới token thành công',
        accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }

    const decoded = jwt.verify(refreshToken, config.jwt.secret);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công',
    });
  } catch (err) {
    next(err);
  }
};
