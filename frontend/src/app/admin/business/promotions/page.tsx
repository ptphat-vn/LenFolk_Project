'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import {
  Plus,
  Tag,
  Search,
  Filter,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { couponApi } from '@/lib/api/coupon.api';
import {
  Coupon,
  CreateCouponInput,
  CouponApplicableTo,
} from '@/types/coupon.types';
import { CouponStatus } from '@/components/admin/promotions/CouponStatus';
import { CouponFormModal } from '@/components/admin/promotions/CouponFormModal';
import { CouponDeleteConfirmModal } from '@/components/admin/promotions/CouponDeleteConfirmModal';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
function isExpired(validTo?: string | null) {
  if (!validTo) return false;
  return new Date(validTo) < new Date();
}
function isNotStarted(validFrom: string) {
  return new Date(validFrom) > new Date();
}

const APPLICABLE_LABEL: Record<CouponApplicableTo, string> = {
  subscription: 'Gói đăng ký',
  course: 'Khoá học',
  all: 'Tất cả',
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PromotionsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive' | 'expired'
  >('all');
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCoupons = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await couponApi.getAll();
      if (Array.isArray(res.data)) setCoupons(res.data);
    } catch (e) {
      console.error('[Promotions] fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchCoupons(), 0);
    return () => clearTimeout(timeout);
  }, [fetchCoupons]);

  // Stats
  const stats = useMemo(
    () => ({
      total: coupons.length,
      active: coupons.filter((c) => c.isActive && !isExpired(c.validTo)).length,
      totalUsed: coupons.reduce((a, c) => a + c.usedCount, 0),
    }),
    [coupons],
  );

  // Filtered
  const filtered = useMemo(
    () =>
      coupons.filter((c) => {
        if (search && !c.code.toLowerCase().includes(search.toLowerCase()))
          return false;
        if (statusFilter === 'active' && (!c.isActive || isExpired(c.validTo)))
          return false;
        if (statusFilter === 'inactive' && c.isActive) return false;
        if (statusFilter === 'expired' && !isExpired(c.validTo)) return false;
        return true;
      }),
    [coupons, search, statusFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => {
    const timeout = setTimeout(() => setPage(1), 0);
    return () => clearTimeout(timeout);
  }, [search, statusFilter]);

  const handleSave = async (data: CreateCouponInput, id?: string) => {
    if (id) {
      await couponApi.update(id, data);
    } else {
      await couponApi.create(data);
    }
    await fetchCoupons();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await couponApi.delete(deleteTarget._id);
      setCoupons((prev) => prev.filter((c) => c._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (e) {
      console.error('[Promotions] delete error:', e);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggle = async (coupon: Coupon) => {
    try {
      await couponApi.update(coupon._id, { isActive: !coupon.isActive });
      setCoupons((prev) =>
        prev.map((c) =>
          c._id === coupon._id ? { ...c, isActive: !c.isActive } : c,
        ),
      );
    } catch (e) {
      console.error('[Promotions] toggle error:', e);
    }
  };

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
            Mã giảm giá & Khuyến mãi
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Quản lý toàn bộ coupon trên nền tảng
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCoupons}
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Làm mới
          </button>
          <button
            onClick={() => {
              setEditTarget(null);
              setFormOpen(true);
            }}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white text-[13px] font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Tạo mã mới
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          {
            icon: Tag,
            label: 'Tổng mã coupon',
            value: stats.total,
            iconBg: 'bg-violet-50',
            iconColor: 'text-violet-600',
          },
          {
            icon: CheckCircle2,
            label: 'Đang hoạt động',
            value: stats.active,
            iconBg: 'bg-emerald-50',
            iconColor: 'text-[#2d6a4f]',
          },
          {
            icon: Tag,
            label: 'Tổng lượt sử dụng',
            value: stats.totalUsed,
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-600',
          },
        ].map((c) => (
          <div
            key={c.label}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg ${c.iconBg} flex items-center justify-center`}
              >
                <c.icon className={`w-5 h-5 ${c.iconColor}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{c.value}</p>
                <p className="text-[12px] text-gray-500">{c.label}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Table */}
      <motion.div
        variants={item}
        className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
      >
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1 min-w-50">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mã coupon..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] bg-gray-50"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as typeof statusFilter)
              }
              className="h-9 px-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] bg-white"
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã tắt</option>
              <option value="expired">Hết hạn</option>
            </select>
          </div>
          <span className="text-[12px] text-gray-400 ml-auto">
            {filtered.length} mã
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  'Mã coupon',
                  'Giảm giá',
                  'Áp dụng',
                  'Lượt dùng',
                  'Hiệu lực',
                  'Trạng thái',
                  '',
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
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-3.5">
                        <div className="h-4 bg-gray-100 rounded w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-14 text-gray-400">
                    <Tag className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-[14px]">Không có mã coupon nào</p>
                  </td>
                </tr>
              ) : (
                paginated.map((coupon) => (
                  <tr
                    key={coupon._id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[13px] font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-[13px] font-bold ${coupon.discountType === 'percent' ? 'text-[#2d6a4f]' : 'text-blue-600'}`}
                      >
                        {coupon.discountType === 'percent'
                          ? `-${coupon.discountValue}%`
                          : `-${coupon.discountValue.toLocaleString('vi-VN')} ₫`}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[12px] text-gray-600">
                        {APPLICABLE_LABEL[coupon.applicableTo]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-[13px] text-gray-900">
                        {coupon.usedCount}
                        {coupon.maxUses ? (
                          <span className="text-gray-400">
                            {' '}
                            / {coupon.maxUses}
                          </span>
                        ) : (
                          <span className="text-gray-400"> / ∞</span>
                        )}
                      </div>
                      {coupon.maxUses && (
                        <div className="mt-1 h-1 bg-gray-100 rounded-full w-16 overflow-hidden">
                          <div
                            className="h-full bg-[#2d6a4f] rounded-full"
                            style={{
                              width: `${Math.min(100, (coupon.usedCount / coupon.maxUses) * 100)}%`,
                            }}
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-gray-500">
                      <span>{formatDate(coupon.validFrom)}</span>
                      {coupon.validTo && (
                        <span className="text-gray-300">
                          {' '}
                          → {formatDate(coupon.validTo)}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <CouponStatus coupon={coupon} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditTarget(coupon);
                            setFormOpen(true);
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggle(coupon)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors"
                        >
                          {coupon.isActive ? (
                            <ToggleLeft className="w-3.5 h-3.5" />
                          ) : (
                            <ToggleRight className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(coupon)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
            <span className="text-[12px] text-gray-400">
              Trang {page}/{totalPages} · {filtered.length} mã
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

      {/* Modals */}
      <CouponFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        editCoupon={editTarget}
      />
      {deleteTarget && (
        <CouponDeleteConfirmModal
          coupon={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </motion.div>
  );
}
