const { z } = require('zod');

exports.createPracticeSessionSchema = z.object({
  body: z.object({
    // userId and AI score fields are set server-side — not accepted from client
    userId: z.string().optional(),
    lessonId: z.string(),
    audioFileUrl: z.string().optional(),
    referenceAudio: z.string().optional(),
    duration: z.number().optional(),
  }),
});

exports.updatePracticeSessionSchema = z.object({
  body: z.object({
    // AI score fields and status are managed server-side only
    userId: z.string().optional(),
    lessonId: z.string().optional(),
    audioFileUrl: z.string().optional(),
    referenceAudio: z.string().optional(),
    duration: z.number().optional(),
  }),
});
