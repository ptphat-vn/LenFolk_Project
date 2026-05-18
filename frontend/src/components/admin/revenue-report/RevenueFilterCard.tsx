import { Download } from 'lucide-react';

export function RevenueFilterCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Từ Ngày
          </label>
          <input
            type="date"
            defaultValue="2026-01-01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1a3a2a] focus:border-[#1a3a2a]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Đến Ngày
          </label>
          <input
            type="date"
            defaultValue="2026-12-31"
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1a3a2a] focus:border-[#1a3a2a]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Xuất Bởi
          </label>
          <input
            type="text"
            defaultValue="Vu Len (Manager)"
            disabled
            className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mã Quản Lý
          </label>
          <input
            type="text"
            defaultValue="MGR-001"
            disabled
            className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ghi Chú
        </label>
        <textarea
          rows={2}
          placeholder="Thêm ghi chú cho báo cáo này..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1a3a2a] focus:border-[#1a3a2a] resize-none"
        ></textarea>
      </div>
      <div className="flex justify-end">
        <button className="flex items-center cursor-pointer gap-2 bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white font-medium py-2 px-4 rounded-md transition-colors">
          <Download className="w-4 h-4" />
          Xuất Excel
        </button>
      </div>
    </div>
  );
}
