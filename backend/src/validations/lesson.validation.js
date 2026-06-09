const { z } = require('zod');

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

exports.createLessonSchema = z.object({
  body: z.object({
  courseId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  videoUrl: z.string().optional(),
  audioUrl: z.string().optional(),
  order: z.coerce.number(),
  duration: z.coerce.number().optional(),
  status: z.enum(['draft', 'published']).optional(),
  isFree: booleanFromForm.optional(),
  transcript: z.string().optional(),
  techniques: stringArrayFromForm.optional(),
  })
});

exports.updateLessonSchema = z.object({
  body: z.object({
  courseId: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  videoUrl: z.string().optional(),
  audioUrl: z.string().optional(),
  order: z.coerce.number().optional(),
  duration: z.coerce.number().optional(),
  status: z.enum(['draft', 'published']).optional(),
  isFree: booleanFromForm.optional(),
  transcript: z.string().optional(),
  techniques: stringArrayFromForm.optional(),
  })
});
