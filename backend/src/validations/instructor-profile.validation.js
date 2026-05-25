const { z } = require('zod');

exports.createInstructorProfileSchema = z.object({
  body: z.object({
  userId: z.string(),
  bio: z.string().optional(),
  expertise: z.string().optional(),
  websiteUrl: z.string().optional(),
  totalStudents: z.number().optional(),
  totalCourses: z.number().optional(),
  rating: z.number().optional(),
  })
});

exports.updateInstructorProfileSchema = z.object({
  body: z.object({
  userId: z.string().optional(),
  bio: z.string().optional(),
  expertise: z.string().optional(),
  websiteUrl: z.string().optional(),
  totalStudents: z.number().optional(),
  totalCourses: z.number().optional(),
  rating: z.number().optional(),
  })
});
