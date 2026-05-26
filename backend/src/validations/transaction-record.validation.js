const { z } = require('zod');

exports.createTransactionRecordSchema = z.object({
  body: z.object({
  userId: z.string(),
  userSubscriptionId: z.string(),
  amount: z.number(),
  currency: z.enum(['VND', 'USD']).optional(),
  paymentMethod: z.string(),
  gatewayTxId: z.string().optional(),
  status: z.enum(['pending', 'success', 'failed', 'refunded']).optional(),
  gatewayProvider: z.string().optional(),
  gatewayResponse: z.any().optional(),
  paidAt: z.string().datetime().optional(),
  })
});

exports.updateTransactionRecordSchema = z.object({
  body: z.object({
  userId: z.string().optional(),
  userSubscriptionId: z.string().optional(),
  amount: z.number().optional(),
  currency: z.enum(['VND', 'USD']).optional(),
  paymentMethod: z.string().optional(),
  gatewayTxId: z.string().optional(),
  status: z.enum(['pending', 'success', 'failed', 'refunded']).optional(),
  gatewayProvider: z.string().optional(),
  gatewayResponse: z.any().optional(),
  paidAt: z.string().datetime().optional(),
  })
});
