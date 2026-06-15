/** Trạng thái duyệt hồ sơ giảng viên */
export type InstructorStatus = 'pending' | 'approved' | 'rejected';

/** Thông tin ngân hàng nhận tiền của giảng viên */
export interface InstructorBankDetails {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
}

/** userId có thể được populate {name,email,avatar} từ API (vd màn duyệt giảng viên) */
export interface PopulatedUser {
  _id: string;
  name?: string;
  email?: string;
  avatar?: string;
}

/** Schema InstructorProfile trả về từ API */
export interface InstructorProfile {
  _id: string;
  userId: string | PopulatedUser;
  status?: InstructorStatus;
  rejectReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  bio?: string;
  expertise?: string;
  websiteUrl?: string;
  totalStudents?: number;
  totalCourses?: number;
  rating?: number;
  bankDetails?: InstructorBankDetails;
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
  status?: InstructorStatus;
}

/** Lấy chuỗi id từ userId (dù được populate hay chỉ là string) */
export function getInstructorUserId(userId: InstructorProfile['userId']): string {
  return typeof userId === 'string' ? userId : userId?._id ?? '';
}

/** Lấy tên hiển thị giảng viên nếu userId đã được populate */
export function getInstructorUserName(userId: InstructorProfile['userId']): string | undefined {
  return typeof userId === 'string' ? undefined : userId?.name;
}

/** Lấy email giảng viên nếu userId đã được populate */
export function getInstructorUserEmail(userId: InstructorProfile['userId']): string | undefined {
  return typeof userId === 'string' ? undefined : userId?.email;
}
