'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const PhoneMockup = ({ className, innerClassName, maskFade = true }: { className?: string, innerClassName?: string, maskFade?: boolean }) => (
  <div
    className={`relative rounded-[2.5rem] p-[6px] bg-white border-t border-l border-gray-100 border-b-gray-200 border-r-gray-200 shadow-2xl ${className}`}
    style={maskFade ? { WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' } : {}}
  >
    <div className={`relative overflow-hidden rounded-[2.1rem] bg-gray-50 h-full shadow-inner ${innerClassName}`}>
      <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-20">
        <div className="w-28 h-7 bg-black rounded-b-3xl relative">
          <div className="absolute right-6 top-2 w-2 h-2 rounded-full bg-white/20" />
          <div className="absolute right-10 top-2.5 w-1.5 h-1.5 rounded-full bg-white/20" />
        </div>
      </div>
      <img src="/placeholder.png" alt="App UI" className="w-full h-full object-cover object-top" />
    </div>
  </div>
);

export const Hero = () => {
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);

  return (
    <section className="relative min-h-screen pt-32 pb-10 flex flex-col items-center justify-center overflow-hidden bg-white">
      {/* Hollow Glowing Ring Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-[15px] w-[1200px] h-[1200px] blur-[40px] md:w-[3000px] md:h-[3000px] md:blur-[80px]"
          style={{
            background: 'conic-gradient(from 0deg at 50% 50%, #d6ddc6 0deg, #f4e0ac 90deg, #d6ddc6 180deg, #8e9e6e 270deg, #d6ddc6 360deg)',
            WebkitMaskImage: 'radial-gradient(circle, transparent 400px, black 480px, black 520px, transparent 600px)',
            maskImage: 'radial-gradient(circle, transparent 400px, black 480px, black 520px, transparent 600px)',
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center mt-5">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
          className="text-4xl sm:text-5xl md:text-[5rem] lg:text-[5rem] font-bold tracking-tight mb-6 leading-tight font-sans"
        >
          DIGITAL BREATH<br />
          <span className="italic font-light font-serif">Timeless Soul</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="text-lg md:text-xl text-gray-500 max-w-2xl mb-12 mx-auto"
        >
          AI cảm nhận từng tiếng sáo giúp nâng tầm trải nghiệm  <br className="hidden md:block" />để mọi giai điệu ngân vang chuẩn xác
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="relative z-20 mb-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/60 backdrop-blur-md border border-gray-200 shadow-sm shadow-sage-dark/10"
        >
          <Sparkles size={20} className="text-sage-dark" />
          <span className="text-base font-medium tracking-wide">AI Flute Tutor</span>
        </motion.div>

        {/* 3 Phones Display (Image Mockup) */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="relative w-full max-w-5xl mx-auto flex justify-center items-end mt-2 md:-mt-8"
        >
          <img
            src="/images/3phones_header.png"
            alt="Lenfolk App mockup"
            className="h-auto object-contain drop-shadow-2xl z-10 -translate-y-[20px] md:-translate-y-[60px] w-[95%] sm:w-[85%] md:w-[calc(100%-180px)]"
            style={{
              WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 70%)',
              maskImage: 'linear-gradient(to bottom, black 50%, transparent 80%)'
            }}
          />
        </motion.div>

        {/* Action Buttons over the fade area */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 z-30 relative -mt-16 md:-mt-40 pb-32 md:pb-[200px]"
        >
          <button
            onClick={() => setIsAppModalOpen(true)}
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#6b7b4d] to-[#c9b775] text-white font-medium text-[17px] shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 w-[200px] flex items-center justify-center"
          >
            Tải app miễn phí
          </button>
          <Link href="/about" className="px-8 py-3.5 rounded-full bg-[#f5f5f5] text-[#333] font-medium text-[17px] hover:bg-[#ebebeb] transition-all hover:-translate-y-1 shadow-md w-[200px] flex items-center justify-center">
            Tìm hiểu thêm
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">Tải Lenfolk Beta</h3>
              <div className="w-full relative aspect-[4/5] sm:aspect-square flex justify-center items-center">
                <img
                  src="/images/qr_app copy.png"
                  alt="Lenfolk App QR Code"
                  className="max-w-full max-h-full object-contain rounded-xl"
                />
              </div>
              <p className="mt-4 text-center text-gray-600">Quét mã QR để tải ứng dụng trên điện thoại của bạn</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
