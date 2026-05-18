'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Kích hoạt animation ngay sau khi component mount
    const timer = window.setTimeout(() => setIsLoaded(true), 50);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-hidden">
      {/* Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 transition-all duration-1000 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative">
              <Image 
                src="/images/logo_notext.png" 
                alt="LenFolk Logo" 
                fill 
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              LenFolk<span className="text-[#15803d]"> Music</span>
            </span>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href="#" className="hover:text-[#15803d] transition-colors">Về chúng tôi</Link>
            <Link href="#" className="hover:text-[#15803d] transition-colors">Khóa học</Link>
            <Link href="#" className="hover:text-[#15803d] transition-colors">Bảng giá</Link>
            <Link href="#" className="hover:text-[#15803d] transition-colors">Hỗ trợ</Link>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              Đăng nhập
            </Link>
            <Link 
              href="/register" 
              className="px-5 py-2.5 text-sm font-semibold bg-[#15803d] hover:bg-[#166534] text-white rounded-full transition-all shadow-[0_4px_14px_0_rgba(21,128,61,0.39)] hover:shadow-[0_6px_20px_rgba(21,128,61,0.23)] hover:-translate-y-0.5"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center pt-20 px-6 relative bg-white">
        {/* Animated Abstract Background Effects */}
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-50 rounded-full blur-[100px] pointer-events-none transition-opacity duration-[2000ms] ease-in-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
        />
        <div 
          className={`absolute top-0 right-0 w-[500px] h-[500px] bg-amber-50 rounded-full blur-[80px] pointer-events-none transition-all duration-[2500ms] ease-out delay-300 ${
            isLoaded ? 'opacity-100 translate-y-0 translate-x-0' : 'opacity-0 -translate-y-20 translate-x-20'
          }`}
        />
        <div 
          className={`absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[100px] pointer-events-none transition-all duration-[2500ms] ease-out delay-500 ${
            isLoaded ? 'opacity-100 translate-y-0 -translate-x-0' : 'opacity-0 translate-y-20 -translate-x-20'
          }`}
        />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center mt-12">
          {/* Badge */}
          <div 
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold mb-8 shadow-sm transition-all duration-700 transform ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Nền tảng học nhạc trực tuyến hàng đầu
          </div>
          
          {/* Main Title */}
          <h1 
            className={`text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.15] text-gray-900 transition-all duration-700 transform ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '350ms' }}
          >
            Khơi dậy đam mê <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#15803d] to-emerald-400 inline-block transition-transform duration-1000 hover:scale-[1.02]">
              âm nhạc trong bạn
            </span>
          </h1>
          
          {/* Description */}
          <p 
            className={`text-lg md:text-xl text-gray-500 max-w-2xl mb-12 leading-relaxed transition-all duration-700 transform ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '500ms' }}
          >
            Khám phá phương pháp học tập độc quyền từ LenFolk. Kết nối với các chuyên gia, nâng cao kỹ năng và tự tin theo đuổi con đường âm nhạc chuyên nghiệp.
          </p>

          {/* CTA Buttons */}
          <div 
            className={`flex flex-col sm:flex-row items-center gap-4 transition-all duration-700 transform ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '650ms' }}
          >
            <Link 
              href="/register" 
              className="w-full sm:w-auto px-8 py-4 text-base font-bold bg-[#15803d] hover:bg-[#166534] text-white rounded-full transition-all shadow-[0_4px_14px_0_rgba(21,128,61,0.39)] hover:shadow-[0_6px_20px_rgba(21,128,61,0.23)] hover:-translate-y-1"
            >
              Bắt đầu hành trình
            </Link>
            <Link 
              href="#explore" 
              className="w-full sm:w-auto px-8 py-4 text-base font-bold bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-full transition-all shadow-sm hover:shadow-md hover:-translate-y-1"
            >
              Tìm hiểu thêm
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
