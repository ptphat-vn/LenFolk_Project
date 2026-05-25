const { z } = require('zod');

exports.createSubscriptionSchema = z.object({
  body: z.object({
    name: z.string(),
    description: z.string().optional(),
    price: z.number(),
    currency: z.enum(['VND', 'USD']).optional(),
    billingCycle: z.enum(['monthly', 'quarterly', 'yearly']),
    features: z.array(z.string()).optional(),
    maxCourses: z.number().optional(),
    isActive: z.boolean().optional(),
  })
});

exports.updateSubscriptionSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    price: z.number().optional(),
    currency: z.enum(['VND', 'USD']).optional(),
    billingCycle: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
    features: z.array(z.string()).optional(),
    maxCourses: z.number().optional(),
    isActive: z.boolean().optional(),
  })
});
