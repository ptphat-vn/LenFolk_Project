'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, BookOpen } from 'lucide-react';

export const AppIntroQR = () => {
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);

  return (
    <section className="py-12 bg-white relative overflow-hidden flex flex-col items-center">
      <div className="container mx-auto px-6 max-w-[1200px] relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative bg-[#e4e4e4] rounded-[40px] overflow-hidden shadow-xl shadow-gray-200/50"
        >
          {/* Inner Glowing Halo */}
          <div className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[600px] h-[600px] bg-[#d6ddc6]/60 rounded-full blur-[100px] pointer-events-none z-0"></div>

          <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
            {/* Left Content */}
            <div className="flex flex-col items-start text-left p-8 md:p-14">
              <h2 className="text-4xl md:text-5xl lg:text-5xl font-be-vietnam-pro mb-4 leading-[1.1] text-black tracking-tight">
                Sẵn sàng trải nghiệm <br />
                <span className="font-medium">LENFOLK</span>
              </h2>

              <p className="text-gray-500 text-lg mb-8 leading-relaxed max-w-lg font-light">
                Tải ngay ứng dụng để biến chiếc điện thoại của bạn thành giáo
                viên sáo trúc AI chuyên nghiệp. Theo dõi tiến độ và nhận phản
                hồi tức thì.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setIsAppModalOpen(true)}
                  className="flex items-center justify-center bg-gradient-to-r from-[#9eb07a] to-[#d4dcba] text-white px-8 py-4 rounded-full font-medium hover:opacity-90 transition-opacity shadow-lg shadow-[#9eb07a]/20"
                >
                  <span className="text-base font-semibold">Tải App Store</span>
                </button>
                <Link
                  href="/news"
                  className="flex items-center justify-center bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <span className="text-base font-semibold">Khám phá</span>
                </Link>
              </div>
            </div>

            {/* Right Content - Phone Mockup */}
            <div className="relative w-full h-[450px] md:h-full mt-8 md:mt-0 overflow-hidden md:overflow-visible rounded-b-[40px] md:rounded-b-none">
              <div className="absolute top-10 md:top-20 left-1/2 -translate-x-1/2 w-[280px] h-[550px] scale-[0.85] md:scale-100 origin-top bg-white rounded-t-[48px] border-x-[12px] border-t-[12px] border-gray-900 shadow-2xl overflow-hidden rotate-[10deg] md:rotate-[15deg] transform-gpu">
                {/* Dynamic Island */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-3xl z-20"></div>

                {/* Screen Content Mockup */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#e8eddf] to-white p-6 pt-16 flex flex-col items-center">
                  <div className="w-full flex justify-between items-center mb-10">
                    <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-xs font-bold text-gray-500">
                      ←
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/50"></div>
                  </div>

                  <div className="text-left w-full mb-8">
                    <div className="text-xl font-medium text-gray-800 mb-1">
                      Alex, bắt đầu thôi
                    </div>
                    <div className="text-sm text-gray-500">Tiến độ hôm nay</div>
                  </div>

                  {/* Circular Chart Mockup */}
                  <div className="relative w-48 h-48 rounded-full border-[16px] border-[#d6ddc6] flex items-center justify-center mb-10 shadow-inner">
                    <div className="absolute inset-[-16px] rounded-full border-[16px] border-transparent border-t-[#f4e0ac] border-l-[#f4e0ac] rotate-45"></div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">
                        85%
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        Hoàn thành
                      </div>
                    </div>
                  </div>

                  {/* Stats Cards Mockup */}
                  <div className="w-full grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl p-4 shadow-sm">
                      <div className="text-[10px] text-gray-400 mb-1">
                        BÀI TẬP
                      </div>
                      <div className="text-2xl font-bold text-black">12</div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm">
                      <div className="text-[10px] text-gray-400 mb-1">
                        KỸ NĂNG
                      </div>
                      <div className="text-2xl font-bold text-black">04</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Free Content CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-24 flex flex-col items-center text-center max-w-3xl mx-auto relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#d6ddc6]/30 text-[#6b7b4d] text-sm font-semibold mb-6">
            <Sparkles size={16} />
            <span>Học thử hoàn toàn miễn phí</span>
          </div>

          <h3 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800 tracking-tight">
            Khám phá nội dung gói Free
          </h3>

          <p className="text-gray-500 text-lg md:text-xl mb-10 leading-relaxed font-light">
            Trải nghiệm các bài học cơ bản, theo dõi tiến độ luyện tập và nhận
            đánh giá từ AI. Bắt đầu hành trình thổi sáo của bạn ngay hôm nay mà
            không tốn bất kỳ chi phí nào!
          </p>

          <Link
            href="/courses"
            className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-gray-900 text-white rounded-full font-medium text-lg hover:bg-black transition-all hover:-translate-y-1 shadow-lg group"
          >
            <span>Xem Khóa Học Miễn Phí</span>
            <BookOpen
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </motion.div>
      </div>

      {/* App Download Modal */}
      <AnimatePresence>
        {isAppModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col items-center p-6"
            >
              <button
                onClick={() => setIsAppModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
                aria-label="Close modal"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">
                Tải Lenfolk Beta
              </h3>
              <div className="w-full relative aspect-[4/5] sm:aspect-square flex justify-center items-center">
                <img
                  src="/images/qr_app.png"
                  alt="Lenfolk App QR Code"
                  className="max-w-full max-h-full object-contain rounded-xl"
                />
              </div>
              <p className="mt-4 text-center text-gray-600">
                Quét mã QR để tải ứng dụng trên điện thoại của bạn
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
