'use client';
import React from 'react';
import { ArrowRight } from 'lucide-react';

export const News = () => {
  return (
    <section id="news" className="py-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-5xl font-bold mb-4 text-black">Tin tức & Sự kiện</h2>
          <p className="text-xl text-gray-600">Cập nhật mới nhất về sáo trúc, nghệ thuật dân tộc và cộng đồng LENFOLK.</p>
        </div>

        {/* Featured Article */}
        <div className="w-full bg-white rounded-[32px] overflow-hidden shadow-xl mb-12 flex flex-col md:flex-row border border-gray-100 group cursor-pointer">
          <div className="w-full md:w-1/2 bg-gradient-to-br from-sage-light to-cream min-h-[300px] flex items-center justify-center group-hover:scale-105 transition-transform duration-700 origin-left">
             <div className="w-24 h-24 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-xl">
               <span className="font-serif italic text-2xl font-bold">L.</span>
             </div>
          </div>
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white z-10 relative">
            <span className="text-sage-dark font-medium mb-4 tracking-wider uppercase text-sm">Sự kiện nổi bật • 24 Thg 5, 2026</span>
            <h3 className="text-3xl font-bold mb-4 leading-tight group-hover:text-sage-dark transition-colors">Thiên Âm — Dự án âm nhạc kết hợp công nghệ AI và sáo trúc cổ truyền</h3>
            <p className="text-gray-600 mb-8 leading-relaxed line-clamp-3">Sự kiện ra mắt dự án âm nhạc kết hợp độc đáo giữa âm thanh sáo trúc truyền thống và công nghệ trí tuệ nhân tạo, mở ra kỷ nguyên mới cho nghệ thuật dân tộc.</p>
            <div className="flex items-center gap-2 text-black font-bold group-hover:text-sage-dark transition-colors">
              Đọc thêm <ArrowRight size={16} />
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { tag: 'Sự kiện', title: 'Vươn Mình Cùng Đất Nước — Sự kiện biểu diễn FPT 2026' },
            { tag: 'Nghệ thuật', title: 'Nghệ thuật sáo trúc trong kỷ nguyên số' },
            { tag: 'Công nghệ', title: 'LENFOLK ra mắt tính năng AI nhận diện âm thanh mới' },
          ].map((article, i) => (
            <div key={i} className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer flex flex-col">
               <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 group-hover:scale-105 transition-transform duration-500"></div>
               </div>
               <div className="p-6 flex flex-col flex-1">
                 <div className="flex justify-between items-center mb-4">
                   <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-100">{article.tag}</span>
                   <span className="text-xs text-gray-400">20 Thg 5</span>
                 </div>
                 <h4 className="text-xl font-bold mb-4 group-hover:text-sage-dark transition-colors line-clamp-2">{article.title}</h4>
                 <div className="mt-auto flex items-center gap-2 text-sm font-bold text-gray-500 group-hover:text-sage-dark transition-colors opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                    Đọc thêm <ArrowRight size={14} />
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
