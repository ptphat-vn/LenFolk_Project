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
} from 'lucide-react';
import { paymentApi } from '@/lib/api/payment.api';
import { TransactionRecord, TransactionStatus } from '@/types/payment.types';
import { RevenueChart } from '@/components/admin/dashboard/RevenueChart';
import { FilterSelect } from '@/common/filter/FilterSelect';
import { DataTable, Column } from '@/common/table/DataTable';
import { Pagination } from '@/common/pagination/pagination';
import { ActionButton } from '@/common/button/ActionButton';

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

// Doanh thu theo từng ngày trong 1 tháng (year, month 0-based) — đơn vị: triệu VND
function getDailyRevenue(
  payments: TransactionRecord[],
  year: number,
  month: number,
) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totals = new Array<number>(daysInMonth).fill(0);
  payments
    .filter((p) => p.status === 'success')
    .forEach((p) => {
      if (!p.paidAt && !p.createdAt) return;
      const d = new Date(p.paidAt || p.createdAt!);
      if (d.getFullYear() === year && d.getMonth() === month) {
        totals[d.getDate() - 1] += p.amount || 0;
      }
    });
  return totals.map((total, i) => ({
    month: String(i + 1),
    revenue: parseFloat((total / 1_000_000).toFixed(2)),
  }));
}

// "YYYY-MM" của tháng hiện tại, dùng làm giá trị mặc định cho ô chọn tháng
function currentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

const STATUS_CONFIG: Record<
  TransactionStatus,
  { label: string; cls: string; icon: React.ElementType }
> = {
  pending: {
    label: 'Chờ thanh toán',
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
  const [revenueMonth, setRevenueMonth] = useState(currentMonthValue);
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

  const [revYear, revMonth] = useMemo(() => {
    const [y, m] = revenueMonth.split('-').map(Number);
    return [y, m - 1] as const;
  }, [revenueMonth]);
  const chartData = useMemo(
    () => getDailyRevenue(txs, revYear, revMonth),
    [txs, revYear, revMonth],
  );
  const monthRevenue = useMemo(
    () =>
      txs
        .filter((t) => {
          if (t.status !== 'success' || (!t.paidAt && !t.createdAt)) return false;
          const d = new Date(t.paidAt || t.createdAt!);
          return d.getFullYear() === revYear && d.getMonth() === revMonth;
        })
        .reduce((sum, t) => sum + (t.amount || 0), 0),
    [txs, revYear, revMonth],
  );
  const revenuePeriodLabel = `${String(revMonth + 1).padStart(2, '0')}/${revYear}`;

  const filtered = useMemo(
    () =>
      statusFilter === 'all'
        ? txs
        : txs.filter((t) => t.status === statusFilter),
    [txs, statusFilter],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const filteredTotal = useMemo(
    () => filtered.reduce((sum, t) => sum + (t.amount ?? 0), 0),
    [filtered],
  );
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => setPage(1), [statusFilter]);

  const isGrowthPositive = stats.growthRate >= 0;

  const columns: Column<TransactionRecord>[] = [
    {
      header: 'Mã giao dịch',
      render: (tx) => (
        <span className="font-mono text-[12px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
          #{tx._id.slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Phương thức',
      render: (tx) => (
        <span className="text-[13px] text-gray-700">{tx.paymentMethod ?? '—'}</span>
      ),
    },
    {
      header: 'Loại',
      render: (tx) => (
        <span className="text-[13px] text-gray-500">
          {tx.transactionType === 'course'
            ? 'Khóa học'
            : tx.transactionType === 'performance'
              ? 'Tiết mục'
              : '—'}
        </span>
      ),
    },
    {
      header: 'Số tiền',
      render: (tx) => (
        <span className="text-[13px] font-bold text-gray-900">
          {formatCurrency(tx.amount ?? 0)}
        </span>
      ),
    },
    {
      header: 'Trạng thái',
      render: (tx) => {
        const cfg = STATUS_CONFIG[tx.status] ?? STATUS_CONFIG.pending;
        const StatusIcon = cfg.icon;
        return (
          <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}
          >
            <StatusIcon className="w-3 h-3" /> {cfg.label}
          </span>
        );
      },
    },
    {
      header: 'Thời gian',
      render: (tx) => (
        <span className="text-[12px] text-gray-400">
          {formatDateTime(tx.paidAt || tx.createdAt)}
        </span>
      ),
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
            Doanh thu & Báo cáo
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Phân tích doanh thu và lịch sử giao dịch
          </p>
        </div>
        <ActionButton icon={RefreshCw} variant="outline" onClick={fetchTxs}>
          Làm mới
        </ActionButton>
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
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#2d6a4f]" />
              Doanh thu trong tháng
            </h2>
            <p className="text-[12px] text-gray-400 mt-0.5">
              Theo từng ngày (đơn vị: triệu VND)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="month"
              value={revenueMonth}
              onChange={(e) => setRevenueMonth(e.target.value)}
              className="h-9 rounded-lg border border-gray-200 px-3 text-[13px] text-gray-700 outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20"
            />
            <div className="text-right">
              <p className="text-lg font-bold text-[#2d6a4f]">
                {formatCurrency(monthRevenue)}
              </p>
              <p className="text-[11px] text-gray-400">Doanh thu tháng {revenuePeriodLabel}</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          {isLoading ? (
            <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />
          ) : monthRevenue > 0 ? (
            <RevenueChart data={chartData} periodLabel={revenuePeriodLabel} />
          ) : (
            <p className="text-center py-12 text-[13px] text-gray-400">
              Chưa có doanh thu trong tháng {revenuePeriodLabel}
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
          <div className="flex items-baseline gap-3">
            <h2 className="text-[14px] font-semibold text-gray-900">
              Lịch sử giao dịch
            </h2>
            <span className="text-[12px] text-gray-400">
              {filtered.length} giao dịch · Tổng:{' '}
              <span className="font-semibold text-[#2d6a4f]">
                {formatCurrency(filteredTotal)}
              </span>
            </span>
          </div>
          <FilterSelect
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as typeof statusFilter)}
            options={[
              { value: 'success', label: 'Hoàn tất' },
              { value: 'pending', label: 'Chờ thanh toán' },
              { value: 'failed', label: 'Thất bại' },
              { value: 'refunded', label: 'Hoàn tiền' },
            ]}
            placeholder="Tất cả trạng thái"
            className="w-40"
          />
        </div>

        <DataTable
          columns={columns}
          data={paginated}
          isLoading={isLoading}
          emptyIcon={CreditCard}
          emptyMessage="Không có giao dịch nào"
          keyExtractor={(t) => t._id}
          indexOffset={(page - 1) * PAGE_SIZE}
          footer={
            <tr>
              <td colSpan={4} className="px-5 py-3.5 text-right text-[12px] font-semibold uppercase tracking-wider text-gray-500">
                Tổng cộng ({filtered.length.toLocaleString('vi-VN')} giao dịch)
              </td>
              <td className="px-5 py-3.5 text-[14px] font-bold text-[#2d6a4f]">
                {filteredTotal.toLocaleString('vi-VN')} ₫
              </td>
              <td colSpan={2} />
            </tr>
          }
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
    </motion.div>
  );
}
