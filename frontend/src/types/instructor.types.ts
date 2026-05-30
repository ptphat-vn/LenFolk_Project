/** Schema InstructorProfile trả về từ API */
export interface InstructorProfile {
  _id: string;
  userId: string;
  bio?: string;
  expertise?: string;
  websiteUrl?: string;
  totalStudents?: number;
  totalCourses?: number;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
}

/** Body dùng để tạo / cập nhật hồ sơ giảng viên */
export interface CreateInstructorProfileInput {
  userId: string;
  bio?: string;
  expertise?: string;
  websiteUrl?: string;
}

/** Query params cho GET /instructor-profiles */
export interface GetInstructorProfilesQuery {
  userId?: string;
}
