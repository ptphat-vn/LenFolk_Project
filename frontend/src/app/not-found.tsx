import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/user/layout/Navbar';
import { Footer } from '@/components/user/layout/Footer';

export default function NotFound() {
  return (
    <div className="font-sans text-black antialiased bg-gray-50 flex flex-col min-h-screen overflow-x-hidden">
      <Navbar />
      <main className="flex-1 w-full flex flex-col items-center justify-center py-32 px-6 text-center">
        <h1 className="text-8xl font-bold mb-6 text-[#8e9e6e]">404</h1>
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-black">
          Trang không tồn tại
        </h2>
        <p className="text-lg text-gray-600 mb-10 max-w-lg mx-auto">
          Có vẻ như đường dẫn bạn đang truy cập đã bị thay đổi, xóa bỏ hoặc tính năng này vẫn đang trong quá trình phát triển.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-black text-white font-medium text-lg hover:bg-gray-800 transition-all hover:scale-105 shadow-xl shadow-black/20"
        >
          Trở về trang chủ
        </Link>
      </main>
      <Footer />
    </div>
  );
}
