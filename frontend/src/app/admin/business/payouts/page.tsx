'use client';

import { useCallback, useEffect, useState } from 'react';
import { PayoutRequest } from '@/types/wallet.types';
import { walletApi } from '@/lib/api/wallet.api';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Wallet,
  Building,
  CreditCard,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { FilterInput } from '@/common/filter/FilterInput';
import { DataTable, Column } from '@/common/table/DataTable';
import { Pagination } from '@/common/pagination/pagination';
import { ActionButton } from '@/common/button/ActionButton';
import { RowActionsMenu, RowAction } from '@/components/admin/RowActionsMenu';
import { useDebounce } from '@/hooks/useDebounce';

function instructorLabel(p: PayoutRequest): string {
  if (typeof p.instructorId === 'object' && p.instructorId)
    return p.instructorId.name || p.instructorId.email || p.instructorId._id || '—';
  return String(p.instructorId ?? '—');
}

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

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
    const searchLower = debouncedSearch.toLowerCase();
    return (
      instructorLabel(p).toLowerCase().includes(searchLower) ||
      p.bankDetails?.accountName.toLowerCase().includes(searchLower) ||
      p.bankDetails?.bankName.toLowerCase().includes(searchLower)
    );
  });

  const paginated = filteredPayouts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [debouncedSearch]);

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

  const columns: Column<PayoutRequest>[] = [
    {
      header: 'Mã yêu cầu',
      render: (payout) => (
        <span className="font-mono text-[12px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
          {payout._id.substring(0, 8)}...
        </span>
      ),
    },
    {
      header: 'Giảng viên',
      render: (payout) => (
        <span className="font-medium text-[13px] text-gray-900">{instructorLabel(payout)}</span>
      ),
    },
    {
      header: 'Số tiền rút',
      render: (payout) => (
        <span className="font-bold text-[13px] text-[#2d6a4f]">
          {formatCurrency(payout.amount)}
        </span>
      ),
    },
    {
      header: 'Thông tin ngân hàng',
      render: (payout) =>
        payout.bankDetails ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-gray-900">
              <Building className="w-3.5 h-3.5 text-gray-400" />
              {payout.bankDetails.bankName}
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
              <CreditCard className="w-3.5 h-3.5 text-gray-400" />
              {payout.bankDetails.accountNumber}
            </div>
            <div className="text-[12px] text-gray-500 ml-5">
              {payout.bankDetails.accountName}
            </div>
          </div>
        ) : (
          <span className="text-gray-400 italic text-[12px]">Không có thông tin</span>
        ),
    },
    {
      header: 'Trạng thái',
      render: (payout) => getStatusBadge(payout.status),
    },
    {
      header: 'Ngày tạo',
      render: (payout) => (
        <span className="text-[12px] text-gray-500">
          {payout.createdAt ? new Date(payout.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Thao tác',
      className: 'text-right',
      render: (payout) => {
        const actions: RowAction[] = [
          {
            label: 'Xem chi tiết',
            icon: Eye,
            href: `/admin/business/payouts/${payout._id}`,
          },
          {
            label: 'Duyệt',
            icon: CheckCircle2,
            hidden: payout.status !== 'pending',
            disabled: isProcessing === payout._id,
            onClick: () => handleReview(payout._id, 'approved'),
            separatorBefore: true,
          },
          {
            label: 'Từ chối',
            icon: XCircle,
            variant: 'destructive',
            hidden: payout.status !== 'pending',
            disabled: isProcessing === payout._id,
            onClick: () => handleReview(payout._id, 'rejected'),
          },
        ];
        return (
          <div className="flex justify-end">
            <RowActionsMenu actions={actions} />
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-5 w-full">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#2d6a4f]" />
            Yêu cầu rút tiền
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Quản lý các yêu cầu rút tiền từ ví của giảng viên
          </p>
        </div>
        <ActionButton icon={RefreshCw} variant="outline" onClick={fetchPayouts} className="w-full sm:w-auto justify-center">
          Làm mới
        </ActionButton>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center gap-3">
        <FilterInput
          value={search}
          onChange={setSearch}
          placeholder="Tìm kiếm theo ID, Tên TK, Ngân hàng..."
          className="w-full sm:flex-1 sm:max-w-sm"
        />
        <span className="w-full sm:w-auto text-[12px] text-gray-400 sm:ml-auto">
          {filteredPayouts.length} yêu cầu
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={paginated}
          isLoading={loading}
          emptyIcon={Wallet}
          emptyMessage="Không có yêu cầu rút tiền nào"
          keyExtractor={(p) => p._id}
          indexOffset={(page - 1) * PAGE_SIZE}
        />
        
        {!loading && filteredPayouts.length > PAGE_SIZE && (
          <div className="px-5 py-1 border-t border-gray-100">
            <Pagination
              total={filteredPayouts.length}
              page={page}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              showPageSizeSelector={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
