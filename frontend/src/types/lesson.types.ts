export type LessonStatus = 'draft' | 'published';

/** Schema Lesson trả về từ API */
export interface Lesson {
  _id: string;
  courseId: string;
  title: string;
  description?: string;
  videoUrl?: string;
  audioUrl?: string;
  pdfUrl?: string;
  imageUrls?: string[];
  order: number;
  duration?: number;      // giây
  status: LessonStatus;
  isFree: boolean;
  transcript?: string;
  techniques?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/** Body dùng để tạo / cập nhật bài học (POST /lessons, PATCH /lessons/:id) */
export interface CreateLessonInput {
  courseId: string;
  title: string;
  description?: string;
  videoUrl?: string;
  video?: File;
  audioUrl?: string;
  audio?: File;
  pdfUrl?: string;
  pdf?: File;
  imageUrls?: string[];
  images?: File[];
  order: number;          // tối thiểu 1
  duration?: number;      // tối thiểu 0
  status?: LessonStatus;
  isFree?: boolean;
  transcript?: string;
  techniques?: string[];
}

/** Query params cho GET /lessons */
export interface GetLessonsQuery {
  courseId?: string;
  page?: number;
  limit?: number;
}
