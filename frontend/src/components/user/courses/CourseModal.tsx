'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string | null;
}

export const CourseModal = ({ isOpen, onClose, courseId }: CourseModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && courseId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={onClose} 
          />
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[32px] shadow-2xl overflow-y-auto"
          >
            <div className="sticky top-0 bg-white/90 backdrop-blur-md p-6 border-b border-gray-100 flex justify-between items-center z-10">
              <h3 className="text-2xl font-bold">Chi tiết khóa học</h3>
              <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 md:p-12 flex flex-col md:flex-row gap-12">
              <div className="w-full md:w-1/2 space-y-8">
                <div>
                  <h4 className="text-xl font-bold mb-4">Nội dung chương trình</h4>
                  <ul className="space-y-3">
                    {['Chương 1: Làm quen với sáo trúc', 'Chương 2: Kỹ thuật thở cơ bản', 'Chương 3: Các nốt nhạc đầu tiên', 'Chương 4: Luyện tập nhịp điệu'].map((item, i) => (
                       <li key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                         <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-sm text-[#1a3a2a] shadow-sm">{i+1}</div>
                         <span className="font-medium">{item}</span>
                       </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="w-full md:w-1/2">
                <div className="bg-gray-50 p-8 rounded-3xl">
                  <h4 className="text-xl font-bold mb-6">Thông tin thanh toán</h4>
                  <div className="space-y-4 mb-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                      <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1a3a2a] focus:ring-1 focus:ring-[#1a3a2a] transition-all" placeholder="Nhập họ và tên..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1a3a2a] focus:ring-1 focus:ring-[#1a3a2a] transition-all" placeholder="Nhập email..." />
                    </div>
                  </div>
                  
                  <button className="w-full py-4 bg-[#1a3a2a] text-white font-bold rounded-xl hover:bg-[#2d6a4f] transition-colors shadow-lg shadow-[#1a3a2a]/20">
                    Thanh toán ngay
                  </button>
                  <p className="text-center text-sm text-gray-500 mt-4">Bằng việc đăng ký, bạn đồng ý với Điều khoản dịch vụ.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
