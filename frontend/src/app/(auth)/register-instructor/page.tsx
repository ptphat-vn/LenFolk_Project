'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, GraduationCap } from 'lucide-react';
import { BrandPanel } from '@/components/auth/BrandPanel';
import { RegisterInstructorForm } from '@/components/auth/RegisterInstructorForm';

export default function RegisterInstructorPage() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <main className="flex w-full h-screen overflow-hidden">
        <BrandPanel />
        <section className="w-full lg:w-[40%] bg-white flex flex-col justify-center items-center p-8 sm:p-12 md:p-16">
          <div className="w-full max-w-sm flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-semibold text-[#10120C]">Đăng ký thành công!</h1>
            <p className="text-[15px] leading-6 text-[#8E9E6E]">
              Đơn đăng ký giảng viên của bạn đang chờ admin duyệt. Bạn sẽ nhận được email
              thông báo khi đơn được duyệt và có thể đăng nhập sau đó.
            </p>
            <Link
              href="/login"
              className="mt-2 inline-flex h-11 items-center justify-center rounded-lg px-6 text-white text-[15px] font-semibold"
              style={{ background: 'linear-gradient(135deg, #404e26 0%, #879748 100%)' }}
            >
              Về trang đăng nhập
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex w-full h-screen overflow-hidden">
      <BrandPanel />

      <section className="w-full lg:w-[40%] bg-white flex flex-col justify-center items-center p-8 sm:p-12 md:px-16">
        <div className="w-full max-w-sm flex flex-col">
          <div className="mb-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 mb-2">
              <GraduationCap className="w-6 h-6 text-[#404e26]" />
              <span className="font-bold text-[#10120C] text-lg">Trở thành giảng viên</span>
            </div>
            <h1 className="text-[24px] leading-8 font-semibold text-[#10120C] mb-1">
              Đăng ký giảng viên
            </h1>
            <p className="text-[14px] leading-5 text-[#8E9E6E]">
              Điền thông tin để gửi đơn. Admin sẽ duyệt trước khi bạn có thể đăng nhập.
            </p>
          </div>

          <RegisterInstructorForm onSuccess={() => setSubmitted(true)} />
        </div>
      </section>
    </main>
  );
}
