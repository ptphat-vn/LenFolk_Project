const { z } = require('zod');

exports.createStreakSchema = z.object({
  body: z.object({
    // userId is injected server-side from the token — not required from client
    userId: z.string().optional(),
    currentStreak: z.number().optional(),
    longestStreak: z.number().optional(),
    totalActiveDays: z.number().optional(),
    lastActiveDate: z.string().datetime().optional(),
  }),
});

exports.updateStreakSchema = z.object({
  body: z.object({
    userId: z.string().optional(),
    currentStreak: z.number().optional(),
    longestStreak: z.number().optional(),
    totalActiveDays: z.number().optional(),
    lastActiveDate: z.string().datetime().optional(),
  }),
});
