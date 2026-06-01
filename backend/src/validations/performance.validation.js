const { z } = require('zod');

const mongoId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

exports.createPerformanceSchema = z.object({
  body: z.object({
    // instructorId được inject từ token phía server — client không cần gửi
    instructorId: mongoId.optional(),
    title: z.string(),
    description: z.string().optional(),
    thumbnail: z.string().optional(),
    videoUrl: z.string().optional(),
    isFree: z.boolean().optional(),
    genre: z.string().optional(),
    duration: z.number().min(0).optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    tags: z.array(z.string()).optional(),
    isFeatured: z.boolean().optional(),
    publishedAt: z.string().datetime().optional(),
  }),
});

exports.updatePerformanceSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    thumbnail: z.string().optional(),
    videoUrl: z.string().optional(),
    isFree: z.boolean().optional(),
    genre: z.string().optional(),
    duration: z.number().min(0).optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    tags: z.array(z.string()).optional(),
    isFeatured: z.boolean().optional(),
    publishedAt: z.string().datetime().optional(),
  }),
});
