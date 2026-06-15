'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export const Mission = () => {
  return (
    <div className="font-be-vietnam-pro flex flex-col gap-6 mx-4 md:mx-6 my-24">

      {/* Top Frame */}
      <section className="bg-[#637250] text-white py-20 md:py-32 rounded-[40px] overflow-hidden relative shadow-inner">
        {/* Background Glow */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-black/30 rounded-full blur-[120px] pointer-events-none z-0"></div>

        {/* VietNam Image on top of the glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute top-1/2 -translate-y-1/2 -right-10 w-[300px] md:w-[500px] lg:w-[650px] aspect-square pointer-events-none z-0 -translate-x-[50px]"
        >
          <Image
            src="/images/VietNam.png"
            alt="Sáo Trúc"
            fill
            sizes="(max-width: 768px) 300px, (max-width: 1024px) 500px, 650px"
            className="object-contain drop-shadow-2xl"
          />
        </motion.div>

        <div className="container mx-auto px-6 lg:px-12 max-w-[1400px] relative z-10">
          {/* Huge Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-xl lg:text-5xl font-medium leading-[1.2] tracking-tight mb-8 uppercase ml-5 md:ml-20 lg:ml-20"
          >
            VƯỢT MỌI RÀO CẢN ĐỊA LÝ <br className="hidden md:block" />
            ĐƯA <span className="text-[#DCD74C] inline-block -translate-y-1 lg:-translate-y-2">→</span> TINH HOA SÁO TRÚC <br className="hidden md:block" />
            &emsp;&emsp;&emsp;&emsp;ĐẾN GẦN THẾ HỆ TRẺ VIỆT
          </motion.h1>
        </div>

        {/* Bottom Left Yellow Glow */}
        <div className="absolute -bottom-10 -left-10 md:-bottom-20 md:-left-20 w-[200px] h-[200px] md:w-[300px] md:h-[300px] bg-[#DCD74C]/10 rounded-full blur-[60px] pointer-events-none z-0"></div>

        {/* 7 Fixed Bars */}
        <div className="absolute bottom-20 left-20 md:bottom-10 md:left-25 flex items-center gap-1.5 md:gap-2 z-10">
          {[
            { color: '#D7E2CD', height: 'h-8 md:h-6' },
            { color: '#D7E2CD', height: 'h-10 md:h-10' },
            { color: '#AAC18F', height: 'h-12 md:h-14' },
            { color: '#AAC18F', height: 'h-14 md:h-24' },
            { color: '#AAC18F', height: 'h-12 md:h-14' },
            { color: '#D7E2CD', height: 'h-10 md:h-10' },
            { color: '#D7E2CD', height: 'h-8 md:h-5' },
            { color: '#AAC18F', height: 'h-8 md:h-8' },
            { color: '#AAC18F', height: 'h-8 md:h-14' },
            { color: '#AAC18F', height: 'h-8 md:h-8' },
            { color: '#D7E2CD', height: 'h-8 md:h-5' }
          ].map((bar, i) => (
            <div
              key={i}
              className={`w-2.5 md:w-3.5 ${bar.height} rounded-full`}
              style={{ backgroundColor: bar.color }}
            />
          ))}
        </div>
      </section>

      {/* Bottom Content */}
      <section className="text-black py-2 md:py-20 relative" style={{ clipPath: 'inset(-300px -300px -300px -300px)' }}>
        {/* Green Glow */}
        <div className="absolute -top-10 right-[30%] md:right-[40%] w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-[#8aa667]/50 rounded-full blur-[80px] md:blur-[120px] pointer-events-none z-0"></div>

        <div className="container mx-auto px-6 lg:px-12 max-w-[1400px] relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

            <div className="md:col-span-3 flex items-center gap-3 text-sage-dark text-sm font-bold tracking-widest uppercase">
              <div className="w-2 h-2 bg-sage-dark"></div>
              Về chúng tôi
            </div>

            <div className="md:col-span-9 lg:col-span-8 translate-x-[250px]">
              <p className="text-3xl md:text-4xl lg:text-5xl font-be-vietnam-pro leading-[1.1] tracking-[-0.02em]">
                <span className="text-black">
                  &emsp;&emsp;Đồng hành cùng thế hệ trẻ<br />LENFOLK{' '}
                </span>
                <span className="text-black/40">
                  ứng dụng AI dạy <br />sáo trúc mang tính đột phá.
                </span>
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Z-Pattern Content */}
      <section className="py-12 md:py-20 relative mt-0">
        <div className="container mx-auto max-w-[1200px]">
          <div className="flex flex-col gap-24 lg:gap-32">

            {/* Block 1: Digital Breath */}
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
              <div className="w-full lg:w-1/2 flex flex-col justify-center relative">
                {/* Yellow Glow Spot */}
                <div className="absolute -bottom-[150px] md:-bottom-[450px] -left-10 md:-left-20 w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-[#DCD74C]/60 rounded-full blur-[60px] md:blur-[90px] pointer-events-none z-0"></div>
                
                <h3 className="text-4xl md:text-5xl lg:text-6xl font-be-vietnam-pro text-[#41533B] mb-6 tracking-wider relative z-10">
                  Hơi thở số
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed font-light mb-10 max-w-lg relative z-10">
                  Tiếng sáo bắt nguồn từ hơi thở của con người. Việc đưa AI vào là cách chúng ta “số hóa” hơi thở đó. Nó đại diện cho tính hiện đại, sự chính xác của công nghệ và sự lan tỏa không giới hạn.
                </p>
              </div>
              <div className="w-full lg:w-5/12 flex justify-center relative">
                {/* Decorative Trail 1 */}
                <div className="absolute -left-12 md:-left-24 top-1/4 -rotate-12 flex gap-3 md:gap-4 text-[#8aa667] text-2xl md:text-3xl opacity-60 pointer-events-none z-0">
                  <span className="translate-y-0 animate-pulse">♪</span>
                  <span className="translate-y-4 animate-pulse" style={{ animationDelay: '0.2s' }}>♫</span>
                  <span className="translate-y-8 animate-pulse" style={{ animationDelay: '0.4s' }}>♬</span>
                  <span className="translate-y-12 animate-pulse" style={{ animationDelay: '0.6s' }}>♪</span>
                  <span className="translate-y-16 animate-pulse" style={{ animationDelay: '0.8s' }}>♫</span>
                </div>
                
                <div className="w-4/5 md:w-3/4 lg:w-[85%] aspect-[4/5] bg-gray-200 rounded-[48px] overflow-hidden relative shadow-2xl shadow-gray-200 z-10">
                  <Image 
                    src="/images/Hoithoso.jpg" 
                    alt="Hơi thở số" 
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Block 2: Timeless Soul */}
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
              <div className="w-full lg:w-5/12 order-2 lg:order-1 flex justify-center relative">
                {/* Decorative Trail 2 */}
                <div className="absolute -right-12 md:-right-24 bottom-1/4 rotate-12 flex gap-3 md:gap-4 text-[#8aa667] text-2xl md:text-3xl opacity-60 pointer-events-none z-0">
                  <span className="-translate-y-16 animate-pulse" style={{ animationDelay: '0.8s' }}>♫</span>
                  <span className="-translate-y-12 animate-pulse" style={{ animationDelay: '0.6s' }}>♪</span>
                  <span className="-translate-y-8 animate-pulse" style={{ animationDelay: '0.4s' }}>♬</span>
                  <span className="-translate-y-4 animate-pulse" style={{ animationDelay: '0.2s' }}>♫</span>
                  <span className="translate-y-0 animate-pulse">♪</span>
                </div>

                <div className="w-4/5 md:w-3/4 lg:w-[85%] aspect-[4/5] bg-gray-200 rounded-[48px] overflow-hidden relative shadow-2xl shadow-gray-200 z-10">
                  <Image 
                    src="/images/tamhonvinhcu.jpg" 
                    alt="Tâm hồn vĩnh cửu" 
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="w-full lg:w-1/2 flex flex-col justify-center order-1 lg:order-2 relative">
                {/* Green Glow Spot */}
                <div className="absolute -bottom-[150px] md:-bottom-[300px] -right-32 md:-right-[350px] w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-[#8aa667]/80 rounded-full blur-[60px] md:blur-[90px] pointer-events-none z-0"></div>

                <h3 className="text-4xl md:text-5xl lg:text-6xl font-be-vietnam-pro text-[#41533B] mb-6 tracking-wider relative z-10">
                  Tâm hồn vĩnh cửu
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed font-light mb-10 max-w-lg relative z-10">
                  Khẳng định sáo là hồn cốt dân tộc, là giá trị văn hóa không bao giờ lỗi thời. Dù công nghệ có thay đổi, cái “tâm” và cái “tình” trong tiếng sáo vẫn nguyên vẹn.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
