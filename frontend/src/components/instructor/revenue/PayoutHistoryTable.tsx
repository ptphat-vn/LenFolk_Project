'use client';

import { PayoutRequest } from '@/types/wallet.types';
import { DataTable, Column } from '@/common/table/DataTable';
import { CreditCard } from 'lucide-react';
import { useState } from 'react';
import { Pagination } from '@/common/pagination/pagination';

interface PayoutHistoryTableProps {
  payouts: PayoutRequest[];
  isLoading: boolean;
}

const PAGE_SIZE = 10;

function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const PayoutHistoryTable = ({ payouts, isLoading }: PayoutHistoryTableProps) => {
  const [page, setPage] = useState(1);

  const paginated = payouts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns: Column<PayoutRequest>[] = [
    {
      header: 'Số tiền',
      render: (p) => (
        <span className="text-[14px] font-bold text-gray-900">
          {p.amount.toLocaleString('vi-VN')} đ
        </span>
      ),
    },
    {
      header: 'Ngày yêu cầu',
      render: (p) => <span className="text-[13px] text-gray-500">{formatDate(p.createdAt)}</span>,
    },
    {
      header: 'Trạng thái',
      render: (p) => {
        const statusMap: Record<string, { label: string; cls: string; dot: string }> = {
          approved: { label: 'Đã duyệt', cls: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
          pending: { label: 'Đang xử lý', cls: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
          rejected: { label: 'Từ chối', cls: 'bg-red-50 text-red-600', dot: 'bg-red-500' },
        };
        const s = statusMap[p.status] || { label: p.status, cls: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' };
        
        return (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${s.cls}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
          </span>
        );
      },
    },
    {
      header: 'Thông tin nhận tiền',
      render: (p) => (
        <div className="text-[12px] text-gray-500 max-w-[200px] truncate">
          {p.bankDetails ? `${p.bankDetails.bankName} - ${p.bankDetails.accountNumber}` : '—'}
        </div>
      ),
    },
    {
      header: 'Ghi chú',
      render: (p) => (
        <span className="text-[12px] text-gray-500 max-w-[200px] truncate block" title={p.adminNote || ''}>
          {p.adminNote || '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h2 className="text-lg font-bold text-gray-900">Lịch sử rút tiền</h2>
        <span className="text-[12px] text-gray-500">{payouts.length} yêu cầu</span>
      </div>

      <DataTable
        columns={columns}
        data={paginated}
        isLoading={isLoading}
        emptyIcon={CreditCard}
        emptyMessage="Bạn chưa có yêu cầu rút tiền nào"
        keyExtractor={(p) => p._id}
      />

      {!isLoading && payouts.length > PAGE_SIZE && (
        <div className="px-5 py-2 border-t border-gray-100 bg-gray-50/50">
          <Pagination
            total={payouts.length}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            showPageSizeSelector={false}
          />
        </div>
      )}
    </div>
  );
};
