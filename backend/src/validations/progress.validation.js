const { z } = require('zod');

exports.createProgressSchema = z.object({
  body: z.object({
  userId: z.string(),
  courseId: z.string(),
  lessonId: z.string(),
  status: z.enum(['not_started', 'in_progress', 'completed']).optional(),
  watchedSeconds: z.number().optional(),
  completionPercent: z.number().optional(),
  bestPracticeScore: z.number().optional(),
  attemptCount: z.number().optional(),
  lastAccessedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  })
});

exports.updateProgressSchema = z.object({
  body: z.object({
  userId: z.string().optional(),
  courseId: z.string().optional(),
  lessonId: z.string().optional(),
  status: z.enum(['not_started', 'in_progress', 'completed']).optional(),
  watchedSeconds: z.number().optional(),
  completionPercent: z.number().optional(),
  bestPracticeScore: z.number().optional(),
  attemptCount: z.number().optional(),
  lastAccessedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  })
});
