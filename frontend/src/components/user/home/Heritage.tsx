'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export const Heritage = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-[#EAF0DE]/40 to-transparent rounded-full blur-[100px] pointer-events-none z-0"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 text-sm font-medium tracking-wide mb-4 text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
            <span className="w-2 h-2 rounded-full bg-sage-dark"></span>
            Khơi nguồn di sản
          </div>
          <h2 className="text-4xl md:text-5xl font-be-vietnam-pro mb-6 text-black">
            Sức hút từ những điều <br /> nguyên bản
          </h2>
        </div>

        <div className="flex flex-col gap-20 lg:gap-32">

          {/* MỤC 1: SỰ ĐƠN GIẢN */}
          <div
            className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24"
          >
            <div className="w-full lg:w-1/2 flex flex-col justify-center">
              <div className="flex flex-row items-end gap-4 md:gap-8 mb-10 relative">
                {/* Vệt xanh lá trang trí */}
                <svg className="absolute -top-6 md:-top-10 left-4 md:left-12 w-32 md:w-56 text-[#c5d1b3] -rotate-3 z-0" viewBox="0 0 200 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 25 Q 50 5, 120 15 T 195 10" stroke="currentColor" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
                  <path d="M20 28 Q 70 8, 140 18 T 185 15" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
                </svg>

                <h3 className="text-8xl md:text-[140px] font-black tracking-tighter text-black leading-[0.85] relative z-10">01</h3>
                <div className="pb-2 md:pb-4 relative z-10">
                  <h4 className="text-3xl md:text-5xl font-bold uppercase text-black mb-2 tracking-tight">Tối Giản</h4>
                  <p className="text-[10px] md:text-xs font-semibold text-gray-500 tracking-[0.2em] uppercase">Nghệ thuật từ sáu lỗ bấm</p>
                </div>
              </div>

              <div className="max-w-md pt-8 border-t border-gray-200 relative">
                {/* Đốm loang xanh lá trang trí */}
                <div className="absolute -top-50 -right-100 w-48 h-100 bg-[#DCD74C]/80 rounded-full blur-3xl -z-10 pointer-events-none"></div>

                <span className="text-xs font-bold text-black uppercase tracking-widest mb-4 block relative z-10">01 / 03</span>
                <p className="text-gray-500 leading-relaxed text-[15px] relative z-10">
                  Không cần nhạc lý hàn lâm hay phím bấm phức tạp. Chỉ với 6 lỗ bấm mộc mạc, bạn đã sở hữu chiếc chìa khóa mở ra thế giới vạn giai điệu, biến những cảm xúc vô hình thành âm thanh trong trẻo.
                </p>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="aspect-[4/3] lg:aspect-square bg-[#f8f9f5] relative overflow-hidden border border-gray-100 shadow-xl shadow-sage-dark/5 group rounded-2xl">
                {/* Updated heritage_1 image */}
                <Image
                  src="/images/heritage_1_v2.jpg"
                  alt="Tối giản"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-[center_100%] transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
          </div>

          {/* MỤC 2: SỰ CHỮA LÀNH */}
          <div
            className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16"
          >
            <div className="w-full lg:w-1/4 flex flex-col justify-between order-2 lg:order-1 h-full py-10 relative">
              {/* Đốm loang vàng chữ AN */}
              <div className="absolute left-60 w-40 h-40 bg-[#688140]/40 rounded-full blur-3xl z-0 mix-blend-multiply pointer-events-none"></div>

              <div className="mb-10 lg:mb-0 relative z-10">
                <h4 className="text-4xl md:text-[56px] font-bold uppercase text-black leading-none mb-4 tracking-tight">An Yên</h4>
                <p className="text-[10px] md:text-xs font-semibold text-gray-500 tracking-[0.2em] uppercase">Thanh âm của chánh niệm</p>
              </div>
              <div className="hidden lg:block relative z-10">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">An Yên | Sự Chữa Lành</span>
              </div>
            </div>

            <div className="w-full lg:w-2/4 order-1 lg:order-2">
              <div className="w-full aspect-[4/5] lg:aspect-square bg-[#f8f9f5] relative overflow-hidden border border-gray-100 shadow-xl shadow-sage-dark/5 group rounded-2xl">
                <Image
                  src="/images/heritage_22.jpg"
                  alt="An yên"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>

            <div className="w-full lg:w-1/4 flex flex-col justify-center order-3 h-full py-10">
              <div className="flex flex-col items-start mb-10 relative">
                {/* Đốm loang vàng trang trí */}
                <div className="absolute -top-30 left-[200px] w-102 h-42 bg-yellow-400/80 rounded-full blur-3xl z-0 mix-blend-multiply"></div>

                <div className="text-xl font-bold text-gray-300 uppercase tracking-widest mb-4 relative z-10">02 / 03</div>
                <span className="text-6xl md:text-7xl font-black text-black leading-none mb-2 relative z-10">15'</span>
                <span className="text-[10px] md:text-xs font-semibold text-gray-500 tracking-[0.2em] uppercase relative z-10">Dành cho bạn</span>
              </div>
              <p className="text-gray-500 leading-relaxed text-[15px]">
                Tiếng sáo là sự kết tạo của nhịp thở và tâm hồn. Dành 15 phút mỗi ngày cùng sáo trúc giúp bạn điều hòa lồng ngực, giải tỏa áp lực và tìm lại khoảng lặng bình yên nguyên bản giữa nhịp sống hiện đại.
              </p>
            </div>
          </div>

          {/* MỤC 3: SỰ TỰ DO */}
          <div
            className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24"
          >
            <div className="w-full lg:w-1/2 order-2 lg:order-1 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-16">
                <h4 className="text-5xl md:text-[72px] font-bold uppercase text-black tracking-tight leading-none">Tự Do</h4>
                <div className="text-right">
                  <span className="text-sm font-bold text-black uppercase tracking-widest block">03 / 03</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-12 mb-12">
                <div>
                  <h5 className="text-4xl md:text-5xl font-black text-black mb-3">100%</h5>
                  <p className="text-[10px] md:text-xs font-semibold text-gray-500 tracking-[0.2em] uppercase">Tự nhiên</p>
                </div>
                <div>
                  <h5 className="text-4xl md:text-5xl font-black text-black mb-3">0</h5>
                  <p className="text-[10px] md:text-xs font-semibold text-gray-500 tracking-[0.2em] uppercase">Dây cắm hay pin</p>
                </div>
              </div>

              <div className="pt-10 border-t border-gray-200 relative">
                {/* Đốm loang xanh lá trang trí */}
                <div className="absolute -top-0 -left-40 w-60 h-40 bg-[#688140]/30 rounded-full blur-3xl z-0 mix-blend-multiply pointer-events-none"></div>

                <h5 className="text-[10px] md:text-xs font-semibold text-sage-dark tracking-[0.2em] uppercase mb-4 relative z-10">Giai điệu không giới hạn</h5>
                <p className="text-gray-500 leading-relaxed text-[15px] relative z-10">
                  Được chế tác hoàn toàn từ tre nứa tự nhiên, gọn nhẹ trong balo và không cần dây cắm hay pin sạc. Sáo trúc là nhạc cụ tự do nhất, sẵn sàng cùng bạn tấu lên giai điệu ở bất cứ nơi đâu bước chân bạn đặt tới.
                </p>
              </div>
            </div>
            <div className="w-full lg:w-1/2 order-1 lg:order-2">
              <div className="aspect-[4/3] bg-[#f8f9f5] relative overflow-hidden border border-gray-100 shadow-xl shadow-sage-dark/5 group rounded-2xl">
                <Image
                  src="/images/heritage_33.jpg"
                  alt="Tự do"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
