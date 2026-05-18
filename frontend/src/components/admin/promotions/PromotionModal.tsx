import { X } from 'lucide-react';

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PromotionModal({ isOpen, onClose }: PromotionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 z-10 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Tạo Mã Giảm Giá Mới</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mã Giảm Giá</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Nhập mã giảm giá..." 
                className="flex-1 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-600 text-sm"
              />
              <button className="px-4 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white">
                Tự động tạo
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Loại Giảm Giá</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-600 text-sm text-gray-700">
                <option>Chọn loại</option>
                <option>Phần trăm</option>
                <option>Cố định</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Giá Trị Giảm</label>
              <input 
                type="text" 
                placeholder="Nhập giá trị..." 
                className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-600 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Áp Dụng Cho</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-600 text-sm text-gray-700">
                <option>Chọn gói</option>
                <option>Tất cả gói</option>
                <option>Foundation</option>
                <option>Technique</option>
                <option>Repertoire</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Giới Hạn Sử Dụng</label>
              <input 
                type="text" 
                placeholder="Số lượt tối đa..." 
                className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-600 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày Bắt Đầu</label>
              <input 
                type="date" 
                className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-600 text-sm text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày Kết Thúc</label>
              <input 
                type="date" 
                className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-600 text-sm text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between gap-4 bg-white">
          <button 
            onClick={onClose}
            className="flex-1 px-4 cursor-pointer py-2.5 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white"
          >
            Hủy
          </button>
          <button 
            className="flex-1 px-4 cursor-pointer py-2.5 bg-[#1a3a2a] hover:bg-[#2d6a4f] rounded-md text-sm font-medium text-white transition-colors"
          >
            Tạo Mã
          </button>
        </div>
      </div>
    </div>
  );
}
