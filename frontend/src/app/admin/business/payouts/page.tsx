'use client';

import { useCallback, useEffect, useState } from 'react';
import { PayoutRequest } from '@/types/wallet.types';
import { walletApi } from '@/lib/api/wallet.api';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search,
  Wallet,
  Building,
  CreditCard
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

 const fetchPayouts = useCallback(async () => {
  try {
    setLoading(true);
    const res = await walletApi.getAllPayouts();
    setPayouts(res.data || []);
  } catch (error) {
    console.error('Failed to fetch payouts', error);
    toast.error('Lỗi khi tải dữ liệu yêu cầu rút tiền');
  } finally {
    setLoading(false);
  }
}, []);

useEffect(() => {
  fetchPayouts();
}, [fetchPayouts]);

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    try {
      setIsProcessing(id);
      await walletApi.reviewPayout(id, { status });
      toast.success(status === 'approved' ? 'Đã duyệt yêu cầu rút tiền' : 'Đã từ chối yêu cầu rút tiền');
      fetchPayouts(); // refresh list
    } catch (error) {
      console.error('Failed to review payout', error);
      toast.error('Lỗi khi cập nhật trạng thái yêu cầu');
    } finally {
      setIsProcessing(null);
    }
  };

  const filteredPayouts = payouts.filter((p) => {
    const searchLower = search.toLowerCase();
    return (
      p.instructorId.toLowerCase().includes(searchLower) ||
      p.bankDetails?.accountName.toLowerCase().includes(searchLower) ||
      p.bankDetails?.bankName.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đã duyệt
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5" />
            Từ chối
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Chờ duyệt
          </span>
        );
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-[#2d6a4f]" />
            Yêu cầu rút tiền
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý các yêu cầu rút tiền từ ví của giảng viên
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo ID, Tên TK, Ngân hàng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="px-6 py-4">Mã yêu cầu</th>
                <th className="px-6 py-4">Giảng viên (ID)</th>
                <th className="px-6 py-4">Số tiền rút</th>
                <th className="px-6 py-4">Thông tin ngân hàng</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Ngày tạo</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-[#2d6a4f] border-t-transparent rounded-full animate-spin mb-4" />
                      <p>Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredPayouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Wallet className="w-12 h-12 text-gray-300 mb-3" />
                      <p>Không có yêu cầu rút tiền nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayouts.map((payout) => (
                  <tr key={payout._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-gray-500">{payout._id.substring(0, 8)}...</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{payout.instructorId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-[#2d6a4f]">
                        {formatCurrency(payout.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {payout.bankDetails ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-900">
                            <Building className="w-3.5 h-3.5 text-gray-400" />
                            {payout.bankDetails.bankName}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                            {payout.bankDetails.accountNumber}
                          </div>
                          <div className="text-xs text-gray-500 ml-5">
                            {payout.bankDetails.accountName}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Không có thông tin</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(payout.status)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {payout.createdAt ? new Date(payout.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {payout.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleReview(payout._id, 'approved')}
                            disabled={isProcessing === payout._id}
                            className="px-3 py-1.5 text-xs font-medium bg-[#1a3a2a] text-white hover:bg-[#2d6a4f] rounded-lg transition-colors disabled:opacity-50"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => handleReview(payout._id, 'rejected')}
                            disabled={isProcessing === payout._id}
                            className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                          >
                            Từ chối
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Đã xử lý</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
