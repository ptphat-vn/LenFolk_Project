const { z } = require('zod');

exports.createPracticeSessionSchema = z.object({
  body: z.object({
  userId: z.string(),
  lessonId: z.string(),
  audioFileUrl: z.string().optional(),
  aiScore: z.number().optional(),
  rhythmScore: z.number().optional(),
  pitchScore: z.number().optional(),
  accuracyScore: z.number().optional(),
  aiFeedback: z.string().optional(),
  referenceAudio: z.string().optional(),
  duration: z.number().optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
  })
});

exports.updatePracticeSessionSchema = z.object({
  body: z.object({
  userId: z.string().optional(),
  lessonId: z.string().optional(),
  audioFileUrl: z.string().optional(),
  aiScore: z.number().optional(),
  rhythmScore: z.number().optional(),
  pitchScore: z.number().optional(),
  accuracyScore: z.number().optional(),
  aiFeedback: z.string().optional(),
  referenceAudio: z.string().optional(),
  duration: z.number().optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
  })
});
