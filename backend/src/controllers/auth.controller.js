const User = require('../models/User');
const InstructorProfile = require('../models/InstructorProfile');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { generateOtp, hashOtp, otpExpiry, OTP_TTL_MINUTES } = require('../utils/otp');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/email.service');

const signToken = (id, email, role, expiresIn) => {
  return jwt.sign({ id, email, role }, config.jwt.secret, {
    expiresIn,
  });
};

// Sinh OTP mới, lưu (đã hash) vào user và gửi email xác thực. Trả về mã thô để (tùy chọn) log khi dev.
const issueVerificationCode = async (user) => {
  const code = generateOtp();
  user.verificationCode = hashOtp(code);
  user.verificationCodeExpires = otpExpiry();
  await user.save({ validateBeforeSave: false });
  await sendVerificationEmail(user, code); // service tự nuốt lỗi, không làm hỏng request
  return code;
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 8 ký tự' });
    }

    const newUser = await User.create({ name, email, passwordHash: password });

    // Gửi mã OTP xác thực email (không chặn đăng ký nếu mail lỗi)
    await issueVerificationCode(newUser);

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
        message: 'Đăng ký thành công. Vui lòng kiểm tra email để lấy mã xác thực.',
        user: userData,
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/register-instructor
 * Đăng ký tài khoản giảng viên (role=instructor) ở trạng thái CHỜ DUYỆT.
 * Chưa trả token — phải được admin duyệt mới đăng nhập được.
 */
exports.registerInstructor = async (req, res, next) => {
  try {
    const { name, email, password, bio, expertise, websiteUrl, bankDetails } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
    }

    const newUser = await User.create({
      name,
      email,
      passwordHash: password,
      role: 'instructor',
    });

    // Tạo hồ sơ giảng viên ở trạng thái pending. Rollback user nếu tạo hồ sơ lỗi.
    try {
      await InstructorProfile.create({
        userId: newUser._id,
        status: 'pending',
        bio: bio || null,
        expertise: expertise || null,
        websiteUrl: websiteUrl || null,
        bankDetails: bankDetails || undefined,
      });
    } catch (profileErr) {
      await User.deleteOne({ _id: newUser._id });
      throw profileErr;
    }

    res.status(201).json({
      success: true,
      data: {
        message: 'Đăng ký giảng viên thành công. Đơn của bạn đang chờ admin duyệt — bạn sẽ nhận email khi được duyệt.',
        userId: newUser._id,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/verify-email  { email, code }
 * Xác thực tài khoản bằng mã OTP đã gửi qua email.
 */
exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email }).select(
      '+verificationCode +verificationCodeExpires',
    );
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản' });
    if (user.isVerified)
      return res.status(400).json({ success: false, message: 'Tài khoản đã được xác thực' });
    if (!user.verificationCode || !user.verificationCodeExpires)
      return res.status(400).json({ success: false, message: 'Chưa có mã xác thực. Vui lòng yêu cầu gửi lại.' });
    if (user.verificationCodeExpires < new Date())
      return res.status(400).json({ success: false, message: 'Mã xác thực đã hết hạn. Vui lòng yêu cầu gửi lại.' });
    if (user.verificationCode !== hashOtp(code))
      return res.status(400).json({ success: false, message: 'Mã xác thực không đúng' });

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: { message: 'Xác thực email thành công', user: user.toJSON() },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/resend-verification  { email }
 * Gửi lại mã OTP xác thực. Luôn trả message trung tính để tránh dò email.
 */
exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user && !user.isVerified) {
      await issueVerificationCode(user);
    }

    res.status(200).json({
      success: true,
      data: { message: `Nếu email tồn tại và chưa xác thực, mã mới đã được gửi (hiệu lực ${OTP_TTL_MINUTES} phút).` },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/forgot-password  { email }
 * Sinh mã OTP đặt lại mật khẩu và gửi qua email. Trả message trung tính để tránh dò email.
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      const code = generateOtp();
      user.resetPasswordCode = hashOtp(code);
      user.resetPasswordExpires = otpExpiry();
      await user.save({ validateBeforeSave: false });
      await sendPasswordResetEmail(user, code); // service tự nuốt lỗi
    }

    res.status(200).json({
      success: true,
      data: { message: `Nếu email tồn tại, mã đặt lại mật khẩu đã được gửi (hiệu lực ${OTP_TTL_MINUTES} phút).` },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/reset-password  { email, code, newPassword }
 * Xác minh mã OTP rồi đặt mật khẩu mới. Đăng xuất mọi phiên (xóa refreshToken).
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;

    const user = await User.findOne({ email }).select(
      '+resetPasswordCode +resetPasswordExpires +passwordHash',
    );
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản' });
    if (!user.resetPasswordCode || !user.resetPasswordExpires)
      return res.status(400).json({ success: false, message: 'Chưa có yêu cầu đặt lại mật khẩu. Vui lòng thử lại.' });
    if (user.resetPasswordExpires < new Date())
      return res.status(400).json({ success: false, message: 'Mã đặt lại đã hết hạn. Vui lòng yêu cầu lại.' });
    if (user.resetPasswordCode !== hashOtp(code))
      return res.status(400).json({ success: false, message: 'Mã đặt lại không đúng' });

    // pre('save') của model tự hash passwordHash khi field này thay đổi
    user.passwordHash = newPassword;
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;
    user.refreshToken = null; // buộc đăng nhập lại trên mọi thiết bị
    await user.save();

    res.status(200).json({
      success: true,
      data: { message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.' },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu' });
    }

    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    // Giảng viên phải được admin duyệt mới đăng nhập được
    if (user.role === 'instructor') {
      const profile = await InstructorProfile.findOne({ userId: user._id }).select('status rejectReason');
      if (profile && profile.status === 'pending') {
        return res.status(403).json({
          success: false,
          message: 'Đơn đăng ký giảng viên đang chờ admin duyệt. Vui lòng thử lại sau khi được duyệt.',
        });
      }
      if (profile && profile.status === 'rejected') {
        return res.status(403).json({
          success: false,
          message: profile.rejectReason
            ? `Đơn đăng ký giảng viên đã bị từ chối. Lý do: ${profile.rejectReason}`
            : 'Đơn đăng ký giảng viên đã bị từ chối.',
        });
      }
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
      return res.status(400).json({ success: false, message: 'Refresh token là bắt buộc' });
    }

    const decoded = jwt.verify(refreshToken, config.jwt.secret);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token không hợp lệ hoặc đã hết hạn' });
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
      return res.status(400).json({ success: false, message: 'Refresh token là bắt buộc' });
    }

    const decoded = jwt.verify(refreshToken, config.jwt.secret);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token không hợp lệ' });
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
