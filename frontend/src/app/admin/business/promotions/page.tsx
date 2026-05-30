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
import { FilterInput } from '@/common/filter/FilterInput';
import { FilterSelect } from '@/common/filter/FilterSelect';
import { DataTable, Column } from '@/common/table/DataTable';
import { Pagination } from '@/common/pagination/pagination';
import { ActionButton } from '@/common/button/ActionButton';
import { useDebounce } from '@/hooks/useDebounce';

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
  const debouncedSearch = useDebounce(search, 500);
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
        if (debouncedSearch && !c.code.toLowerCase().includes(debouncedSearch.toLowerCase()))
          return false;
        if (statusFilter === 'active' && (!c.isActive || isExpired(c.validTo)))
          return false;
        if (statusFilter === 'inactive' && c.isActive) return false;
        if (statusFilter === 'expired' && !isExpired(c.validTo)) return false;
        return true;
      }),
    [coupons, debouncedSearch, statusFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => {
    const timeout = setTimeout(() => setPage(1), 0);
    return () => clearTimeout(timeout);
  }, [debouncedSearch, statusFilter]);

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

  const columns: Column<Coupon>[] = [
    {
      header: 'Mã coupon',
      render: (coupon) => (
        <span className="font-mono text-[13px] font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
          {coupon.code}
        </span>
      ),
    },
    {
      header: 'Giảm giá',
      render: (coupon) => (
        <span
          className={`text-[13px] font-bold ${coupon.discountType === 'percent' ? 'text-[#2d6a4f]' : 'text-blue-600'}`}
        >
          {coupon.discountType === 'percent'
            ? `-${coupon.discountValue}%`
            : `-${coupon.discountValue.toLocaleString('vi-VN')} ₫`}
        </span>
      ),
    },
    {
      header: 'Áp dụng',
      render: (coupon) => (
        <span className="text-[12px] text-gray-600">
          {APPLICABLE_LABEL[coupon.applicableTo]}
        </span>
      ),
    },
    {
      header: 'Lượt dùng',
      render: (coupon) => (
        <>
          <div className="text-[13px] text-gray-900">
            {coupon.usedCount}
            {coupon.maxUses ? (
              <span className="text-gray-400"> / {coupon.maxUses}</span>
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
        </>
      ),
    },
    {
      header: 'Hiệu lực',
      render: (coupon) => (
        <span className="text-[12px] text-gray-500">
          <span>{formatDate(coupon.validFrom)}</span>
          {coupon.validTo && (
            <span className="text-gray-300">
              {' '}
              → {formatDate(coupon.validTo)}
            </span>
          )}
        </span>
      ),
    },
    {
      header: 'Trạng thái',
      render: (coupon) => <CouponStatus coupon={coupon} />,
    },
    {
      header: 'Hành động',
      className: 'text-right',
      render: (coupon) => (
        <div className="flex items-center justify-end gap-1">
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
            Mã giảm giá & Khuyến mãi
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Quản lý toàn bộ coupon trên nền tảng
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ActionButton icon={RefreshCw} variant="outline" onClick={fetchCoupons}>
            Làm mới
          </ActionButton>
          <ActionButton
            icon={Plus}
            onClick={() => {
              setEditTarget(null);
              setFormOpen(true);
            }}
          >
            Tạo mã mới
          </ActionButton>
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
          <FilterInput
            value={search}
            onChange={setSearch}
            placeholder="Tìm theo mã coupon..."
            className="flex-1 min-w-48"
          />
          <FilterSelect
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as 'all' | 'active' | 'inactive' | 'expired')}
            options={[
              { value: 'active', label: 'Đang hoạt động' },
              { value: 'inactive', label: 'Đã tắt' },
              { value: 'expired', label: 'Hết hạn' },
            ]}
            placeholder="Tất cả trạng thái"
            className="w-40"
          />
          <span className="text-[12px] text-gray-400 ml-auto">
            {filtered.length} mã
          </span>
        </div>

        <DataTable
          columns={columns}
          data={paginated}
          isLoading={isLoading}
          emptyIcon={Tag}
          emptyMessage="Không có mã coupon nào"
          keyExtractor={(c) => c._id}
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
