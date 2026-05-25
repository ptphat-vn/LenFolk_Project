const { z } = require('zod');

exports.createModeratorLogSchema = z.object({
  body: z.object({
  moderatorId: z.string(),
  action: z.enum(['approve_comment', 'delete_comment', 'warn_user', 'ban_user', 'unban_user', 'resolve_report', 'dismiss_report']),
  targetType: z.enum(['user', 'comment', 'report', 'course', 'lesson']),
  targetId: z.string(),
  reason: z.string().optional(),
  note: z.string().optional(),
  })
});

exports.updateModeratorLogSchema = z.object({
  body: z.object({
  moderatorId: z.string().optional(),
  action: z.enum(['approve_comment', 'delete_comment', 'warn_user', 'ban_user', 'unban_user', 'resolve_report', 'dismiss_report']).optional(),
  targetType: z.enum(['user', 'comment', 'report', 'course', 'lesson']).optional(),
  targetId: z.string().optional(),
  reason: z.string().optional(),
  note: z.string().optional(),
  })
});
