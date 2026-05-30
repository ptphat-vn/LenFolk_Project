const { z } = require('zod');

exports.createCourseSchema = z.object({
  body: z.object({
    // instructorId is injected server-side from the token — not required from client
    instructorId: z.string().optional(),
    title: z.string(),
    description: z.string().optional(),
    thumbnail: z.string().optional(),
    isFree: z.boolean().optional(),
    // Giá được lấy từ gói Subscription liên kết — không nhập trực tiếp
    courseType: z.string().optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced']),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    tags: z.array(z.any()).optional(),
    totalLessons: z.number().optional(),
    enrollCount: z.number().optional(),
    isFeatured: z.boolean().optional(),
    publishedAt: z.string().datetime().optional(),
  }),
});

exports.updateCourseSchema = z.object({
  body: z.object({
    instructorId: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    thumbnail: z.string().optional(),
    isFree: z.boolean().optional(),
    courseType: z.string().optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    tags: z.array(z.any()).optional(),
    totalLessons: z.number().optional(),
    enrollCount: z.number().optional(),
    isFeatured: z.boolean().optional(),
    publishedAt: z.string().datetime().optional(),
  }),
});
