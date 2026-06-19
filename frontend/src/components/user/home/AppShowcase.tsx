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

            <button className="flex items-center gap-3 text-lg font-bold text-black group hover:text-sage-dark transition-colors">
              Xem chi tiết
              <span className="w-10 h-10 rounded-full bg-sage-light/30 flex items-center justify-center group-hover:bg-sage-dark group-hover:text-white transition-all">
                <ArrowRight size={20} />
              </span>
            </button>
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

            <div className="relative z-10 w-[280px] h-[560px] sm:w-[300px] sm:h-[600px] bg-white rounded-[48px] border-[8px] border-gray-100 shadow-2xl overflow-hidden flex flex-col">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-100 rounded-full z-20"></div>

              <div className="flex-1 bg-gray-50 pt-16 px-6 pb-6 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h4 className="text-xl font-bold">Tổng quan</h4>
                    <p className="text-sm text-gray-500">Tiến độ hôm nay</p>
                  </div>
                  <div className="w-10 h-10 bg-sage-dark/10 rounded-full flex items-center justify-center">
                    <span className="w-3 h-3 bg-sage-dark rounded-full"></span>
                  </div>
                </div>

                {/* Circular Progress */}
                <div className="relative w-48 h-48 mx-auto mb-10 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                    <circle cx="50" cy="50" r="40" stroke="#8E9E6E" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset="62.8" strokeLinecap="round" className="animate-[spin_2s_ease-out]" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-bold font-sans">75%</span>
                    <span className="text-xs text-gray-500 uppercase font-medium tracking-wider">Hoàn thành</span>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4 mt-auto">
                  <div className="bg-white p-4 rounded-2xl shadow-sm">
                    <span className="block text-2xl font-bold mb-1">66</span>
                    <span className="text-xs text-gray-500">Hoàn thành</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-sm">
                    <span className="block text-2xl font-bold mb-1">03</span>
                    <span className="text-xs text-sage-dark">Đang học</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-sm col-span-2">
                    <span className="block text-2xl font-bold mb-1">06</span>
                    <span className="text-xs text-gray-500">Chưa làm</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
