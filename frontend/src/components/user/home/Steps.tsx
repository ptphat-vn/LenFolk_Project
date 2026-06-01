'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowRight } from 'lucide-react';

const steps = [
  {
    title: 'Tạo tài khoản miễn phí',
    description: 'Bắt đầu hành trình âm nhạc của bạn chỉ với vài thao tác đơn giản. Đăng ký nhanh chóng qua email.',
  },
  {
    title: 'Chọn khóa học',
    description: 'Từ cơ bản đến nâng cao, các khóa học được thiết kế riêng để đáp ứng nhu cầu và trình độ của bạn.',
  },
  {
    title: 'Luyện tập với AI',
    description: 'AI lắng nghe, phân tích và phản hồi ngay lập tức để giúp bạn sửa lỗi và nâng cao kỹ năng nhanh chóng.',
  },
  {
    title: 'Theo dõi tiến độ và cải thiện',
    description: 'Xem lại biểu đồ học tập, đánh giá mức độ tiến bộ và nhận gợi ý bài tập tiếp theo từ AI.',
  },
];

export const Steps = () => {
  const [openStep, setOpenStep] = useState(2);

  return (
    <section className="py-24 bg-sage-light/10">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          <div className="w-full lg:w-1/2">
            <div className="inline-flex items-center gap-2 text-sm font-medium tracking-wide mb-4 text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <span className="w-2 h-2 rounded-full bg-sage-dark"></span>
              Cách hoạt động
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-12 text-black">
              Bắt đầu hành trình chỉ trong 4 bước
            </h2>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <div 
                  key={index} 
                  className={`border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 ${openStep === index ? 'bg-white shadow-md' : 'bg-transparent hover:bg-white/50'}`}
                >
                  <button 
                    onClick={() => setOpenStep(openStep === index ? -1 : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left"
                  >
                    <span className="text-xl font-bold">{index + 1}. {step.title}</span>
                    <ChevronDown 
                      size={20} 
                      className={`transition-transform duration-300 ${openStep === index ? 'rotate-180 text-sage-dark' : 'text-gray-400'}`} 
                    />
                  </button>
                  <AnimatePresence>
                    {openStep === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-6 text-gray-600">
                          {step.description}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex justify-center">
             <div className="relative w-full max-w-sm aspect-[9/16] bg-cream rounded-[40px] p-8 shadow-xl flex flex-col justify-between overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-b from-transparent to-sage-dark/20 z-0"></div>
               <div className="relative z-10 space-y-4 w-full mt-10">
                 <div className="w-3/4 h-8 bg-white/80 backdrop-blur rounded-lg"></div>
                 <div className="w-full h-24 bg-white/90 backdrop-blur rounded-xl"></div>
                 <div className="w-5/6 h-12 bg-white/60 backdrop-blur rounded-lg"></div>
               </div>
               <div className="relative z-10 w-full h-40 bg-white rounded-2xl shadow-lg mt-auto flex items-center justify-center p-6">
                  <div className="w-16 h-16 rounded-full bg-sage-dark text-white flex items-center justify-center">
                    <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                  </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};
