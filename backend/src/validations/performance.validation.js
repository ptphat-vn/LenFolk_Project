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

exports.createPerformanceSchema = z.object({
  body: z.object({
    // instructorId được inject từ token phía server — client không cần gửi
    instructorId: mongoId.optional(),
    title: z.string(),
    description: z.string().optional(),
    thumbnail: z.string().optional(),
    videoUrl: z.string().optional(),
    isFree: booleanFromForm.optional(),
    genre: z.string().optional(),
    duration: z.coerce.number().min(0).optional(),
    // draft đã bị loại bỏ — instructor tạo mới luôn là pending
    status: z.enum(['pending', 'published', 'archived']).optional(),
    adminCommissionPercentage: z.coerce.number().min(0).max(100).optional(),
    tags: stringArrayFromForm.optional(),
    isFeatured: booleanFromForm.optional(),
    publishedAt: z.string().datetime().optional(),
    // Giá và chu kỳ — instructor nhập để BE tự tạo Subscription
    price: z.coerce.number().min(0).optional(),
    billingCycle: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
  }),
});

exports.updatePerformanceSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    thumbnail: z.string().optional(),
    videoUrl: z.string().optional(),
    isFree: booleanFromForm.optional(),
    genre: z.string().optional(),
    duration: z.coerce.number().min(0).optional(),
    // draft đã bị loại bỏ
    status: z.enum(['pending', 'published', 'archived']).optional(),
    adminCommissionPercentage: z.coerce.number().min(0).max(100).optional(),
    tags: stringArrayFromForm.optional(),
    isFeatured: booleanFromForm.optional(),
    publishedAt: z.string().datetime().optional(),
    price: z.coerce.number().min(0).optional(),
    billingCycle: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
  }),
});

exports.approvePerformanceSchema = z.object({
  body: z.object({
    adminCommissionPercentage: z.coerce.number().min(0).max(100).optional(),
  }),
});

exports.rejectPerformanceSchema = z.object({
  body: z.object({
    rejectReason: z.string().optional(),
  }),
});
