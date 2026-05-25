const User = require('../models/User');
const jwt = require('jsonwebtoken');
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters' });
    }
    const existEmail = await User.findOne({ email });
    if (existEmail) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    const newUser = await User.create({ name, email, passwordHash: password });
    const jwtSecret = process.env.JWT_SECRET;
    const accessToken = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
      },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );
    const refreshToken = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
      },
      jwtSecret,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN },
    );
    newUser.refreshToken = refreshToken;
    await newUser.save();
    const userData = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      dateOfBirth: newUser.dateOfBirth,
      gender: newUser.gender,
      avatar: newUser.avatar,
      phoneNumber: newUser.phoneNumber,
      isActive: newUser.isActive,
      isVerified: newUser.isVerified,
      lastLoginAt: newUser.lastLoginAt,
      deletedAt: newUser.deletedAt,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };
    res.status(201).json({
      data: {
        message: 'User registered successfully',
        user: userData,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const jwtSecret = process.env.JWT_SECRET;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const accessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN },
    );
    const refreshToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      jwtSecret,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN },
    );
    user.refreshToken = refreshToken;
    await user.save();
    res.status(200).json({
      data: {
        message: 'Login successful',
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    const jwtSecret = process.env.JWT_SECRET;
    const decoded = jwt.verify(refreshToken, jwtSecret);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ message: 'Invalid refresh token' });
    }
    const accessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN },
    );
    res.status(200).json({
      data: {
        message: 'Token refreshed successfully',
        accessToken,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    const jwtSecret = process.env.JWT_SECRET;
    const decoded = jwt.verify(refreshToken, jwtSecret);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ message: 'Invalid refresh token' });
    }
    user.refreshToken = null;
    await user.save();
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
