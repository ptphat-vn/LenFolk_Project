'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Activity, Star, Shield } from 'lucide-react';

export const AIQuality = () => {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="w-full md:w-[60%]">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-black">
              Chất lượng đào tạo & AI
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Hệ thống AI của chúng tôi không chỉ là một công cụ nhận diện âm thanh. Nó được đào tạo từ bộ dữ liệu chuẩn của hàng trăm nghệ sĩ sáo trúc hàng đầu, có khả năng phân tích sắc thái, nhịp điệu và cung cấp phản hồi chi tiết như một người thầy thực thụ.
            </p>
          </div>
          
          <div className="w-full md:w-[40%] flex flex-col gap-6">
            {[
              { icon: <Cpu />, text: 'AI được training từ bộ dữ liệu chuẩn chuyên gia' },
              { icon: <Activity />, text: 'Đánh giá âm thanh real-time' },
              { icon: <Star />, text: 'Giao diện trực quan, đẹp mắt' },
              { icon: <Shield />, text: 'Phản hồi cá nhân hóa theo từng học viên' },
            ].map((item, i) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-sage-light/30 flex items-center justify-center text-sage-dark">
                  {item.icon}
                </div>
                <span className="font-medium text-gray-800">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
