'use client';
import React from 'react';
import { motion } from 'framer-motion';

export const Partners = () => {
  return (
    <section className="py-12 bg-gray-50 overflow-hidden border-y border-gray-100">
      <div className="container mx-auto px-6 mb-8 text-center">
        <div className="inline-flex items-center gap-2 text-sm font-medium tracking-wide text-gray-500">
          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
          Đối tác đồng hành
        </div>
      </div>
      <div className="flex whitespace-nowrap overflow-hidden">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
          className="flex gap-12 items-center px-6"
        >
          {[...Array(3)].map((_, i) => (
            <React.Fragment key={i}>
              {['FPT University', 'FTI', 'Sáo Trúc L.A', 'Dương Sáo', 'Sáo Bảo Lê', 'Vietnam Folk Music'].map((partner, j) => (
                <div key={`${i}-${j}`} className="px-8 py-4 rounded-full border border-gray-200 bg-white text-gray-500 font-bold tracking-wider uppercase text-lg">
                  {partner}
                </div>
              ))}
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
