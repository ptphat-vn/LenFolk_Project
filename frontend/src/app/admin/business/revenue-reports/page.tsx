'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  CreditCard,
  DollarSign,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { paymentApi } from '@/lib/api/payment.api';
import { TransactionRecord, TransactionStatus } from '@/types/payment.types';
import { RevenueChart } from '@/components/admin/dashboard/RevenueChart';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatCurrency(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B ₫`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M ₫`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K ₫`;
  return `${n.toLocaleString('vi-VN')} ₫`;
}
function formatDateTime(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getMonthlyRevenue(payments: TransactionRecord[]) {
  const map: Record<string, number> = {};
  const monthNames = [
    'T1',
    'T2',
    'T3',
    'T4',
    'T5',
    'T6',
    'T7',
    'T8',
    'T9',
    'T10',
    'T11',
    'T12',
  ];
  payments
    .filter((p) => p.status === 'success')
    .forEach((p) => {
      const d = new Date(p.paidAt || p.createdAt!);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
      map[key] = (map[key] || 0) + (p.amount || 0);
    });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, total]) => {
      const [, month] = key.split('-');
      return {
        month: monthNames[Number(month)],
        revenue: parseFloat((total / 1_000_000).toFixed(2)),
      };
    });
}

const STATUS_CONFIG: Record<
  TransactionStatus,
  { label: string; cls: string; icon: React.ElementType }
> = {
  pending: {
    label: 'Chờ xử lý',
    cls: 'bg-gray-100 text-gray-600',
    icon: Clock,
  },
  reviewing: {
    label: 'Đang xét',
    cls: 'bg-amber-50 text-amber-700',
    icon: Clock,
  },
  success: {
    label: 'Hoàn tất',
    cls: 'bg-emerald-50 text-emerald-700',
    icon: CheckCircle2,
  },
  failed: { label: 'Từ chối', cls: 'bg-red-50 text-red-600', icon: XCircle },
  refunded: {
    label: 'Hoàn tiền',
    cls: 'bg-purple-50 text-purple-700',
    icon: RefreshCw,
  },
};

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

export default function RevenueReportsPage() {
  const [txs, setTxs] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>(
    'all',
  );
  const [page, setPage] = useState(1);

  const fetchTxs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await paymentApi.getAll({ limit: 500 } as never);
      if (Array.isArray(res.data)) setTxs(res.data);
    } catch (e) {
      console.error('[Revenue] fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTxs();
  }, [fetchTxs]);

  // Stats
  const stats = useMemo(() => {
    const success = txs.filter((t) => t.status === 'success');
    const thisMonth = success.filter((t) => {
      const d = new Date(t.paidAt || t.createdAt!);
      const now = new Date();
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    });
    const lastMonth = success.filter((t) => {
      const d = new Date(t.paidAt || t.createdAt!);
      const now = new Date();
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return (
        d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear()
      );
    });
    const totalRevenue = success.reduce((a, t) => a + (t.amount || 0), 0);
    const thisMonthRevenue = thisMonth.reduce((a, t) => a + (t.amount || 0), 0);
    const lastMonthRevenue = lastMonth.reduce((a, t) => a + (t.amount || 0), 0);
    const avgOrder = success.length > 0 ? totalRevenue / success.length : 0;
    const growthRate =
      lastMonthRevenue > 0
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;
    return {
      totalRevenue,
      totalTxs: txs.length,
      successTxs: success.length,
      thisMonthRevenue,
      lastMonthRevenue,
      avgOrder,
      growthRate,
    };
  }, [txs]);

  const chartData = useMemo(() => getMonthlyRevenue(txs), [txs]);

  const filtered = useMemo(
    () =>
      statusFilter === 'all'
        ? txs
        : txs.filter((t) => t.status === statusFilter),
    [txs, statusFilter],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => setPage(1), [statusFilter]);

  const isGrowthPositive = stats.growthRate >= 0;

  return (
    <motion.div
      className="p-6 space-y-6 max-w-350"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Doanh thu & Báo cáo
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Phân tích doanh thu và lịch sử giao dịch
          </p>
        </div>
        <button
          onClick={fetchTxs}
          className="flex items-center gap-2 h-9 px-4 rounded-lg border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Làm mới
        </button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        variants={item}
        className="grid grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-[0.08] transition-opacity">
            <DollarSign className="w-20 h-20" />
          </div>
          <div
            className={`w-10 h-10 rounded-lg bg-[#1a3a2a]/10 flex items-center justify-center text-[#1a3a2a] mb-3`}
          >
            <DollarSign className="w-5 h-5" />
          </div>
          <p className="text-[12px] text-gray-500 font-medium">
            Tổng doanh thu
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5">
            {isLoading ? '—' : formatCurrency(stats.totalRevenue)}
          </p>
          {!isLoading && (
            <p
              className={`flex items-center gap-1 text-[12px] font-medium mt-1 ${isGrowthPositive ? 'text-emerald-600' : 'text-red-500'}`}
            >
              {isGrowthPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {Math.abs(stats.growthRate).toFixed(1)}% so với tháng trước
            </p>
          )}
        </div>

        {/* This month */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-[0.08] transition-opacity">
            <TrendingUp className="w-20 h-20" />
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-[12px] text-gray-500 font-medium">Tháng này</p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5">
            {isLoading ? '—' : formatCurrency(stats.thisMonthRevenue)}
          </p>
          <p className="text-[12px] text-gray-400 mt-1">
            {isLoading
              ? ''
              : `Tháng trước: ${formatCurrency(stats.lastMonthRevenue)}`}
          </p>
        </div>

        {/* Total transactions */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-[0.08] transition-opacity">
            <CreditCard className="w-20 h-20" />
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 mb-3">
            <CreditCard className="w-5 h-5" />
          </div>
          <p className="text-[12px] text-gray-500 font-medium">Giao dịch</p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5">
            {isLoading ? '—' : stats.totalTxs.toLocaleString('vi-VN')}
          </p>
          <p className="text-[12px] text-gray-400 mt-1">
            {isLoading ? '' : `${stats.successTxs} hoàn tất`}
          </p>
        </div>

        {/* Avg order value */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-[0.08] transition-opacity">
            <BarChart2 className="w-20 h-20" />
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 mb-3">
            <BarChart2 className="w-5 h-5" />
          </div>
          <p className="text-[12px] text-gray-500 font-medium">
            Giá trị đơn TB
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5">
            {isLoading ? '—' : formatCurrency(Math.round(stats.avgOrder))}
          </p>
          <p className="text-[12px] text-gray-400 mt-1">
            Trên mỗi giao dịch thành công
          </p>
        </div>
      </motion.div>

      {/* Revenue Chart */}
      <motion.div
        variants={item}
        className="bg-white border border-gray-200 rounded-xl shadow-sm"
      >
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#2d6a4f]" />
              Doanh thu theo tháng
            </h2>
            <p className="text-[12px] text-gray-400 mt-0.5">
              6 tháng gần nhất (đơn vị: triệu VND)
            </p>
          </div>
          <p className="text-lg font-bold text-[#2d6a4f]">
            {formatCurrency(stats.totalRevenue)}
          </p>
        </div>
        <div className="p-5">
          {isLoading ? (
            <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />
          ) : chartData.length > 0 ? (
            <RevenueChart data={chartData} />
          ) : (
            <p className="text-center py-12 text-[13px] text-gray-400">
              Chưa có dữ liệu doanh thu
            </p>
          )}
        </div>
      </motion.div>

      {/* Transaction History */}
      <motion.div
        variants={item}
        className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-[14px] font-semibold text-gray-900">
            Lịch sử giao dịch
          </h2>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as typeof statusFilter)
              }
              className="h-8 px-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] bg-white"
            >
              <option value="all">Tất cả</option>
              <option value="success">Hoàn tất</option>
              <option value="reviewing">Đang xét</option>
              <option value="pending">Chờ xử lý</option>
              <option value="failed">Từ chối</option>
              <option value="refunded">Hoàn tiền</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  'Mã giao dịch',
                  'Phương thức',
                  'Cổng thanh toán',
                  'Số tiền',
                  'Trạng thái',
                  'Thời gian',
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
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-5 py-3.5">
                          <div className="h-4 bg-gray-100 rounded w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                : paginated.map((tx) => {
                    const cfg =
                      STATUS_CONFIG[tx.status] ?? STATUS_CONFIG.pending;
                    const StatusIcon = cfg.icon;
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
                        <td className="px-5 py-3.5 text-[13px] text-gray-700">
                          {tx.paymentMethod ?? '—'}
                        </td>
                        <td className="px-5 py-3.5 text-[13px] text-gray-500">
                          {tx.gatewayProvider ?? '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-[13px] font-bold text-gray-900">
                            {formatCurrency(tx.amount ?? 0)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}
                          >
                            <StatusIcon className="w-3 h-3" /> {cfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[12px] text-gray-400">
                          {formatDateTime(tx.paidAt || tx.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
              {!isLoading && paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <p className="text-[14px]">Không có giao dịch nào</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
            <span className="text-[12px] text-gray-400">
              Trang {page}/{totalPages} · {filtered.length} giao dịch
            </span>
            <div className="flex gap-1">
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
    </motion.div>
  );
}
