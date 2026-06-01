/** Input cho /auth/register */
export interface RegisterInput {
  name: string;       // Tên đầy đủ (ví dụ: "Nguyễn Văn A")
  email: string;
  password: string;   // Tối thiểu 8 ký tự
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
