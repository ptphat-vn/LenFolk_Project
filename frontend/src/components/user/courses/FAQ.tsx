'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const faqs = [
    'Làm thế nào để bắt đầu học?',
    'Khóa học có chứng chỉ không?',
    'Tôi cần chuẩn bị nhạc cụ gì?',
    'Tôi có thể học offline không?',
    'AI đánh giá âm thanh như thế nào?',
    'Chính sách hoàn tiền như thế nào?',
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-sm font-medium tracking-wide mb-4 text-gray-500 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
            <span className="w-2 h-2 rounded-full bg-sage-dark"></span>
            FAQ
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-black">
            Giải đáp thắc mắc
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {faqs.map((q, i) => (
            <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50">
              <button 
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                className="w-full px-6 py-5 flex items-center justify-between text-left font-medium text-lg"
              >
                <span>{q}</span>
                <ChevronDown size={20} className={`transition-transform duration-300 ${openIndex === i ? 'rotate-180 text-sage-dark' : 'text-gray-400'}`} />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-6 pb-6 text-gray-600 border-t border-gray-100 pt-4">
                      Chi tiết câu trả lời cho câu hỏi "{q}" sẽ được hiển thị ở đây. Hệ thống hỗ trợ tận tình để đảm bảo bạn có trải nghiệm tốt nhất.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
