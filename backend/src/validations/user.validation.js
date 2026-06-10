const { z } = require('zod');

exports.createUserSchema = z.object({
  body: z.object({
  name: z.string(),
  email: z.string(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  dateOfBirth: z.string().datetime().optional(),
  passwordHash: z.string(),
  avatar: z.string().optional(),
  phoneNumber: z.string().optional(),
  role: z.enum(['admin', 'instructor', 'learner', 'guest']).optional(),
  isActive: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  refreshToken: z.string().optional(),
  lastLoginAt: z.string().datetime().optional(),
  deletedAt: z.string().datetime().optional(),
  })
});

exports.updateUserSchema = z.object({
  body: z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  dateOfBirth: z.string().datetime().optional(),
  passwordHash: z.string().optional(),
  avatar: z.string().optional(),
  phoneNumber: z.string().optional(),
  role: z.enum(['admin', 'instructor', 'learner', 'guest']).optional(),
  isActive: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  refreshToken: z.string().optional(),
  lastLoginAt: z.string().datetime().optional(),
  deletedAt: z.string().datetime().optional(),
  })
});
