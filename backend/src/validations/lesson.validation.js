const { z } = require('zod');

exports.createLessonSchema = z.object({
  body: z.object({
  courseId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  videoUrl: z.string().optional(),
  audioUrl: z.string().optional(),
  order: z.number(),
  duration: z.number().optional(),
  status: z.enum(['draft', 'published']).optional(),
  isFree: z.boolean().optional(),
  transcript: z.string().optional(),
  techniques: z.array(z.any()).optional(),
  })
});

exports.updateLessonSchema = z.object({
  body: z.object({
  courseId: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  videoUrl: z.string().optional(),
  audioUrl: z.string().optional(),
  order: z.number().optional(),
  duration: z.number().optional(),
  status: z.enum(['draft', 'published']).optional(),
  isFree: z.boolean().optional(),
  transcript: z.string().optional(),
  techniques: z.array(z.any()).optional(),
  })
});
