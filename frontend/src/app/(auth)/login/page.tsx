'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Clock, XCircle } from 'lucide-react';
import { loginSchema, type LoginFormValues } from '@/schema/auth.schema';
import { BrandPanel } from '@/components/auth/BrandPanel';
import { useAuthStore } from '@/stores/authStore';
import { isAxiosError } from 'axios';
import { authApi } from '@/lib/api/auth.api';

const dashboardFor = (role?: string) =>
  role === 'admin'
    ? '/admin/dashboard'
    : role === 'instructor'
      ? '/instructor/dashboard'
      : '/';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [instructorNotice, setInstructorNotice] = useState<{
    type: 'pending' | 'rejected';
    message: string;
  } | null>(null);
  const setToken = useAuthStore((state) => state.setToken);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  // Đã đăng nhập rồi mà mở lại /login → đưa thẳng về khu vực phù hợp
  useEffect(() => {
    if (hasHydrated && token && user) {
      router.replace(dashboardFor(user.role));
    }
  }, [hasHydrated, token, user, router]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setInstructorNotice(null);
    try {
      const response = await authApi.login(data);
      const { accessToken, refreshToken, user } = response.data;
      if (accessToken) {
        setToken(accessToken, refreshToken, user);
        router.replace(dashboardFor(user?.role));
      }
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.message;
        let errorMessage =
          'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';

        if (typeof backendMessage === 'string') {
          errorMessage = backendMessage;
        } else if (backendMessage && typeof backendMessage === 'object') {
          if (Array.isArray(backendMessage.message)) {
            errorMessage = backendMessage.message[0];
          } else if (typeof backendMessage.message === 'string') {
            errorMessage = backendMessage.message;
          }
        }

        // 403 = đơn giảng viên chưa được duyệt (pending) hoặc đã bị từ chối (rejected)
        if (error.response.status === 403) {
          const lower = errorMessage.toLowerCase();
          const type =
            lower.includes('từ chối') || lower.includes('reject') ? 'rejected' : 'pending';
          setInstructorNotice({ type, message: errorMessage });
          return;
        }

        setError('root', { message: errorMessage });
      } else {
        setError('root', {
          message: 'Đã có lỗi kết nối tới máy chủ. Vui lòng thử lại sau.',
        });
      }
    }
  };

  return (
    <main className="flex w-full h-screen overflow-hidden">
      <style>{`
        @keyframes loginFadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes loginFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .lf-s1 { animation: loginFadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
        .lf-s2 { animation: loginFadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.15s both; }
        .lf-s3 { animation: loginFadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.25s both; }
        .lf-s4 { animation: loginFadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.33s both; }
        .lf-s5 { animation: loginFadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.41s both; }
        .lf-s6 { animation: loginFadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.49s both; }
        .lf-s7 { animation: loginFadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.57s both; }
        .lf-footer { animation: loginFadeIn 0.6s ease-out 0.75s both; }
      `}</style>
      <BrandPanel />

      <section className="w-full lg:w-[40%] bg-white flex flex-col justify-center items-center relative p-8 sm:p-12 md:p-16">
        <div className="w-full max-w-sm flex flex-col">
          {/* Mobile logo */}
          <div className="lf-s1 lg:hidden flex items-center justify-center gap-2 mb-8">
            <span className="font-bold text-[#10120C] text-lg">LenFolk</span>
          </div>

          {/* Header */}
          <div className="lf-s2 mb-10 text-center lg:text-left">
            <h1 className="text-[32px] leading-10font-semibold text-[#10120C] mb-2">
              Chào mừng quay lại
            </h1>
            <p className="text-[16px] leading-6 text-[#8E9E6E]">
              Đăng nhập vào hệ thống LenFolk
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-6 w-full"
          >
            {/* Instructor approval notice (403) */}
            {instructorNotice && (
              <div
                className={`rounded-lg border px-4 py-3 text-sm flex items-start gap-2.5 ${
                  instructorNotice.type === 'pending'
                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                    : 'border-red-200 bg-red-50 text-red-600'
                }`}
              >
                {instructorNotice.type === 'pending' ? (
                  <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="font-semibold">
                    {instructorNotice.type === 'pending'
                      ? 'Đơn giảng viên đang chờ duyệt'
                      : 'Đơn giảng viên đã bị từ chối'}
                  </p>
                  <p className="mt-0.5">{instructorNotice.message}</p>
                </div>
              </div>
            )}

            {/* Server error */}
            {errors.root && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {errors.root.message}
              </div>
            )}

            {/* Email Field */}
            <div className="lf-s5 flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-[13px] font-medium uppercase tracking-wider text-[#10120C]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin@lenfolk.com"
                autoComplete="email"
                className="w-full h-12 bg-[#D6DDC6]/20 border border-[rgba(16,18,12,0.2)] rounded-lg px-4 text-[16px] text-[#10120C] placeholder:text-gray-400 focus:outline-none focus:border-[#8E9E6E] focus:ring-1 focus:ring-[#8E9E6E] transition-all"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="lf-s6 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="password"
                  className="text-[13px] font-medium uppercase tracking-wider text-[#10120C]"
                >
                  Mật khẩu
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[14px] text-[#8E9E6E] hover:text-[#10120C] transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full h-12 bg-[#D6DDC6]/20 border border-[rgba(16,18,12,0.2)] rounded-lg px-4 pr-12 text-[16px] text-[#10120C] placeholder:text-gray-400 focus:outline-none focus:border-[#8E9E6E] focus:ring-1 focus:ring-[#8E9E6E] transition-all"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8E9E6E] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="lf-s7 w-full h-12 cursor-pointer text-white text-[16px] font-semibold rounded-lg mt-2 transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-[#8E9E6E] hover:opacity-90 disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #404e26 0%, #879748 100%)',
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xác thực...
                </span>
              ) : (
                'Đăng nhập'
              )}
            </button>

            {/* Register instructor link */}
            <div className="text-center mt-2">
              <Link
                href="/register-instructor"
                className="text-[14px] text-[#8E9E6E] hover:text-[#10120C] underline underline-offset-4 transition-colors"
              >
                Bạn là giảng viên? Đăng ký tại đây
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <footer className="lf-footer absolute bottom-8 w-full text-center">
          <p className="text-[14px] text-[#D6DDC6]">
            © 2026 LenFolk. All rights reserved.
          </p>
        </footer>
      </section>
    </main>
  );
}
