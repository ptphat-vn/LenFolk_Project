'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { CourseModal } from './CourseModal';
import { getCourses } from '@/lib/api/mock/course';

export const Courses = () => {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    getCourses().then((data: any) => setCourses(data));
  }, []);

  return (
    <div id="courses" className="bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-6">

        {/* Featured Course */}
        <div className="bg-gradient-to-br from-sage-dark to-sage-light rounded-[40px] p-8 md:p-12 text-white mb-12 relative overflow-hidden shadow-2xl shadow-sage-dark/20 flex flex-col md:flex-row gap-12 items-center">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>

          <div className="w-full md:w-3/5 relative z-10">
            <div className="inline-flex items-center gap-2 text-sm font-medium tracking-wide mb-6 bg-white/20 px-4 py-2 rounded-full backdrop-blur-md">
              ⭐ Được đề xuất
            </div>
            <h3 className="text-4xl md:text-5xl font-bold mb-4">Gói TECH</h3>
            <div className="text-2xl font-bold mb-6 text-cream">459.000đ <span className="text-lg font-normal text-white/80">/ 3 tháng</span></div>
            <p className="text-white/90 text-lg mb-8 leading-relaxed">
              Trải nghiệm học tập toàn diện nhất. Truy cập không giới hạn vào tất cả các khóa học, nhận phản hồi AI tức thì và sự hỗ trợ trực tiếp từ giảng viên.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {[
                'Toàn bộ bài học từ cơ bản đến nâng cao', 'AI đánh giá hơi thổi real-time',
                'Lộ trình học cá nhân hóa', 'Hỗ trợ từ Y Len',
                'Truy cập ứng dụng LENFOLK', 'Cập nhật nội dung liên tục'
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 bg-white/20 p-1 rounded-full"><Check size={14} /></div>
                  <span className="text-sm font-medium">{feat}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setSelectedCourse('tech')}
                className="px-8 py-4 bg-white text-sage-dark font-bold rounded-full hover:bg-cream transition-colors"
              >
                Đăng ký ngay
              </button>
              <button
                onClick={() => setSelectedCourse('tech')}
                className="px-8 py-4 border-2 border-white/50 text-white font-bold rounded-full hover:bg-white/10 transition-colors"
              >
                Xem chi tiết
              </button>
            </div>
          </div>

          <div className="w-full md:w-2/5 flex justify-center relative z-10 hidden md:flex">
            {/* Decorative phone placeholder */}
            <div className="w-[280px] h-[560px] bg-black/20 backdrop-blur-xl rounded-[40px] border-[8px] border-white/30 shadow-2xl relative overflow-hidden flex flex-col">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-white/40 rounded-full"></div>
              <div className="mt-16 mx-4 p-4 bg-white/10 rounded-2xl">
                <div className="h-4 w-1/2 bg-white/40 rounded mb-2"></div>
                <div className="h-3 w-3/4 bg-white/20 rounded"></div>
              </div>
              <div className="mt-4 mx-4 flex-1 bg-white/5 rounded-t-2xl border-t border-x border-white/10"></div>
            </div>
          </div>
        </div>

        {/* Other Courses from API */}
        <div className="grid md:grid-cols-2 gap-8 mb-24">
          {courses.map((course) => {
            const isRepertoire = course.name === 'Gói REPERTOIRE';
            return (
              <div key={course.id} className={`rounded-[32px] p-8 md:p-10 border shadow-xl flex flex-col transition-colors ${isRepertoire
                ? 'bg-white border-black border-2 shadow-gray-200/50'
                : 'bg-white border-gray-100 shadow-gray-200/50 hover:border-sage-light'
                }`}>
                <h3 className="text-3xl font-bold mb-2 text-black">{course.name}</h3>
                <div className="text-xl font-bold mb-4 text-sage-dark">{course.price}</div>
                <p className="mb-8 flex-1 text-gray-600">{course.desc}</p>

                <div className="space-y-4 mb-10">
                  {course.features.map((feat: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1 p-1 rounded-full bg-sage-light/30 text-sage-dark"><Check size={14} /></div>
                      <span className="text-sm font-medium text-gray-700">{feat}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedCourse(course.id)}
                  className={`w-full py-4 border-2 font-bold rounded-full transition-colors mt-auto ${isRepertoire
                    ? 'border-black bg-black text-white hover:bg-white hover:text-black'
                    : 'border-black text-black hover:bg-black hover:text-white'
                    }`}
                >
                  Đăng ký
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <CourseModal isOpen={!!selectedCourse} onClose={() => setSelectedCourse(null)} courseId={selectedCourse} />
    </div>
  );
};
