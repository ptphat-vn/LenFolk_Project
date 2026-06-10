const { z } = require('zod');

exports.createCourseSchema = z.object({
  body: z.object({
    // instructorId is injected server-side from the token — not required from client
    instructorId: z.string().optional(),
    title: z.string(),
    description: z.string().optional(),
    thumbnail: z.string().optional(),
    isFree: z.boolean().optional(),
    courseType: z.string().optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced']),
    status: z.enum(['pending', 'published', 'archived']).optional(),
    adminCommissionPercentage: z.number().min(0).max(100).optional(),
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
    status: z.enum(['pending', 'published', 'archived']).optional(),
    adminCommissionPercentage: z.number().min(0).max(100).optional(),
    tags: z.array(z.any()).optional(),
    totalLessons: z.number().optional(),
    enrollCount: z.number().optional(),
    isFeatured: z.boolean().optional(),
    publishedAt: z.string().datetime().optional(),
  }),
});

// Gói đăng ký (giá) của course — PUT /api/courses/:id/plan
exports.upsertCoursePlanSchema = z.object({
  body: z.object({
    price: z.number().min(0),
    billingCycle: z.enum(['monthly', 'quarterly', 'yearly']),
    name: z.string().optional(),
    description: z.string().optional(),
    features: z.array(z.string()).optional(),
  }),
});
