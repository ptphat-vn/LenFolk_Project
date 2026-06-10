const { z } = require('zod');

const mongoId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');
const booleanFromForm = z.preprocess((value) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}, z.boolean());
const stringArrayFromForm = z.preprocess((value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return value;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Fall back to comma-separated values below.
  }
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}, z.array(z.string()));

exports.createSubscriptionSchema = z.object({
  body: z
    .object({
      name: z.string(),
      // 'course' -> gán với khóa học | 'performance' -> gán với tiết mục
      itemType: z.enum(['course', 'performance']),
      courseId: mongoId.optional(),
      performanceId: mongoId.optional(),
      description: z.string().optional(),
      price: z.coerce.number(),
      currency: z.enum(['VND', 'USD']).optional(),
      billingCycle: z.enum(['monthly', 'quarterly', 'yearly']),
      features: stringArrayFromForm.optional(),
      maxCourses: z.coerce.number().optional(),
      isActive: booleanFromForm.optional(),
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
    price: z.coerce.number().optional(),
    currency: z.enum(['VND', 'USD']).optional(),
    billingCycle: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
    features: stringArrayFromForm.optional(),
    maxCourses: z.coerce.number().optional(),
    isActive: booleanFromForm.optional(),
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
