'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Eye,
  RefreshCw,
  XCircle,
  ImageOff,
  AlertTriangle,
} from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { ProofModal } from '@/components/admin/transactions/ProofModal';
import { TransactionRejectModal } from '@/components/admin/transactions/TransactionRejectModal';
import { RowActionsMenu } from '@/components/admin/RowActionsMenu';
import { paymentApi } from '@/lib/api/payment.api';
import { TransactionRecord, TransactionStatus } from '@/types/payment.types';
import { FilterInput } from '@/common/filter/FilterInput';
import { Tabs, TabOption } from '@/common/tabs/Tabs';
import { DataTable, Column } from '@/common/table/DataTable';
import { Pagination } from '@/common/pagination/pagination';
import { ActionButton } from '@/common/button/ActionButton';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatCurrency(n: number) {
  return n.toLocaleString('vi-VN') + ' ₫';
}
function timeAgo(d?: string) {
  if (!d) return '—';
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

const STATUS_CONFIG: Record<
  TransactionStatus,
  { label: string; cls: string; icon: React.ElementType; dot: string }
> = {
  pending: {
    label: 'Chờ xử lý',
    cls: 'bg-gray-100 text-gray-600',
    icon: Clock,
    dot: 'bg-gray-400',
  },
  reviewing: {
    label: 'Đang xét',
    cls: 'bg-amber-50 text-amber-700',
    icon: Eye,
    dot: 'bg-amber-400',
  },
  success: {
    label: 'Hoàn tất',
    cls: 'bg-emerald-50 text-emerald-700',
    icon: CheckCircle2,
    dot: 'bg-emerald-500',
  },
  failed: {
    label: 'Từ chối',
    cls: 'bg-red-50 text-red-600',
    icon: XCircle,
    dot: 'bg-red-500',
  },
  refunded: {
    label: 'Hoàn tiền',
    cls: 'bg-purple-50 text-purple-700',
    icon: RefreshCw,
    dot: 'bg-purple-500',
  },
};

const TABS: { id: TransactionStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'reviewing', label: 'Đang xét duyệt' },
  { id: 'pending', label: 'Chờ xử lý' },
  { id: 'success', label: 'Hoàn tất' },
  { id: 'failed', label: 'Từ chối' },
];

const PAGE_SIZE = 10;

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 26 },
  },
};

// ─── Proof Image Modal ────────────────────────────────────────────────────────

export default function TransactionsPage() {
  const [txs, setTxs] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TransactionStatus | 'all'>(
    'reviewing',
  );
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);

  // Action states
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<TransactionRecord | null>(
    null,
  );
  const [actionLoading, setActionLoading] = useState<string | null>(null); // tx id

  const fetchTxs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await paymentApi.getAll({ limit: 500 } as never);
      if (Array.isArray(res.data)) setTxs(res.data);
    } catch (e) {
      console.error('[Transactions] fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTxs();
  }, [fetchTxs]);

  // Stats
  const stats = useMemo(() => {
    const reviewing = txs.filter((t) => t.status === 'reviewing').length;
    const success = txs.filter((t) => t.status === 'success');
    const revenue = success.reduce((s, t) => s + (t.amount || 0), 0);
    return { total: txs.length, reviewing, success: success.length, revenue };
  }, [txs]);

  // Filtered
  const filtered = useMemo(() => {
    return txs.filter((t) => {
      if (activeTab !== 'all' && t.status !== activeTab) return false;
      if (
        debouncedSearch &&
        !t._id.includes(debouncedSearch) &&
        !(t.paymentMethod ?? '')
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase())
      )
        return false;
      return true;
    });
  }, [txs, activeTab, debouncedSearch]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => setPage(1), [activeTab, debouncedSearch]);

  // Approve
  const handleApprove = async (tx: TransactionRecord) => {
    setActionLoading(tx._id);
    try {
      await paymentApi.approve(tx._id);
      setTxs((prev) =>
        prev.map((t) =>
          t._id === tx._id
            ? { ...t, status: 'success' as TransactionStatus }
            : t,
        ),
      );
    } catch (e) {
      console.error('[Transactions] approve error:', e);
    } finally {
      setActionLoading(null);
    }
  };

  // Reject
  const handleReject = async (reason: string) => {
    if (!rejectTarget) return;
    setActionLoading(rejectTarget._id);
    try {
      await paymentApi.reject(rejectTarget._id, { rejectReason: reason });
      setTxs((prev) =>
        prev.map((t) =>
          t._id === rejectTarget._id
            ? { ...t, status: 'failed' as TransactionStatus }
            : t,
        ),
      );
      setRejectTarget(null);
    } catch (e) {
      console.error('[Transactions] reject error:', e);
    } finally {
      setActionLoading(null);
    }
  };

  const tabCounts = useMemo(() => {
    const c: Record<string, number> = { all: txs.length };
    txs.forEach((t) => {
      c[t.status] = (c[t.status] || 0) + 1;
    });
    return c;
  }, [txs]);

  const tabOptions: TabOption[] = TABS.map((tab) => ({
    id: tab.id,
    label: tab.label,
    count: tabCounts[tab.id] ?? 0,
  }));

  const getBadgeClass = (id: string) => {
    if (id === 'reviewing') return 'bg-amber-100 text-amber-700';
    if (id === 'success') return 'bg-emerald-100 text-emerald-700';
    if (id === 'failed') return 'bg-red-100 text-red-600';
    return 'bg-gray-100 text-gray-600';
  };

  const columns: Column<TransactionRecord>[] = [
    {
      header: 'Mã GD',
      render: (tx) => (
        <span className="font-mono text-[12px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
          #{tx._id.slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Phương thức',
      render: (tx) => (
        <>
          <p className="text-[13px] font-medium text-gray-900">
            {tx.paymentMethod ?? 'N/A'}
          </p>
          <p className="text-[11px] text-gray-400">
            {tx.transactionType === 'course'
              ? 'Khoá học'
              : tx.transactionType === 'performance'
                ? 'Tiết mục'
                : '—'}
          </p>
        </>
      ),
    },
    {
      header: 'Số tiền',
      render: (tx) => (
        <p className="text-[14px] font-bold text-gray-900">
          {formatCurrency(tx.amount ?? 0)}
        </p>
      ),
    },
    {
      header: 'Trạng thái',
      render: (tx) => {
        const cfg = STATUS_CONFIG[tx.status] ?? STATUS_CONFIG.pending;
        const StatusIcon = cfg.icon;
        return (
          <>
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}
            >
              <StatusIcon className="w-3 h-3" /> {cfg.label}
            </span>
            {tx.rejectReason && (
              <p className="text-[10px] text-red-400 mt-0.5 flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5" /> {tx.rejectReason}
              </p>
            )}
          </>
        );
      },
    },
    {
      header: 'Thời gian',
      render: (tx) => (
        <span className="text-[12px] text-gray-400">
          {timeAgo(tx.createdAt)}
        </span>
      ),
    },
    {
      header: 'Chứng từ',
      render: (tx) =>
        tx.proofImageUrl ? (
          <button
            onClick={() => setProofUrl(tx.proofImageUrl!)}
            className="flex items-center gap-1.5 text-[12px] text-[#2d6a4f] hover:text-[#1a3a2a] font-medium transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> Xem ảnh
          </button>
        ) : (
          <span className="flex items-center gap-1 text-[12px] text-gray-300">
            <ImageOff className="w-3.5 h-3.5" /> Chưa có
          </span>
        ),
    },
    {
      header: 'Hành động',
      className: 'text-right',
      render: (tx) => {
        const isActionable = tx.status === 'reviewing';
        const isBusy = actionLoading === tx._id;
        return (
          <div className="flex justify-end">
            <RowActionsMenu
              actions={[
                {
                  label: 'Xem chi tiết',
                  icon: Eye,
                  href: `/admin/business/transactions/${tx._id}`,
                },
                {
                  label: 'Duyệt',
                  icon: CheckCircle2,
                  hidden: !isActionable,
                  disabled: isBusy,
                  separatorBefore: true,
                  onClick: () => handleApprove(tx),
                },
                {
                  label: 'Từ chối',
                  icon: XCircle,
                  variant: 'destructive',
                  hidden: !isActionable,
                  disabled: isBusy,
                  onClick: () => setRejectTarget(tx),
                },
              ]}
            />
          </div>
        );
      },
    },
  ];

  return (
    <motion.div
      className="p-6 space-y-6 w-full"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Giao dịch thanh toán
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Xét duyệt và quản lý các giao dịch chuyển khoản
          </p>
        </div>
        <ActionButton icon={RefreshCw} variant="outline" onClick={fetchTxs}>
          Làm mới
        </ActionButton>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={item}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          {
            icon: CreditCard,
            label: 'Tổng giao dịch',
            value: stats.total,
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600',
          },
          {
            icon: Eye,
            label: 'Đang xét duyệt',
            value: stats.reviewing,
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-600',
          },
          {
            icon: CheckCircle2,
            label: 'Hoàn tất',
            value: stats.success,
            iconBg: 'bg-emerald-50',
            iconColor: 'text-[#2d6a4f]',
          },
          {
            icon: DollarSign,
            label: 'Tổng doanh thu',
            value: formatCurrency(stats.revenue),
            iconBg: 'bg-[#1a3a2a]/5',
            iconColor: 'text-[#2d6a4f]',
          },
        ].map((c) => (
          <div
            key={c.label}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg ${c.iconBg} flex items-center justify-center shrink-0`}
              >
                <c.icon className={`w-5 h-5 ${c.iconColor}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 leading-tight">
                  {c.value}
                </p>
                <p className="text-[12px] text-gray-500">{c.label}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Table Card */}
      <motion.div
        variants={item}
        className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
      >
        {/* Tabs & Search */}
        <div className="flex flex-wrap items-center justify-between border-b border-gray-100 w-full overflow-x-auto">
          <Tabs
            tabs={tabOptions}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as TransactionStatus | 'all')}
            getBadgeClass={getBadgeClass}
            className="flex-1 min-w-75"
          />
          <div className="px-4 py-2 shrink-0">
            <FilterInput
              value={search}
              onChange={setSearch}
              placeholder="Tìm kiếm..."
              className="w-44"
            />
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={paginated}
          isLoading={isLoading}
          emptyIcon={CreditCard}
          emptyMessage="Không có giao dịch nào"
          keyExtractor={(tx) => tx._id}
        />

        {/* Pagination */}
        {!isLoading && filtered.length > PAGE_SIZE && (
          <div className="px-5 py-1 border-t border-gray-100">
            <Pagination
              total={filtered.length}
              page={page}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              showPageSizeSelector={false}
            />
          </div>
        )}
      </motion.div>

      {/* Modals */}
      {proofUrl && (
        <ProofModal url={proofUrl} onClose={() => setProofUrl(null)} />
      )}
      {rejectTarget && (
        <TransactionRejectModal
          tx={rejectTarget}
          onCancel={() => setRejectTarget(null)}
          onConfirm={handleReject}
          loading={!!actionLoading}
        />
      )}
    </motion.div>
  );
}
