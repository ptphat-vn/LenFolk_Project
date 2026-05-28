// Auto-generated from Swagger

export interface InstructorProfile {
  _id?: string;
  userId?: string;
  bio?: string;
  expertise?: string;
  websiteUrl?: string;
  totalStudents?: number;
  totalCourses?: number;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInstructorProfileInput {
  userId: string;
  bio?: string;
  expertise?: string;
  websiteUrl?: string;
}

