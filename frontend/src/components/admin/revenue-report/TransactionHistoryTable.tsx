'use client';

import { CheckCircle2, XCircle, Search, Filter } from 'lucide-react';
import { useState } from 'react';

export function TransactionHistoryTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const MOCK_TRANSACTIONS = [
    {
      id: 'TXN001',
      buyer: 'Trần Thị Mai',
      product: 'Technique Plan',
      time: '2026-03-23 14:32',
      amount: 829000,
      status: 'success',
    },
    {
      id: 'TXN002',
      buyer: 'Lê Văn Hùng',
      product: 'Thu ca (Repertoire)',
      time: '2026-03-23 13:15',
      amount: 899000,
      status: 'success',
    },
    {
      id: 'TXN003',
      buyer: 'Phạm Thu Hà',
      product: 'Technique Plan',
      time: '2026-03-23 11:08',
      amount: 829000,
      status: 'failed',
    },
    {
      id: 'TXN004',
      buyer: 'Nguyễn Văn An',
      product: 'Lý Con Sáo (Repertoire)',
      time: '2026-03-23 10:45',
      amount: 1200000,
      status: 'success',
    },
    {
      id: 'TXN005',
      buyer: 'Hoàng Thị Lan',
      product: 'Technique Plan',
      time: '2026-03-22 18:22',
      amount: 829000,
      status: 'success',
    },
  ];

  const filteredTransactions = MOCK_TRANSACTIONS.filter(txn => {
    const matchSearch = txn.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        txn.buyer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || txn.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const formatCurrency = (val: number) => {
    return val.toLocaleString('vi-VN') + 'đ';
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden mt-8">
      <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Lịch Sử Giao Dịch</h2>
          <p className="text-sm text-gray-500 mt-1">Lịch sử thanh toán chi tiết của người dùng</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Tìm mã đơn, tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#1a3a2a] w-full sm:w-64 bg-white"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#1a3a2a] bg-white appearance-none cursor-pointer w-full sm:w-40"
            >
              <option value="all">Mọi trạng thái</option>
              <option value="success">Thành công</option>
              <option value="failed">Thất bại</option>
            </select>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-[13px] text-left">
          <thead className="bg-gray-100 text-gray-600 font-medium border-b border-gray-200 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-6 py-4 font-semibold">Mã Đơn</th>
              <th className="px-6 py-4 font-semibold">Người mua</th>
              <th className="px-6 py-4 font-semibold">Sản phẩm</th>
              <th className="px-6 py-4 font-semibold">Thời gian</th>
              <th className="px-6 py-4 text-right font-semibold">Số tiền</th>
              <th className="px-6 py-4 font-semibold text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 font-semibold text-[#1a3a2a]">{row.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{row.buyer}</td>
                  <td className="px-6 py-4 text-gray-600">{row.product}</td>
                  <td className="px-6 py-4 text-gray-500">{row.time}</td>
                  <td className="px-6 py-4 text-right font-bold tabular-nums text-gray-900">{formatCurrency(row.amount)}</td>
                  <td className="px-6 py-4 text-center">
                    {row.status === 'success' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200/50">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Thành công
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200/50">
                        <XCircle className="w-3.5 h-3.5" />
                        Thất bại
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Không tìm thấy giao dịch nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-[13px]">
        <p className="text-gray-500">Hiển thị <span className="font-medium text-gray-900">{filteredTransactions.length}</span> giao dịch</p>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50" disabled>
            Trước
          </button>
          <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50" disabled>
            Tiếp
          </button>
        </div>
      </div>
    </div>
  );
}
