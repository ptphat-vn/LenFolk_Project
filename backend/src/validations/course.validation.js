const { z } = require('zod');

// Khi gửi kèm file (multipart/form-data), boolean/array/number bị chuyển thành chuỗi.
// Các preprocessor dưới đây nhận CẢ giá trị JSON thật lẫn chuỗi từ form.
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
    // rơi xuống tách theo dấu phẩy
  }
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}, z.array(z.string()));

exports.createCourseSchema = z.object({
  body: z.object({
    // instructorId is injected server-side from the token — not required from client
    instructorId: z.string().optional(),
    title: z.string(),
    description: z.string().optional(),
    thumbnail: z.string().optional(),
    isFree: booleanFromForm.optional(),
    courseType: z.string().optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced']),
    status: z.enum(['pending', 'published', 'archived']).optional(),
    adminCommissionPercentage: z.coerce.number().min(0).max(100).optional(),
    tags: stringArrayFromForm.optional(),
    totalLessons: z.coerce.number().optional(),
    enrollCount: z.coerce.number().optional(),
    isFeatured: booleanFromForm.optional(),
    publishedAt: z.string().datetime().optional(),
  }),
});

exports.updateCourseSchema = z.object({
  body: z.object({
    instructorId: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    thumbnail: z.string().optional(),
    isFree: booleanFromForm.optional(),
    courseType: z.string().optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    status: z.enum(['pending', 'published', 'archived']).optional(),
    adminCommissionPercentage: z.coerce.number().min(0).max(100).optional(),
    tags: stringArrayFromForm.optional(),
    totalLessons: z.coerce.number().optional(),
    enrollCount: z.coerce.number().optional(),
    isFeatured: booleanFromForm.optional(),
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
