'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Music, Mic, GraduationCap } from 'lucide-react';

export const Instructors = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-sm font-medium tracking-wide mb-4 text-gray-500 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
            <span className="w-2 h-2 rounded-full bg-sage-dark"></span>
            Đội ngũ giảng viên
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-black">
            Chuyên gia đứng sau LENFOLK
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'Cô An', title: 'Giảng viên sáo trúc', icon: <Music />, bio: 'Hơn 15 năm kinh nghiệm giảng dạy. Chuyên gia cố vấn nội dung giáo trình.' },
            { name: 'Thầy Lâm', title: 'Nghệ nhân biểu diễn', icon: <Mic />, bio: 'Nghệ sĩ biểu diễn chuyên nghiệp với nhiều giải thưởng âm nhạc trong nước.' },
            { name: 'Thầy Vương', title: 'Thạc sĩ Nhạc viện TP.HCM', icon: <GraduationCap />, bio: 'Chuyên gia nghiên cứu âm nhạc cổ truyền và phát triển phương pháp giảng dạy.' },
          ].map((instructor, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="bg-white border border-gray-100 p-8 rounded-[32px] shadow-lg shadow-black/5 text-center group hover:-translate-y-2 transition-transform"
            >
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-tr from-[#d6ddc6] to-[#f4e0ac] flex items-center justify-center mb-6 text-[#8e9e6e] relative overflow-hidden">
                 {/* Avatar placeholder */}
                 <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
                 <div className="relative z-10">{instructor.icon}</div>
              </div>
              <h3 className="text-2xl font-bold mb-2">{instructor.name}</h3>
              <p className="text-sage-dark font-medium mb-4">{instructor.title}</p>
              <p className="text-gray-600">{instructor.bio}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
