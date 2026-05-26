const { z } = require('zod');

exports.createAuditLogSchema = z.object({
  body: z.object({
  actorId: z.string(),
  actorRole: z.enum(['admin', 'instructor', 'moderator', 'learner', 'guest']),
  action: z.string(),
  resource: z.string(),
  resourceId: z.string().optional(),
  before: z.any().optional(),
  after: z.any().optional(),
  ipAddress: z.string().optional(),
  })
});

exports.updateAuditLogSchema = z.object({
  body: z.object({
  actorId: z.string().optional(),
  actorRole: z.enum(['admin', 'instructor', 'moderator', 'learner', 'guest']).optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  resourceId: z.string().optional(),
  before: z.any().optional(),
  after: z.any().optional(),
  ipAddress: z.string().optional(),
  })
});
