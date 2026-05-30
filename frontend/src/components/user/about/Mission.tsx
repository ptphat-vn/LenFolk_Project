'use client';
import React from 'react';
import { motion } from 'framer-motion';

export const Mission = () => {
  return (
    <section className="py-24 bg-white text-center">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.blockquote 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-serif italic text-black leading-tight mb-12"
        >
          "Dùng AI xóa bỏ rào cản địa lý và kinh tế — mang tinh hoa sáo trúc đến giới trẻ Việt Nam."
        </motion.blockquote>
        <p className="text-lg text-gray-600 mb-16 max-w-2xl mx-auto">
          Chúng tôi tin rằng mọi người đều có quyền tiếp cận với nền giáo dục âm nhạc chất lượng cao. Bằng cách kết hợp công nghệ AI tiên tiến, LENFOLK đang xây dựng một nền tảng học tập mở cho tất cả mọi người.
        </p>
        
        <div className="flex flex-wrap justify-center gap-6">
          {['Xóa rào cản địa lý', 'Bảo tồn văn hóa', 'Công nghệ AI tiên tiến'].map((stat, i) => (
            <span key={i} className="px-6 py-3 rounded-full bg-sage-light/20 text-sage-dark font-medium border border-sage-light/50">
              {stat}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
