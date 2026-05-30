'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Minh Tuấn',
    role: 'Sinh viên, 20 tuổi',
    quote: 'Tôi chưa bao giờ nghĩ mình có thể tự học sáo trúc tại nhà cho đến khi biết đến LENFOLK. Trải nghiệm học với AI thực sự khác biệt.',
  },
  {
    name: 'Hoàng Oanh',
    role: 'Nhân viên văn phòng, 28 tuổi',
    quote: 'Giao diện ứng dụng rất đẹp và dễ sử dụng. Những phản hồi từ AI giúp tôi sửa được lỗi sai về nhịp mà trước giờ tôi không nhận ra.',
  },
  {
    name: 'Thanh Hùng',
    role: 'Học sinh, 16 tuổi',
    quote: 'Nhờ LENFOLK, tôi đã có thể tự tin biểu diễn một bài hát hoàn chỉnh chỉ sau 2 tháng luyện tập.',
  }
];

export const Testimonials = () => {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-sm font-medium tracking-wide mb-4 text-gray-500 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
            <span className="w-2 h-2 rounded-full bg-sage-dark"></span>
            Học viên chia sẻ
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-black">
            Câu chuyện thật, kết quả thật
          </h2>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-12 snap-x snap-mandatory px-4 md:px-0 scrollbar-hide">
          {testimonials.map((test, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              className={`flex-none w-[85vw] sm:w-[400px] snap-center p-8 rounded-[32px] ${
                index === 1 
                  ? 'bg-sage-dark text-white shadow-xl shadow-sage-dark/20 scale-105' 
                  : 'bg-gray-50 border border-gray-100 text-black'
              }`}
            >
              <Quote size={40} className={`mb-6 opacity-30 ${index === 1 ? 'text-white' : 'text-sage-dark'}`} />
              <p className={`text-lg mb-8 leading-relaxed italic font-serif ${index === 1 ? 'text-white/90' : 'text-gray-600'}`}>
                "{test.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full ${index === 1 ? 'bg-white/20' : 'bg-sage-light/50'}`}></div>
                <div>
                  <h4 className="font-bold">{test.name}</h4>
                  <p className={`text-sm ${index === 1 ? 'text-white/70' : 'text-gray-500'}`}>{test.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
