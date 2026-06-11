import { CoursePlan } from './course.types';

export type EnrollmentItemType = 'course' | 'performance';
export type EnrollmentStatus = 'pending' | 'active' | 'expired' | 'cancelled';

/** Thông tin item rút gọn được populate vào enrollment */
export interface EnrollmentItem {
  _id: string;
  title?: string;
  thumbnail?: string;
  status?: string;
  price?: number;
}

/** Enrollment — quyền truy cập đã mua của user */
export interface Enrollment {
  _id: string;
  userId?: string | { _id: string; name?: string; email?: string };
  itemType: EnrollmentItemType;
  courseId?: string | { _id: string; title?: string } | null;
  performanceId?: string | { _id: string; title?: string } | null;
  coursePlanId?: string | null;
  status: EnrollmentStatus;
  isPaid?: boolean;
  startDate?: string;
  endDate?: string | null; // null = mua đứt vĩnh viễn
  platform?: string;
  createdAt?: string;
  /** Có trong GET /enrollments/me — item + plan đã rút gọn */
  item?: EnrollmentItem | null;
  plan?: CoursePlan | null;
}

/** Query cho GET /enrollments (admin) */
export interface GetEnrollmentsQuery {
  userId?: string;
  itemType?: EnrollmentItemType;
  status?: EnrollmentStatus;
}
