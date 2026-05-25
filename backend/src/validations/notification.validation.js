const { z } = require('zod');

exports.createNotificationSchema = z.object({
  body: z.object({
  userId: z.string(),
  title: z.string(),
  body: z.string(),
  type: z.enum(['lesson', 'badge', 'subscription', 'streak', 'moderation', 'system']),
  isRead: z.boolean().optional(),
  data: z.any().optional(),
  readAt: z.string().datetime().optional(),
  })
});

exports.updateNotificationSchema = z.object({
  body: z.object({
  userId: z.string().optional(),
  title: z.string().optional(),
  body: z.string().optional(),
  type: z.enum(['lesson', 'badge', 'subscription', 'streak', 'moderation', 'system']).optional(),
  isRead: z.boolean().optional(),
  data: z.any().optional(),
  readAt: z.string().datetime().optional(),
  })
});
