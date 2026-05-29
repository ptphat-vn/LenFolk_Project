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
  Search,
  XCircle,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
  ImageOff,
} from 'lucide-react';
import { paymentApi } from '@/lib/api/payment.api';
import { TransactionRecord, TransactionStatus } from '@/types/payment.types';

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
function ProofModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-[14px] font-semibold text-gray-900">
            Ảnh chứng minh chuyển khoản
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Proof of payment"
            className="w-full rounded-xl border border-gray-100 object-contain max-h-[60vh]"
          />
        </div>
      </motion.div>
    </div>
  );
}

// ─── Reject Modal ─────────────────────────────────────────────────────────────
function RejectModal({
  tx,
  onCancel,
  onConfirm,
  loading,
}: {
  tx: TransactionRecord;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-gray-900">
              Từ chối giao dịch
            </h3>
            <p className="text-[12px] text-gray-400 mt-0.5">
              #{tx._id.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-[12px] font-medium text-gray-700 mb-1.5">
            Lý do từ chối
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Nhập lý do từ chối (có thể để trống)..."
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 h-9 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading}
            className="flex-1 h-9 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[13px] font-medium transition-colors disabled:opacity-60"
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TransactionsPage() {
  const [txs, setTxs] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TransactionStatus | 'all'>(
    'reviewing',
  );
  const [search, setSearch] = useState('');
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
        search &&
        !t._id.includes(search) &&
        !(t.paymentMethod ?? '').toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [txs, activeTab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => setPage(1), [activeTab, search]);

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

  return (
    <motion.div
      className="p-6 space-y-6 max-w-[1400px]"
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
        <button
          onClick={fetchTxs}
          className="flex items-center gap-2 h-9 px-4 rounded-lg border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Làm mới
        </button>
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
        {/* Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = tabCounts[tab.id] ?? 0;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-3.5 text-[13px] font-medium whitespace-nowrap transition-colors ${isActive ? 'text-[#1a3a2a]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                      tab.id === 'reviewing'
                        ? 'bg-amber-100 text-amber-700'
                        : tab.id === 'success'
                          ? 'bg-emerald-100 text-emerald-700'
                          : tab.id === 'failed'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a3a2a] rounded-t" />
                )}
              </button>
            );
          })}

          {/* Search */}
          <div className="relative ml-auto self-center px-4">
            <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm..."
              className="h-8 pl-8 pr-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] bg-gray-50 w-44"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  'Mã GD',
                  'Phương thức',
                  'Số tiền',
                  'Trạng thái',
                  'Thời gian',
                  'Chứng từ',
                  'Hành động',
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-gray-100 rounded-md w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400">
                    <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-[14px]">Không có giao dịch nào</p>
                  </td>
                </tr>
              ) : (
                paginated.map((tx) => {
                  const cfg = STATUS_CONFIG[tx.status] ?? STATUS_CONFIG.pending;
                  const StatusIcon = cfg.icon;
                  const isActionable = tx.status === 'reviewing';
                  const isBusy = actionLoading === tx._id;
                  return (
                    <tr
                      key={tx._id}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-[12px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                          #{tx._id.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-[13px] font-medium text-gray-900">
                          {tx.paymentMethod ?? 'N/A'}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {tx.gatewayProvider ?? '—'}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-[14px] font-bold text-gray-900">
                          {formatCurrency(tx.amount ?? 0)}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}
                        >
                          <StatusIcon className="w-3 h-3" /> {cfg.label}
                        </span>
                        {tx.rejectReason && (
                          <p className="text-[10px] text-red-400 mt-0.5 flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" />{' '}
                            {tx.rejectReason}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-gray-400">
                        {timeAgo(tx.createdAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        {tx.proofImageUrl ? (
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
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {isActionable ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleApprove(tx)}
                              disabled={isBusy}
                              className="h-7 px-3 rounded-lg text-[12px] font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50"
                            >
                              {isBusy ? '...' : 'Duyệt'}
                            </button>
                            <button
                              onClick={() => setRejectTarget(tx)}
                              disabled={isBusy}
                              className="h-7 px-3 rounded-lg text-[12px] font-medium bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
                            >
                              Từ chối
                            </button>
                          </div>
                        ) : (
                          <span className="text-[12px] text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
            <span className="text-[12px] text-gray-400">
              Trang {page} / {totalPages} · {filtered.length} giao dịch
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Modals */}
      {proofUrl && (
        <ProofModal url={proofUrl} onClose={() => setProofUrl(null)} />
      )}
      {rejectTarget && (
        <RejectModal
          tx={rejectTarget}
          onCancel={() => setRejectTarget(null)}
          onConfirm={handleReject}
          loading={!!actionLoading}
        />
      )}
    </motion.div>
  );
}
