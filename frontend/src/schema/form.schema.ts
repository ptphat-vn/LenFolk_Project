import { z } from 'zod';

const optionalString = z
  .string()
  .trim()
  .transform((value) => (value === '' ? undefined : value))
  .optional();

const optionalUrl = optionalString.refine(
  (value) => !value || /^https?:\/\/.+/i.test(value),
  'URL phải bắt đầu bằng http:// hoặc https://',
);

const fileSchema = z.custom<File>(
  (value) => typeof File !== 'undefined' && value instanceof File,
  'Vui lòng chọn file hợp lệ',
);

const nonNegativeNumber = z.coerce
  .number({ error: 'Vui lòng nhập số hợp lệ' })
  .min(0, 'Giá trị không được âm');

const positiveNumber = z.coerce
  .number({ error: 'Vui lòng nhập số hợp lệ' })
  .positive('Giá trị phải lớn hơn 0');

const optionalNonNegativeNumber = z.preprocess(
  (value) =>
    value === '' || value === null || value === undefined ? undefined : value,
  nonNegativeNumber.optional(),
);

const mongoId = z
  .string()
  .trim()
  .min(1, 'Vui lòng chọn dữ liệu')
  .regex(/^[a-f\d]{24}$/i, 'ID không đúng định dạng MongoDB');

export const roleSchema = z.enum(['admin', 'instructor', 'user']);

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập họ tên')
    .max(100, 'Họ tên tối đa 100 ký tự'),
  email: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập email')
    .email('Email không đúng định dạng'),
  passwordHash: z
    .string()
    .min(6, 'Mật khẩu tối thiểu 6 ký tự')
    .max(100, 'Mật khẩu tối đa 100 ký tự'),
  role: roleSchema,
  phoneNumber: optionalString.refine(
    (value) => !value || /^[0-9+\-\s()]{8,20}$/.test(value),
    'Số điện thoại không hợp lệ',
  ),
});

export const updateUserSchema = createUserSchema
  .pick({ name: true, role: true, phoneNumber: true })
  .extend({ isActive: z.boolean() });

export const instructorProfileSchema = z.object({
  userId: mongoId,
  expertise: optionalString,
  bio: optionalString,
  websiteUrl: optionalUrl,
});

// Course KHÔNG có giá — giá đặt riêng qua coursePlanSchema (PUT /courses/:id/plan)
export const courseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập tên khoá học')
    .max(200, 'Tên khoá học tối đa 200 ký tự'),
  description: optionalString,
  thumbnail: optionalUrl,
  thumbnailFile: fileSchema.optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  status: z.enum(['pending', 'published', 'archived']).optional(),
  courseType: optionalString,
  isFree: z.boolean().optional(),
  adminCommissionPercentage: optionalNonNegativeNumber.refine(
    (value) => value === undefined || value <= 100,
    'Hoa hồng tối đa 100%',
  ),
  tags: z.array(z.string().trim().min(1)).optional(),
  isFeatured: z.boolean().optional(),
});

// Gói giá của course (PUT /courses/:id/plan)
export const coursePlanSchema = z.object({
  price: positiveNumber,
  billingCycle: z.enum(['monthly', 'quarterly', 'yearly']),
  name: optionalString,
  description: optionalString,
});

export const lessonSchema = z.object({
  courseId: mongoId,
  title: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập tên bài học')
    .max(200, 'Tên bài học tối đa 200 ký tự'),
  description: optionalString,
  videoUrl: optionalUrl,
  video: fileSchema.optional(),
  audioUrl: optionalUrl,
  audio: fileSchema.optional(),
  pdfUrl: optionalUrl,
  pdf: fileSchema.optional(),
  imageUrls: z.array(z.string()).optional(),
  images: z.array(fileSchema).optional(),
  order: z.coerce
    .number({ error: 'Thứ tự phải là số' })
    .int('Thứ tự phải là số nguyên')
    .min(1, 'Thứ tự tối thiểu là 1'),
  duration: optionalNonNegativeNumber,
  status: z.enum(['draft', 'published']).optional(),
  isFree: z.boolean().optional(),
  transcript: optionalString,
  techniques: z.array(z.string().trim().min(1)).optional(),
});

const basePerformanceSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập tên tiết mục')
    .max(200, 'Tên tiết mục tối đa 200 ký tự'),
  description: optionalString,
  thumbnail: optionalUrl,
  imageUrls: z.array(z.string()).optional(),
  images: z.array(fileSchema).optional(),
  videoUrl: optionalUrl,
  documents: z.array(fileSchema).optional(),
  isFree: z.boolean().optional(),
  genre: optionalString,
  duration: optionalNonNegativeNumber,
  status: z.enum(['pending', 'published', 'archived']).optional(),
  adminCommissionPercentage: optionalNonNegativeNumber.refine(
    (value) => value === undefined || value <= 100,
    'Hoa hồng tối đa 100%',
  ),
  tags: z.array(z.string().trim().min(1)).optional(),
  isFeatured: z.boolean().optional(),
  // Giá nằm thẳng trên tiết mục — mua đứt 1 lần (không có chu kỳ)
  price: optionalNonNegativeNumber,
});

export const performanceSchema = basePerformanceSchema.refine(
  (data) =>
    data.isFree !== false || (data.price !== undefined && data.price > 0),
  { path: ['price'], message: 'Vui lòng nhập giá cho tiết mục trả phí' },
);

export const instructorPerformanceSchema = performanceSchema.refine(
  (data) => Boolean(data.videoUrl),
  { path: ['videoUrl'], message: 'Vui lòng nhập Video URL' },
);

export const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập mã coupon')
      .max(30, 'Mã coupon tối đa 30 ký tự')
      .regex(/^[A-Z0-9_-]+$/i, 'Mã coupon chỉ gồm chữ, số, dấu _ hoặc -')
      .transform((value) => value.toUpperCase()),
    discountType: z.enum(['percent', 'fixed']),
    discountValue: positiveNumber,
    maxUses: z.preprocess(
      (value) => (value === '' || value === undefined ? null : value),
      z.coerce.number().int().min(1, 'Lượt dùng tối thiểu là 1').nullable(),
    ),
    validFrom: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
    validTo: z.preprocess(
      (value) => (value === '' ? null : value),
      z.string().nullable(),
    ),
    isActive: z.boolean().optional(),
    applicableTo: z.enum(['course', 'performance', 'all']).optional(),
  })
  .refine(
    (data) => data.discountType !== 'percent' || data.discountValue <= 100,
    {
      path: ['discountValue'],
      message: 'Giảm theo phần trăm tối đa 100%',
    },
  )
  .refine(
    (data) =>
      !data.validTo || new Date(data.validTo) >= new Date(data.validFrom),
    {
      path: ['validTo'],
      message: 'Ngày hết hạn phải sau ngày bắt đầu',
    },
  );

export const bankInfoSchema = z.object({
  bankName: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập tên ngân hàng')
    .max(100, 'Tên ngân hàng tối đa 100 ký tự'),
  accountName: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập tên chủ tài khoản')
    .max(100, 'Tên chủ tài khoản tối đa 100 ký tự'),
  accountNumber: z
    .string()
    .trim()
    .min(6, 'Số tài khoản tối thiểu 6 ký tự')
    .max(30, 'Số tài khoản tối đa 30 ký tự')
    .regex(/^\d+$/, 'Số tài khoản chỉ được chứa chữ số'),
});

export const payoutRequestSchema = (maxAmount: number) =>
  z.object({
    amount: z.coerce
      .number({ error: 'Vui lòng nhập số tiền' })
      .min(50000, 'Số tiền tối thiểu là 50,000đ')
      .max(maxAmount, 'Vượt quá số dư khả dụng'),
  });

export function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Dữ liệu không hợp lệ';
}

export function zodFieldErrors<T extends string>(
  error: z.ZodError,
): Partial<Record<T, string>> {
  const fieldErrors: Partial<Record<T, string>> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === 'string' && !fieldErrors[field as T]) {
      fieldErrors[field as T] = issue.message;
    }
  }

  return fieldErrors;
}
