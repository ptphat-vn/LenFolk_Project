'use client';
import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { value: '120+', label: 'Giờ nội dung' },
  { value: '140+', label: 'Màn hình' },
  { value: '100+', label: 'Components' },
  { value: '03', label: 'Chuyên gia hàng đầu' },
];

export const Stats = () => {
  return (
    <div className="w-full relative z-30 -mt-32 pb-20">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="bg-gray-50/80 backdrop-blur-xl border border-gray-100 rounded-[32px] p-10 md:p-12 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className={`flex flex-col items-center justify-center text-center px-4 ${index > 1 ? 'pt-8 md:pt-0' : ''} ${index % 2 === 1 ? 'border-l border-gray-200 md:border-none' : ''}`}
              >
                <h3 className="text-4xl md:text-5xl font-light text-black mb-3 font-serif tracking-tight">{stat.value}</h3>
                <p className="text-gray-500 text-xs md:text-sm font-medium uppercase tracking-[0.2em]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
