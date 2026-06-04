'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { loginSchema, type LoginFormValues } from '@/schema/auth.schema';
import { BrandPanel } from '@/components/auth/BrandPanel';
import { useAuthStore } from '@/stores/authStore';
import { isAxiosError } from 'axios';
import { authApi } from '@/lib/api/auth.api';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const setToken = useAuthStore((state) => state.setToken);

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
    try {
      const response = await authApi.login(data);
      const { accessToken, refreshToken, user } = response.data;
      if (accessToken) {
        setToken(accessToken, refreshToken, user);
        if (user?.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (user?.role === 'instructor') {
          router.push('/instructor/dashboard');
        } else if (user?.role === 'moderator') {
          router.push('/moderator/dashboard');
        } else {
          router.push('/');
        }
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

          {/* Google Auth Button */}
          <button
            type="button"
            className="lf-s3 w-full h-12 cursor-pointer flex items-center justify-center gap-3 bg-white border border-[#D6DDC6] rounded-lg hover:bg-gray-50 transition-colors mb-8 group"
          >
            <GoogleIcon />
            <span className="text-[16px] font-medium text-[#10120C] ">
              Continue with Google
            </span>
          </button>

          {/* Divider */}
          <div className="lf-s4 flex items-center mb-8">
            <div className="grow h-px bg-[#D6DDC6]" />
            <span className="px-4 text-[14px] text-[#8E9E6E] bg-white">
              hoặc
            </span>
            <div className="grow h-px bg-[#D6DDC6]" />
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-6 w-full"
          >
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

            {/* Register link */}
            {/* <div className="text-center mt-2">
              <Link
                href="/register"
                className="text-[14px] text-[#8E9E6E] hover:text-[#10120C] underline underline-offset-4 transition-colors"
              >
                Chưa có tài khoản? Đăng ký ngay
              </Link>
            </div> */}
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

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
