'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Courses } from '@/components/user/courses/Courses';
import { FAQ } from '@/components/user/courses/FAQ';

export default function CoursesPage() {
  return (
    <div className="pt-24 bg-gray-50 min-h-screen overflow-x-hidden">
      <div className="container mx-auto px-6 max-w-4xl text-center py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 text-sm font-medium tracking-wide mb-6 text-gray-500 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-sage-dark"></span>
            Lộ trình phát triển
          </div>
          <h1 className="text-4xl md:text-6xl font-be-vietnam-pro mb-6 text-black tracking-tight leading-tight">
            Chọn con đường âm nhạc<br />
            <span className="text-[#8e9e6e]">dành riêng cho bạn</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Dù bạn mới bắt đầu làm quen với sáo trúc hay đang muốn hoàn thiện kỹ thuật nâng cao, LENFOLK luôn có một lộ trình học tập phù hợp. Mọi bài học đều được AI theo sát, phân tích và hướng dẫn tỉ mỉ.
          </p>
        </motion.div>
      </div>
      <Courses />
      <FAQ />
    </div>
  );
}
