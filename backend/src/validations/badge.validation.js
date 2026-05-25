const { z } = require('zod');

exports.createBadgeSchema = z.object({
  body: z.object({
    name: z.string(),
    icon: z.string(),
    description: z.string().optional(),
    type: z.enum(['streak', 'completion', 'practice', 'achievement']),
    conditionKey: z.string(),
    conditionValue: z.number(),
    isActive: z.boolean().optional(),
  })
});

exports.updateBadgeSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    icon: z.string().optional(),
    description: z.string().optional(),
    type: z.enum(['streak', 'completion', 'practice', 'achievement']).optional(),
    conditionKey: z.string().optional(),
    conditionValue: z.number().optional(),
    isActive: z.boolean().optional(),
  })
});
