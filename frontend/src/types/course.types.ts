// Auto-generated from Swagger

export interface Course {
  _id?: string;
  instructorId?: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  level?: string;
  status?: string;
  tags?: string[];
  totalLessons?: number;
  enrollCount?: number;
  isFeatured?: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCourseInput {
  instructorId: string;
  title: string;
  description?: string;
  thumbnail?: string;
  level: string;
  status?: string;
  tags?: string[];
  isFeatured?: boolean;
}

