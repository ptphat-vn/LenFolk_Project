

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
