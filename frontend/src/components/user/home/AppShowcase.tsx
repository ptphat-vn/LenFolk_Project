'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const AppShowcase = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Decorative Blob in top-left empty space */}
      <div className="absolute -top-20 -left-40 w-[400px] h-[400px] bg-gradient-to-tr from-[#EAF0DE]/50 to-[#e8d5a5]/30 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="w-full lg:w-1/2 flex flex-col items-start"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-be-vietnam-pro mb-6 text-black leading-tight mt-4">
              Một người thầy AI luôn sẵn sàng mỗi khi bạn cần
            </h2>

            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              Thiết kế tối giản để bạn chỉ nghĩ đến âm nhạc. Phản hồi tức thì, tiến trình rõ ràng luyện tập bất cứ lúc nào bạn muốn.
            </p>


          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
            className="w-full lg:w-1/2 relative flex justify-center"
          >
            {/* Vệt sáng nền (Glow Effect) */}
            <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[350px] bg-[#DCD74C] rounded-[50%] blur-[120px] opacity-80 z-0 pointer-events-none"></div>

            <div className="relative z-10 w-[320px] md:w-[400px] lg:w-[450px] drop-shadow-2xl hover:scale-105 transition-transform duration-500">
              <img 
                src="/images/Dienthoai_nguoithay.png" 
                alt="LenFolk App" 
                className="w-full h-auto object-contain"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
