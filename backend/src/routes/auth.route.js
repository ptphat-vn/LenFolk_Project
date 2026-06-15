const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const { z } = require('zod');

// Zod schemas
const registerSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(2, 'Name must be at least 2 characters'),
    email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
    password: z.string({ required_error: 'Password is required' }).min(8, 'Password must be at least 8 characters'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
    password: z.string({ required_error: 'Password is required' }).min(1),
  }),
});

const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string({ required_error: 'Refresh token is required' }),
  }),
});

const verifyEmailSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
    code: z.string({ required_error: 'Code is required' }).length(6, 'Mã xác thực gồm 6 chữ số'),
  }),
});

const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
    code: z.string({ required_error: 'Code is required' }).length(6, 'Mã đặt lại gồm 6 chữ số'),
    newPassword: z.string({ required_error: 'New password is required' }).min(8, 'Password must be at least 8 characters'),
  }),
});

// POST /api/auth/register
router.post('/register', validate(registerSchema), authController.register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), authController.login);

// POST /api/auth/refresh-token
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);

// POST /api/auth/logout
router.post('/logout', validate(refreshTokenSchema), authController.logout);

// POST /api/auth/verify-email
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);

// POST /api/auth/resend-verification
router.post('/resend-verification', validate(resendVerificationSchema), authController.resendVerification);

// POST /api/auth/forgot-password
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;
