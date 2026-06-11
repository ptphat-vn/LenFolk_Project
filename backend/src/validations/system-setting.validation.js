const { z } = require('zod');

exports.updateSystemSettingSchema = z.object({
  body: z.object({
    paymentQrUrl: z.string().url().optional(),
    bankName: z.string().optional(),
    bankAccountNumber: z.string().optional(),
    bankAccountName: z.string().optional(),
    transferNote: z.string().optional(),
    defaultCommissionPercentage: z.coerce.number().min(0).max(100).optional(),
  }),
});
