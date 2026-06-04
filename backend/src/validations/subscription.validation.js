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
        if (data.itemType === 'course') {
          return !!data.courseId && !data.performanceId;
        }
        if (data.itemType === 'performance') {
          return !!data.performanceId && !data.courseId;
        }
        return false;
      },
      {
        message:
          'If itemType is "course", courseId must be provided and performanceId must be empty. If itemType is "performance", performanceId must be provided and courseId must be empty.',
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
  })
  .refine(
    (data) => {
      if (data.itemType === 'course') return !data.performanceId;
      if (data.itemType === 'performance') return !data.courseId;
      return true; // if itemType not provided (partial update), we allow it
    },
    {
      message: 'Cannot provide both courseId and performanceId',
    }
  ),
});
