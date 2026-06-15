/** Input cho /auth/register */
export interface RegisterInput {
  name: string;       // Tên đầy đủ (ví dụ: "Nguyễn Văn A")
  email: string;
  password: string;   // Tối thiểu 8 ký tự
}

/** Input cho /auth/register-instructor — đăng ký giảng viên (chờ duyệt) */
export interface RegisterInstructorInput {
  name: string;
  email: string;
  password: string;   // Tối thiểu 8 ký tự
  bio?: string;
  expertise?: string;
  websiteUrl?: string;
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
}

/** Response của /auth/register-instructor — KHÔNG trả token */
export interface RegisterInstructorResponse {
  message: string;
  userId: string;
}

/** Input cho /auth/login */
export interface LoginForm {
  email: string;
  password: string;
}

/** Input cho /auth/refresh-token & /auth/logout */
export interface RefreshTokenInput {
  refreshToken: string;
}
