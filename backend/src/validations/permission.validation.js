const { z } = require('zod');

exports.createPermissionSchema = z.object({
  body: z.object({
    action: z.string(),
    resource: z.string(),
    description: z.string().optional(),
  })
});

exports.updatePermissionSchema = z.object({
  body: z.object({
    action: z.string().optional(),
    resource: z.string().optional(),
    description: z.string().optional(),
  })
});
