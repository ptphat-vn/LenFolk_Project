'use client';
import React from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-[#d6ddc6]/40 to-white text-black pt-24 pb-8 border-t border-gray-100">
      
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8 mb-16">
          
          {/* Column 1: Logo & Newsletter (Takes 2 cols) */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <span className="font-serif font-bold text-3xl tracking-tight">LENFOLK</span>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              Nhận thông tin cập nhật và mẹo hữu ích
            </p>
            <div className="relative max-w-xs group">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full pl-6 pr-14 py-3.5 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 rounded-full outline-none focus:border-[#8e9e6e] focus:shadow-[0_8px_30px_rgb(0,0,0,0.08)] text-sm transition-all"
              />
              <button className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square bg-gradient-to-br from-[#d6ddc6] to-[#8e9e6e] text-white rounded-full flex items-center justify-center hover:opacity-90 transition-opacity">
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
          
          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-medium text-black mb-6">Liên kết nhanh</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              {['Trang chủ', 'Giới thiệu', 'Khóa học', 'Tin tức'].map(link => (
                <li key={link}><Link href="#" className="hover:text-[#8e9e6e] transition-colors">{link}</Link></li>
              ))}
            </ul>
          </div>
          
          {/* Column 3: Company */}
          <div>
            <h4 className="font-medium text-black mb-6">Công ty</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              {['Về chúng tôi', 'Tuyển dụng', 'Chính sách bảo mật', 'Điều khoản'].map(link => (
                <li key={link}><Link href="#" className="hover:text-[#8e9e6e] transition-colors">{link}</Link></li>
              ))}
            </ul>
          </div>
          
          {/* Column 4: Resources */}
          <div>
            <h4 className="font-medium text-black mb-6">Tài nguyên</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              {['Hướng dẫn học', 'Blog', 'Hỗ trợ'].map(link => (
                <li key={link}><Link href="#" className="hover:text-[#8e9e6e] transition-colors">{link}</Link></li>
              ))}
            </ul>
          </div>
          
          {/* Column 5: Downloads */}
          <div className="lg:col-span-1">
            <h4 className="font-medium text-black mb-6">Tải ứng dụng</h4>
            <div className="flex flex-col gap-3">
              <button className="flex items-center justify-center gap-3 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors w-full sm:w-auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                <span className="text-xs text-left leading-tight">Download on the<br/><span className="text-sm font-bold">App Store</span></span>
              </button>
              <button className="flex items-center justify-center gap-3 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors w-full sm:w-auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 22.065V1.935a.5.5 0 0 1 .773-.418l15.652 10.065a.5.5 0 0 1 0 .836L3.773 22.483A.5.5 0 0 1 3 22.065z"/></svg>
                <span className="text-xs text-left leading-tight">Get it on<br/><span className="text-sm font-bold">Google Play</span></span>
              </button>
            </div>
          </div>
          
        </div>

        {/* Bottom Row */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex gap-4">
             <a href="https://www.facebook.com/profile.php?id=61590024181109" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-500 flex items-center justify-center text-white hover:bg-gray-700 transition-colors">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z"/></svg>
             </a>
             <a href="https://www.tiktok.com/@lenfolk3?_r=1&_t=ZS-96k1lxAtcmL" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-500 flex items-center justify-center text-white hover:bg-gray-700 transition-colors">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.68a6.34 6.34 0 0 0 6.27 6.36 6.34 6.34 0 0 0 6.25-6.36V7.93a8.11 8.11 0 0 0 1.94.24v-3.4a4.08 4.08 0 0 1-1.87-.24h2v2.16z"/></svg>
             </a>
           </div>
           
           <div className="text-gray-400 text-sm">
              © 2026 LENFOLK. All Rights Reserved.
           </div>
        </div>
        
      </div>
    </footer>
  );
};
