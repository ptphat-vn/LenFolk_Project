'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Play, CheckCircle2, Mic2, Star } from 'lucide-react';

export const Features = () => {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Symmetrical Decorative Blob in bottom-left */}
      <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-gradient-to-br from-[#EAF0DE]/50 to-[#e8d5a5]/30 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-sm font-medium tracking-wide mb-4 text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
            <span className="w-2 h-2 rounded-full bg-sage-dark"></span>
            Tính năng nổi bật
          </div>
          <h2 className="text-4xl md:text-5xl font-be-vietnam-pro mb-6 text-black">
            Công cụ AI cho hành trình <br className="hidden md:block" /> âm nhạc của bạn
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="flex flex-col bg-[#f5f5f5] rounded-[28px] p-5 border border-gray-100 shadow-lg shadow-sage-light/5"
          >
            {/* UI Top */}
            <div className="bg-gradient-to-br from-[#e8eddf]/200 to-[#f4e0ac]/150 rounded-[20px] p-5 mb-5 h-[250px] flex flex-col gap-3 border border-white/50 shadow-inner">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center justify-center shadow-sm">
                  <span className="text-[9px] text-gray-500 mb-0.5 text-center font-medium uppercase tracking-wider">Đã xong</span>
                  <span className="text-2xl font-bold text-black">12</span>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center justify-center shadow-sm">
                  <span className="text-[9px] text-gray-500 mb-0.5 text-center font-medium uppercase tracking-wider">Đang học</span>
                  <span className="text-2xl font-bold text-black">03</span>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center justify-center shadow-sm">
                  <span className="text-[9px] text-gray-500 mb-0.5 text-center font-medium uppercase tracking-wider">Sắp mở</span>
                  <span className="text-2xl font-bold text-black">06</span>
                </div>
              </div>
              <div className="flex gap-2 flex-1">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 flex-1 flex flex-col justify-center shadow-sm">
                  <span className="text-[10px] text-sage-dark font-semibold tracking-wide uppercase mb-1">Lộ trình 21 ngày</span>
                  <span className="text-base font-bold text-black">Cơ bản</span>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 flex-1 flex flex-col justify-center shadow-sm">
                  <span className="text-[10px] text-sage-dark font-semibold tracking-wide uppercase mb-1">Kỹ thuật cao</span>
                  <span className="text-base font-bold text-black">Nâng cao</span>
                </div>
              </div>
            </div>
            {/* Text Bottom */}
            <div className="px-2 mt-auto">
              <h3 className="text-xl font-bold mb-2 text-black">Tất Cả Lộ Trình Trong Tầm Tay</h3>
              <p className="text-gray-500 leading-relaxed text-[13px]">Theo dõi toàn bộ bài học, cấp độ và tiến độ chinh phục sáo trúc của bạn trên một giao diện duy nhất.</p>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col bg-[#f5f5f5] rounded-[28px] p-5 border border-gray-100 shadow-lg shadow-sage-light/5"
          >
            {/* Text Top */}
            <div className="px-2 mb-5 mt-1">
              <h3 className="text-xl font-bold mb-2 text-black">Luyện Tập Cá Nhân Hóa</h3>
              <p className="text-gray-500 leading-relaxed text-[13px]">Nắm bắt kiến thức qua video trực quan và nhận hướng dẫn từng bước để thực hành ngay lập tức.</p>
            </div>
            {/* UI Bottom */}
            <div className="bg-gradient-to-br from-[#e8eddf]/100 to-[#f4e0ac]/100 rounded-[20px] p-5 mt-auto h-[250px] flex flex-col gap-2.5 border border-white/50 shadow-inner">
              <div className="bg-white/90 rounded-xl p-2.5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Play size={16} className="text-gray-600 ml-0.5" />
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-black leading-tight">Video bài giảng</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">Cách lấy hơi cơ bản</div>
                  </div>
                </div>
              </div>
              <div className="bg-sage-dark text-white rounded-xl p-2.5 flex items-center justify-center gap-2 shadow-md font-medium text-[13px] cursor-pointer hover:bg-sage-dark/90 transition-colors">
                <Mic2 size={15} /> Luyện tập với AI
              </div>
              <div className="bg-white/80 rounded-xl p-3.5 flex-1 shadow-sm mt-0.5">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Checklist kỹ năng</div>
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-sage-dark" />
                    <span className="text-[13px] text-gray-800 font-medium">Tư thế cầm sáo</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 flex-shrink-0 ml-0.5"></div>
                    <span className="text-[13px] text-gray-500">Cách đặt đúng môi</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col bg-[#f5f5f5] rounded-[28px] p-5 border border-gray-100 shadow-lg shadow-sage-light/5"
          >
            {/* UI Top */}
            <div className="bg-gradient-to-br from-[#e8eddf]/180 to-[#f4e0ac]/100 rounded-[20px] p-5 mb-5 h-[250px] flex flex-col justify-center gap-2 border border-white/50 shadow-inner overflow-hidden">

              <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-1.5 flex items-center gap-3 shadow-sm border border-white/60">
                <div className="w-2 h-2 rounded-full bg-sage-dark flex-shrink-0"></div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-medium text-gray-800 leading-tight">Chấm điểm tự động</span>
                  <span className="text-[10px] text-gray-500 mt-0.5">Xuất sắc - 85/100</span>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-1.5 flex items-center gap-3 shadow-sm border border-white/60">
                <div className="w-2 h-2 rounded-full bg-sage-dark flex-shrink-0"></div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-medium text-gray-800 leading-tight">Bấm ngón chính xác</span>
                  <span className="text-[10px] text-gray-500 mt-0.5">Kỹ năng tốt</span>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-1.5 flex items-center gap-3 shadow-sm border border-white/60">
                <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"></div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-medium text-gray-800 leading-tight">Lấy hơi sai kỹ thuật</span>
                  <span className="text-[10px] text-gray-500 mt-0.5">Cần cải thiện</span>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-1.5 flex items-center gap-3 shadow-sm border border-white/60">
                <div className="w-2 h-2 rounded-full bg-sage-dark flex-shrink-0"></div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-medium text-gray-800 leading-tight">Luồng hơi đều</span>
                  <span className="text-[10px] text-gray-500 mt-0.5">Kỹ năng tốt</span>
                </div>
              </div>
            </div>
            {/* Text Bottom */}
            <div className="px-2 mt-auto">
              <h3 className="text-xl font-bold mb-2 text-black">Phân Tích & Chấm Điểm</h3>
              <p className="text-gray-500 leading-relaxed text-[13px]">Dễ dàng hiểu rõ kỹ năng của bạn qua các đánh giá chi tiết và điểm số từ trợ lý AI.</p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
