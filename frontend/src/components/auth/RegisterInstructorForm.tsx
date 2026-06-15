'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm, type Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Check,
  UserRound,
  BadgeCheck,
  Landmark,
} from 'lucide-react';
import { isAxiosError } from 'axios';
import {
  registerInstructorSchema,
  type RegisterInstructorFormValues,
} from '@/schema/auth.schema';
import { authApi } from '@/lib/api/auth.api';
import type { RegisterInstructorInput } from '@/types/auth.types';

interface RegisterInstructorFormProps {
  /** Gọi khi đăng ký thành công (đơn đã gửi, chờ admin duyệt) */
  onSuccess?: () => void;
}

type FieldName = Path<RegisterInstructorFormValues>;

const STEPS: {
  title: string;
  subtitle: string;
  icon: typeof UserRound;
  fields: FieldName[];
}[] = [
  {
    title: 'Tài khoản',
    subtitle: 'Thông tin đăng nhập của bạn',
    icon: UserRound,
    fields: ['name', 'email', 'password'],
  },
  {
    title: 'Chuyên môn',
    subtitle: 'Giới thiệu về bạn (tùy chọn)',
    icon: BadgeCheck,
    fields: ['expertise', 'bio', 'websiteUrl'],
  },
  {
    title: 'Ngân hàng',
    subtitle: 'Thông tin nhận tiền (tùy chọn)',
    icon: Landmark,
    fields: ['bankName', 'accountName', 'accountNumber'],
  },
];

const inputCls =
  'w-full h-12 bg-[#D6DDC6]/20 border border-[rgba(16,18,12,0.2)] rounded-lg px-4 text-[15px] text-[#10120C] placeholder:text-gray-400 focus:outline-none focus:border-[#8E9E6E] focus:ring-1 focus:ring-[#8E9E6E] transition-all';

export function RegisterInstructorForm({ onSuccess }: RegisterInstructorFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(0);

  const {
    register,
    handleSubmit,
    trigger,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInstructorFormValues>({
    resolver: zodResolver(registerInstructorSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      bio: '',
      expertise: '',
      websiteUrl: '',
      bankName: '',
      accountName: '',
      accountNumber: '',
    },
  });

  const isLastStep = step === STEPS.length - 1;
  const current = STEPS[step];

  const goNext = async () => {
    const valid = await trigger(STEPS[step].fields, { shouldFocus: true });
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (data: RegisterInstructorFormValues) => {
    const payload: RegisterInstructorInput = {
      name: data.name,
      email: data.email,
      password: data.password,
      bio: data.bio || undefined,
      expertise: data.expertise || undefined,
      websiteUrl: data.websiteUrl || undefined,
    };

    if (data.bankName || data.accountName || data.accountNumber) {
      payload.bankDetails = {
        bankName: data.bankName || '',
        accountName: data.accountName || '',
        accountNumber: data.accountNumber || '',
      };
    }

    try {
      await authApi.registerInstructor(payload);
      onSuccess?.();
    } catch (error) {
      let message = 'Đăng ký thất bại. Vui lòng thử lại.';
      if (isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.message;
        if (typeof backendMessage === 'string') message = backendMessage;
      }
      setError('root', { message });
      // Lỗi từ server (vd email trùng) thuộc bước 1 → đưa người dùng về bước đầu
      setStep(0);
    }
  };

  return (
    <div className="w-full">
      {/* Stepper */}
      <div className="flex items-center mb-6">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i < step;
          const active = i === step;
          return (
            <div key={s.title} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                    done
                      ? 'bg-[#404e26] border-[#404e26] text-white'
                      : active
                        ? 'border-[#404e26] text-[#404e26] bg-[#D6DDC6]/30'
                        : 'border-gray-200 text-gray-300'
                  }`}
                >
                  {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span
                  className={`text-[11px] font-medium ${active ? 'text-[#10120C]' : 'text-gray-400'}`}
                >
                  {s.title}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-1 -mt-5 rounded ${
                    i < step ? 'bg-[#404e26]' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4 w-full">
        {errors.root && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errors.root.message}
          </div>
        )}

        <div>
          <p className="text-[15px] font-semibold text-[#10120C]">{current.title}</p>
          <p className="text-[13px] text-[#8E9E6E]">{current.subtitle}</p>
        </div>

        {/* Step 1 — Tài khoản */}
        {step === 0 && (
          <>
            <Field label="Họ tên *" error={errors.name?.message}>
              <input type="text" placeholder="Nguyễn Văn A" className={inputCls} {...register('name')} />
            </Field>

            <Field label="Email *" error={errors.email?.message}>
              <input
                type="email"
                placeholder="gv@lenfolk.vn"
                autoComplete="email"
                className={inputCls}
                {...register('email')}
              />
            </Field>

            <Field label="Mật khẩu *" error={errors.password?.message}>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tối thiểu 8 ký tự"
                  autoComplete="new-password"
                  className={`${inputCls} pr-12`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8E9E6E]"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </Field>
          </>
        )}

        {/* Step 2 — Chuyên môn */}
        {step === 1 && (
          <>
            <Field label="Chuyên môn" error={errors.expertise?.message}>
              <input
                type="text"
                placeholder="VD: Đàn tranh, Đàn bầu"
                className={inputCls}
                {...register('expertise')}
              />
            </Field>

            <Field label="Tiểu sử" error={errors.bio?.message}>
              <textarea
                placeholder="Giới thiệu ngắn về kinh nghiệm giảng dạy..."
                className={`${inputCls} h-28 py-3 resize-none`}
                {...register('bio')}
              />
            </Field>

            <Field label="Website" error={errors.websiteUrl?.message}>
              <input type="url" placeholder="https://..." className={inputCls} {...register('websiteUrl')} />
            </Field>
          </>
        )}

        {/* Step 3 — Ngân hàng */}
        {step === 2 && (
          <>
            <p className="text-[13px] text-[#8E9E6E] -mt-2">
              Có thể bỏ qua và cập nhật sau, nhưng bạn cần thông tin này để rút tiền.
            </p>
            <Field label="Ngân hàng" error={errors.bankName?.message}>
              <input
                type="text"
                placeholder="VD: Vietcombank"
                className={inputCls}
                {...register('bankName')}
              />
            </Field>
            <Field label="Chủ tài khoản" error={errors.accountName?.message}>
              <input
                type="text"
                placeholder="NGUYEN VAN A"
                className={inputCls}
                {...register('accountName')}
              />
            </Field>
            <Field label="Số tài khoản" error={errors.accountNumber?.message}>
              <input
                type="text"
                placeholder="0123456789"
                className={inputCls}
                {...register('accountNumber')}
              />
            </Field>
          </>
        )}

        {/* Navigation */}
        <div className="flex items-center gap-3 mt-2">
          {step > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="h-12 px-5 inline-flex items-center justify-center gap-2 rounded-lg border border-[#D6DDC6] text-[15px] font-medium text-[#10120C] hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </button>
          )}

          {!isLastStep ? (
            <button
              type="button"
              onClick={goNext}
              className="flex-1 h-12 cursor-pointer text-white text-[16px] font-semibold rounded-lg inline-flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #404e26 0%, #879748 100%)' }}
            >
              Tiếp tục
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-12 cursor-pointer text-white text-[16px] font-semibold rounded-lg transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #404e26 0%, #879748 100%)' }}
            >
              {isSubmitting ? 'Đang gửi đơn...' : 'Gửi đơn đăng ký'}
            </button>
          )}
        </div>

        <div className="text-center">
          <Link
            href="/login"
            className="text-[14px] text-[#8E9E6E] hover:text-[#10120C] underline underline-offset-4"
          >
            Đã có tài khoản? Đăng nhập
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-medium uppercase tracking-wider text-[#10120C]">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
