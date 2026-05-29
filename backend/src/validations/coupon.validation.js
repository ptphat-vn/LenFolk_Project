const { z } = require('zod');

exports.createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(3),
    discountType: z.enum(['percent', 'fixed']),
    discountValue: z.number().min(0),
    maxUses: z.number().min(1).nullable().optional(),
    validFrom: z.string().datetime().optional(),
    validTo: z.string().datetime().nullable().optional(),
    isActive: z.boolean().optional(),
    applicableTo: z.enum(['subscription', 'course', 'all']).optional(),
  }),
});

exports.updateCouponSchema = z.object({
  body: z.object({
    code: z.string().min(3).optional(),
    discountType: z.enum(['percent', 'fixed']).optional(),
    discountValue: z.number().min(0).optional(),
    maxUses: z.number().min(1).nullable().optional(),
    validFrom: z.string().datetime().optional(),
    validTo: z.string().datetime().nullable().optional(),
    isActive: z.boolean().optional(),
    applicableTo: z.enum(['subscription', 'course', 'all']).optional(),
  }),
});
