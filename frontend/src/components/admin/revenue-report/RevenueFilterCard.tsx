'use client';

import { Download, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';

export function RevenueFilterCard() {
  const handleExportExcel = () => {
    // Demo data for export
    const exportData = [
      {
        'Tháng': 'T1',
        'Doanh thu Foundation': 12800000,
        'Doanh thu Technique': 28400000,
        'Doanh thu Repertoire': 8200000,
        'Phí nền tảng': 492000,
        'Tổng doanh thu': 49400000,
        'Tăng trưởng (%)': 0
      },
      {
        'Tháng': 'T2',
        'Doanh thu Foundation': 14200000,
        'Doanh thu Technique': 31200000,
        'Doanh thu Repertoire': 9800000,
        'Phí nền tảng': 551000,
        'Tổng doanh thu': 55200000,
        'Tăng trưởng (%)': 8.5
      },
      // ... Add more mock data for realistic export
    ];

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DoanhThu');
    
    // Generate and download
    XLSX.writeFile(workbook, `BaoCaoDoanhThu_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 md:p-6 mb-8 flex flex-col md:flex-row gap-4 justify-between items-start md:items-end">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-auto flex-1">
        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
            Từ Ngày
          </label>
          <input
            type="date"
            defaultValue="2026-01-01"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-[13px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1a3a2a] focus:bg-white transition-all"
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
            Đến Ngày
          </label>
          <input
            type="date"
            defaultValue="2026-12-31"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-[13px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1a3a2a] focus:bg-white transition-all"
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
            Lọc Theo Sản Phẩm
          </label>
          <select className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-[13px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1a3a2a] focus:bg-white transition-all appearance-none">
            <option value="all">Tất cả sản phẩm</option>
            <option value="foundation">Foundation</option>
            <option value="technique">Technique</option>
            <option value="repertoire">Repertoire</option>
          </select>
        </div>
      </div>
      
      <div className="flex gap-3 w-full md:w-auto">
        <button className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-medium py-2 px-4 rounded-lg transition-colors">
          <Filter className="w-4 h-4" />
          <span className="hidden md:inline">Lọc Nâng Cao</span>
        </button>
        <button 
          onClick={handleExportExcel}
          className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white text-[13px] font-medium py-2 px-4 rounded-lg transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Xuất Excel
        </button>
      </div>
    </div>
  );
}
