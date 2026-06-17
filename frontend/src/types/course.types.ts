export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseStatus = 'pending' | 'published' | 'archived';
export type BillingCycle = 'monthly' | 'quarterly' | 'yearly';
export type Currency = 'VND' | 'USD';

/** CoursePlan — gói giá của course (bán theo chu kỳ). Course có tối đa 1 plan. */
export interface CoursePlan {
  _id: string;
  courseId?: string;
  name?: string | null;
  description?: string | null;
  price: number;
  currency?: Currency;
  billingCycle: BillingCycle;
  features?: string[];
  isActive?: boolean;
}

/** Ref giảng viên: string id khi gửi lên, object được populate khi GET. */
export type InstructorRef =
  | string
  | { _id: string; name?: string; email?: string; avatar?: string };

/** Lấy tên giảng viên từ ref (đã populate hoặc id thuần) */
export function instructorRefName(ref: InstructorRef | null | undefined): string | undefined {
  if (!ref) return undefined;
  if (typeof ref === 'string') return undefined;
  return ref.name || ref.email;
}

/** Schema Course trả về từ API. Giá KHÔNG nằm trên course — đọc từ `plan`. */
export interface Course {
  _id: string;
  instructorId?: InstructorRef;
  title: string;
  description?: string;
  thumbnail?: string;
  level: CourseLevel;
  status: CourseStatus;
  courseType?: string; // free-text: "foundation", "advanced", "masterclass"…
  isFree: boolean;
  adminCommissionPercentage?: number;
  tags?: string[];
  totalLessons?: number;
  enrollCount?: number;
  isFeatured?: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  /** Gói giá liên kết — embed trong GET /courses và GET /courses/:id */
  plan?: CoursePlan | null;
}

/** Body tạo / cập nhật khóa học (POST /courses, PATCH /courses/:id) — KHÔNG có giá.
 *  instructorId KHÔNG cần gửi — server inject từ JWT. Đặt giá qua PUT /courses/:id/plan.
 */
export interface CreateCourseInput {
  title: string;
  description?: string;
  thumbnail?: string;
  thumbnailFile?: File;
  level: CourseLevel;
  status?: CourseStatus;
  tags?: string[];
  isFree?: boolean;
  adminCommissionPercentage?: number;
  courseType?: string;
  isFeatured?: boolean;
}

/** Body đặt/cập nhật gói giá cho course (PUT /courses/:id/plan) */
export interface UpsertCoursePlanInput {
  price: number;
  billingCycle: BillingCycle;
  name?: string;
  description?: string;
  features?: string[];
}

/** Query params cho GET /courses */
export interface GetCoursesQuery {
  page?: number;
  limit?: number;
  sort?: string;
  level?: CourseLevel;
  status?: CourseStatus;
}
