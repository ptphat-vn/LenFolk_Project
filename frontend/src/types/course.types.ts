export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseStatus = 'draft' | 'pending' | 'published' | 'archived';

/** Schema Course trả về từ API */
export interface Course {
  _id: string;
  instructorId?: string;
  title: string;
  description?: string;
  thumbnail?: string;
  level: CourseLevel;
  status: CourseStatus;
  courseType?: string;  // free-text: "foundation", "advanced", "masterclass"…
  isFree: boolean;
  price?: number;
  adminCommissionPercentage?: number;
  tags?: string[];
  totalLessons?: number;
  enrollCount?: number;
  isFeatured?: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Body dùng để tạo / cập nhật khóa học (POST /courses, PATCH /courses/:id)
 *  instructorId KHÔNG cần gửi — server inject từ JWT
 */
export interface CreateCourseInput {
  title: string;
  description?: string;
  thumbnail?: string;
  level: CourseLevel;
  status?: CourseStatus;
  tags?: string[];
  isFree?: boolean;
  price?: number;
  adminCommissionPercentage?: number;
  courseType?: string;
  isFeatured?: boolean;
}

/** Query params cho GET /courses */
export interface GetCoursesQuery {
  page?: number;
  limit?: number;
  sort?: string;
  level?: CourseLevel;
  status?: CourseStatus;
}
