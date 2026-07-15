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
          <h2 className="text-4xl md:text-5xl font-be-vietnam-pro text-black">
            Chuyên gia đứng sau LENFOLK
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto gap-8 justify-center items-center">
          {[
            {
              name: 'Ts. Nguyễn Huy Vương',
              title: 'Chuyên gia nghiên cứu âm nhạc cổ truyền',
              icon: <GraduationCap />,
              bio: 'Chuyên gia nghiên cứu âm nhạc cổ truyền và cố vấn nội dung giáo trình.'
            },
            {
              name: 'Ths. Nguyễn Khánh An',
              title: 'Giảng viên sáo trúc',
              icon: <Music />,
              bio: 'Với 10 năm kinh nghiệm giảng dạy. Chuyên gia cố vấn nội dung giáo trình.'
            },
          ].map((instructor, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative group"
            >
              {/* Hiệu ứng mờ màu xanh (Green Glow) nổi bật */}
              <div className="absolute inset-0 bg-[#8aa667]/50 blur-[80px] rounded-[32px] pointer-events-none group-hover:bg-[#8aa667] group-hover:blur-[100px] group-hover:scale-110 transition-all duration-700 z-0"></div>

              <div className="relative bg-white/95 backdrop-blur-md border-2 border-[#8aa667]/20 p-8 rounded-[32px] shadow-2xl shadow-[#8aa667]/30 group-hover:shadow-[#8aa667]/60 text-center transition-all duration-500 z-10 h-full flex flex-col">

                <div className="relative w-32 h-32 mx-auto mb-6">
                  {/* Hiệu ứng nốt nhạc phúng ra */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none z-0">
                    {[...Array(6)].map((_, idx) => (
                      <motion.span
                        key={idx}
                        initial={{ opacity: 0, y: 0, x: 0, scale: 0.5, rotate: 0 }}
                        animate={{
                          opacity: [0, 1, 0],
                          y: [0, -100 - (idx * 20)],
                          x: [0, (idx % 2 === 0 ? 1 : -1) * (40 + idx * 15)],
                          scale: [0.5, 1.8, 1],
                          rotate: [0, (idx % 2 === 0 ? 45 : -45)]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: idx * 0.5,
                          ease: "easeOut"
                        }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#8aa667] text-3xl font-bold drop-shadow-lg"
                      >
                        {['♪', '♫', '♬'][idx % 3]}
                      </motion.span>
                    ))}
                  </div>

                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#d6ddc6] to-[#f4e0ac] flex items-center justify-center text-[#8e9e6e] relative overflow-hidden ring-4 ring-white shadow-xl z-10">
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
                    <div className="relative z-10 scale-150">{instructor.icon}</div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-2 relative z-10 text-black">{instructor.name}</h3>
                <p className="text-sage-dark font-medium mb-4 relative z-10">{instructor.title}</p>
                <p className="text-gray-600 relative z-10 leading-relaxed">{instructor.bio}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
