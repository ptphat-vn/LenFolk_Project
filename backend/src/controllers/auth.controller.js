const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const signToken = (id, email, role, expiresIn) => {
  return jwt.sign({ id, email, role }, config.jwt.secret, {
    expiresIn,
  });
};

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email already in use', 400));
  }

  if (password.length < 8) {
    return next(new AppError('Password must be at least 8 characters', 400));
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
      message: 'User registered successfully',
      user: userData,
      accessToken,
      refreshToken,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password', 401));
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
      message: 'Login successful',
      accessToken,
      refreshToken,
      user,
    },
  });
});

exports.refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 400));
  }

  const decoded = jwt.verify(refreshToken, config.jwt.secret);
  const user = await User.findById(decoded.id).select('+refreshToken');

  if (!user || user.refreshToken !== refreshToken) {
    return next(new AppError('Invalid or expired refresh token', 401));
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
      message: 'Token refreshed successfully',
      accessToken,
    },
  });
});

exports.logout = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 400));
  }

  const decoded = jwt.verify(refreshToken, config.jwt.secret);
  const user = await User.findById(decoded.id).select('+refreshToken');

  if (!user || user.refreshToken !== refreshToken) {
    return next(new AppError('Invalid refresh token', 401));
  }

  user.refreshToken = null;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});
