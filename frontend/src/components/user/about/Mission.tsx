'use client';
import React from 'react';
import { motion } from 'framer-motion';

export const Mission = () => {
  return (
    <section className="relative pt-50 pb-24 bg-white overflow-hidden">
      {/* Background Pattern (Split to left and right) */}
      <div className="absolute inset-y-0 left-0 w-1/2 md:w-[40%] bg-[url('/images/flute_capital_bg.png')] bg-cover bg-right opacity-50 z-0"></div>
      <div className="absolute inset-y-0 right-0 w-1/2 md:w-[40%] bg-[url('/images/flute_capital_bg.png')] bg-cover bg-right opacity-50 z-0 scale-x-[-1]"></div>

      {/* Edge fading to blend seamlessly into the center */}
      <div className="absolute inset-y-0 left-0 w-1/2 md:w-[40%] bg-gradient-to-r from-transparent to-white/90 z-0"></div>
      <div className="absolute inset-y-0 right-0 w-1/2 md:w-[40%] bg-gradient-to-l from-transparent to-white/90 z-0"></div>

      {/* Vertical yellow gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#F4E0AC] via-[#F4E0AC]/10 to-white/90 z-0 pointer-events-none"></div>

      {/* 1. Headline & Mission */}
      <div className="container mx-auto px-6 max-w-6xl text-center relative z-10">
        <motion.blockquote
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
          className="text-6xl md:text-5xl font-bold text-black leading-[1.3] mb-7 drop-shadow-[0_4px_10px_rgba(255,255,255,1)]"
        >
          Vượt mọi rào cản địa lý đưa tinh hoa Sáo Trúc <br className="hidden md:block" />
          đến gần hơn với thế hệ trẻ Việt Nam
        </motion.blockquote>

        <p className="text-lg md:text-xl text-black/50 font-normal mb-16 max-w-5xl mx-auto leading-relaxed drop-shadow-[0_2px_10px_rgba(255,255,255,1)]">
          Khởi nguồn từ tình yêu văn hóa Việt, LENFOLK mang đến không gian học sáo trúc không giới hạn<br className="hidden md:block" />
          Nơi công nghệ AI tiên tiến vươn mình trở thành người thầy tận tâm, kiên nhẫn đồng hành <br className="hidden md:block" />
          cùng bạn trên hành trình chinh phục từng cung bậc âm thanh của tiếng Sáo.

        </p>

        <div className="flex flex-wrap justify-center gap-6 mb-24">
          {['Học sáo không giới hạn', 'Gìn giữ hồn cốt Việt', 'Đột phá cùng công nghệ AI'].map((stat, i) => (
            <span key={i} className="px-8 py-4 rounded-full bg-gradient-to-tr from-white/30 via-white/80 to-white/20 backdrop-blur-md border border-sage-dark text-sage-dark font-bold shadow-[0_0_25px_rgba(0,0,0,0.15)] transition-all cursor-default">
              {stat}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
