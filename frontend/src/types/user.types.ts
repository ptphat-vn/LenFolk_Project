export type Role = 'admin' | 'instructor' | 'user';

export type Gender = 'male' | 'female' | 'other';

/** Schema User trả về từ API */
export interface User {
  _id: string;
  name: string;
  email: string;
  gender?: Gender;
  dateOfBirth?: string;    // ISO date-time string
  avatar?: string | null;
  phoneNumber?: string | null;
  role: Role;
  /** Cờ xác nhận đã mua thành công ≥1 course/tiết mục (set khi admin approve giao dịch) */
  isSubscribed?: boolean;
  isActive?: boolean;
  isVerified?: boolean;
  lastLoginAt?: string | null;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Body dùng để Admin tạo user mới (POST /users) */
export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;  // plain text — server sẽ hash
  gender?: Gender;
  dateOfBirth?: string;  // ISO date-time
  role?: Role;
  phoneNumber?: string;
}

/** Body dùng để Admin cập nhật user (PATCH /users/:id) — multipart/form-data */
export interface UpdateUserInput {
  name?: string;
  gender?: Gender;
  dateOfBirth?: string;
  role?: Role;
  phoneNumber?: string;
  isActive?: boolean;
  isSubscribed?: boolean;
  avatar?: File;  // file upload (binary)
}

/** Query params cho GET /users */
export interface GetUsersQuery {
  page?: number;
  limit?: number;
  sort?: string;  // ví dụ: "-createdAt"
  role?: Role;
}
