import { z } from 'zod';

// ─── Login Schema ────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Vui lòng nhập email')
    .email('Email không đúng định dạng'),

  password: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu')
    .min(8, 'Mật khẩu tối thiểu 8 ký tự'),

  remember: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Register Schema ─────────────────────────────────────────────────────────

export const registerSchema = z
  .object({
    lastName: z
      .string()
      .min(1, 'Vui lòng nhập họ')
      .max(50, 'Họ không được quá 50 ký tự')
      .regex(/^[\p{L}\s]+$/u, 'Họ chỉ được chứa chữ cái'),

    firstName: z
      .string()
      .min(1, 'Vui lòng nhập tên')
      .max(50, 'Tên không được quá 50 ký tự')
      .regex(/^[\p{L}\s]+$/u, 'Tên chỉ được chứa chữ cái'),

    email: z
      .string()
      .min(1, 'Vui lòng nhập email')
      .email('Email không đúng định dạng')
      .refine((val) => !val.includes('+'), "Email không được chứa ký tự '+'"),

    role: z
      .string()
      .min(1, 'Vui lòng nhập vai trò')
      .max(100, 'Vai trò không được quá 100 ký tự'),

    password: z
      .string()
      .min(1, 'Vui lòng nhập mật khẩu')
      .min(8, 'Mật khẩu tối thiểu 8 ký tự')
      .max(100, 'Mật khẩu không được quá 100 ký tự')
      .regex(/[A-Z]/, 'Phải có ít nhất 1 chữ hoa')
      .regex(/[0-9]/, 'Phải có ít nhất 1 chữ số')
      .regex(/[^A-Za-z0-9]/, 'Phải có ít nhất 1 ký tự đặc biệt'),

    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),

    agreeTerms: z
      .boolean()
      .refine((val) => val === true, 'Bạn phải đồng ý với điều khoản sử dụng'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

// ─── Password strength helper ─────────────────────────────────────────────────

export function getPasswordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export const strengthMeta = [
  { label: '', color: '' },
  { label: 'Yếu', color: 'bg-red-400' },
  { label: 'Trung bình', color: 'bg-amber-400' },
  { label: 'Khá', color: 'bg-yellow-400' },
  { label: 'Mạnh', color: 'bg-bamboo' },
] as const;
