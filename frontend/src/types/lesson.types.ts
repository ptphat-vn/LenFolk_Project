// Auto-generated from Swagger

export interface Lesson {
  _id?: string;
  courseId?: string;
  title?: string;
  description?: string;
  videoUrl?: string;
  audioUrl?: string;
  order?: number;
  duration?: number;
  status?: string;
  isFree?: boolean;
  transcript?: string;
  techniques?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLessonInput {
  courseId: string;
  title: string;
  description?: string;
  videoUrl?: string;
  audioUrl?: string;
  order: number;
  duration?: number;
  status?: string;
  isFree?: boolean;
  transcript?: string;
  techniques?: string[];
}

