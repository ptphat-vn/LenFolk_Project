const { z } = require('zod');

const mongoId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

exports.createSubscriptionSchema = z.object({
  body: z
    .object({
      name: z.string(),
      // 'course' -> gán với khóa học | 'performance' -> gán với tiết mục
      itemType: z.enum(['course', 'performance']),
      courseId: mongoId.optional(),
      performanceId: mongoId.optional(),
      description: z.string().optional(),
      price: z.number(),
      currency: z.enum(['VND', 'USD']).optional(),
      billingCycle: z.enum(['monthly', 'quarterly', 'yearly']),
      features: z.array(z.string()).optional(),
      maxCourses: z.number().optional(),
      isActive: z.boolean().optional(),
      qrCodeUrl: z.string().url().optional(),
    })
    .refine(
      (data) => {
        if (data.itemType === 'course') return !!data.courseId;
        if (data.itemType === 'performance') return !!data.performanceId;
        return false;
      },
      {
        message:
          'courseId is required when itemType is "course"; performanceId is required when itemType is "performance"',
      },
    ),
});

exports.updateSubscriptionSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    itemType: z.enum(['course', 'performance']).optional(),
    courseId: mongoId.optional(),
    performanceId: mongoId.optional(),
    description: z.string().optional(),
    price: z.number().optional(),
    currency: z.enum(['VND', 'USD']).optional(),
    billingCycle: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
    features: z.array(z.string()).optional(),
    maxCourses: z.number().optional(),
    isActive: z.boolean().optional(),
    qrCodeUrl: z.string().url().nullable().optional(),
  }),
});
