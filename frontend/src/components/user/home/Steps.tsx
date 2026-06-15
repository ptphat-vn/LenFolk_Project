'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

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
    <section className="py-20 bg-[#8E9E6E]/60 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-12">

          {/* Left Side: Original Steps Accordion */}
          <div className="w-full lg:w-1/2">
            <div className="inline-flex items-center gap-2 text-sm font-medium tracking-wide mb-4 text-gray-700 bg-white/80 px-4 py-2 rounded-full shadow-sm border border-white/40 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-sage-dark"></span>
              Cách hoạt động
            </div>
            <h2 className="text-4xl md:text-5xl font-be-vietnam-pro mb-12 text-black">
              Bắt đầu hành trình chỉ trong 4 bước
            </h2>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`border-[2px] rounded-[32px] overflow-hidden transition-all duration-500 backdrop-blur-3xl ${openStep === index ? 'bg-white/90 shadow-[0_20px_40px_rgba(0,0,0,0.1)] border-white' : 'bg-white/50 border-white/70 hover:bg-white/70 hover:shadow-lg hover:-translate-y-1'}`}
                >
                  <button
                    onClick={() => setOpenStep(openStep === index ? -1 : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left"
                  >
                    <span className="text-xl font-bold">{index + 1}. {step.title}</span>
                    <ChevronDown
                      size={20}
                      className={`transition-transform duration-300 ${openStep === index ? 'rotate-180 text-sage-dark' : 'text-gray-500'}`}
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
                        <div className="px-6 pb-6 text-gray-700">
                          {step.description}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Staggered Masonry Layout */}
          <div className="w-full lg:w-1/2 flex gap-4 mt-8 lg:mt-0">
            {/* Column 1 (Left) */}
            <div className="w-1/2 flex flex-col gap-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full h-[200px] md:h-[280px] overflow-hidden"
              >
                <img src="/images/start1.jpg" alt="Step 1" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-[85%] h-[150px] md:h-[200px] ml-auto overflow-hidden"
              >
                <img src="/images/start2.jpg" alt="Step 3" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </motion.div>
            </div>

            {/* Column 2 (Right) - Shifted Down */}
            <div className="w-1/2 flex flex-col gap-4 mt-12 md:mt-16">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="w-[85%] h-[120px] md:h-[180px] overflow-hidden"
              >
                <img src="/images/start2.jpg" alt="Step 2" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="w-full h-[220px] md:h-[300px] overflow-hidden"
              >
                <img src="/images/start4.jpg" alt="Step 4" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

