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
  X,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { couponApi } from '@/lib/api/coupon.api';
import { Coupon, CreateCouponInput, DiscountType, CouponApplicableTo } from '@/types/coupon.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
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

const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item: Variants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } } };

// ─── Coupon Status ────────────────────────────────────────────────────────────
function CouponStatus({ coupon }: { coupon: Coupon }) {
  if (!coupon.isActive) return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Tắt</span>;
  if (isExpired(coupon.validTo)) return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-500">Hết hạn</span>;
  if (isNotStarted(coupon.validFrom)) return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">Chưa bắt đầu</span>;
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">Đã dùng hết</span>;
  return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Đang hoạt động</span>;
}

// ─── Coupon Form Modal ────────────────────────────────────────────────────────
function CouponFormModal({
  open, onClose, onSave, editCoupon,
}: {
  open: boolean; onClose: () => void;
  onSave: (data: CreateCouponInput, id?: string) => Promise<void>;
  editCoupon: Coupon | null;
}) {
  const isEdit = !!editCoupon;
  const [form, setForm] = useState<Partial<CreateCouponInput>>({
    code: '', discountType: 'percent', discountValue: 10, maxUses: null,
    validFrom: new Date().toISOString().slice(0, 10),
    validTo: null, isActive: true, applicableTo: 'all',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => {
        setError('');
        if (editCoupon) {
          setForm({
            code: editCoupon.code,
            discountType: editCoupon.discountType,
            discountValue: editCoupon.discountValue,
            maxUses: editCoupon.maxUses ?? null,
            validFrom: editCoupon.validFrom.slice(0, 10),
            validTo: editCoupon.validTo?.slice(0, 10) ?? null,
            isActive: editCoupon.isActive,
            applicableTo: editCoupon.applicableTo,
          });
        } else {
          setForm({
            code: '', discountType: 'percent', discountValue: 10, maxUses: null,
            validFrom: new Date().toISOString().slice(0, 10),
            validTo: null, isActive: true, applicableTo: 'all',
          });
        }
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [open, editCoupon]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const body: CreateCouponInput = {
        code: form.code!.trim().toUpperCase(),
        discountType: form.discountType!,
        discountValue: Number(form.discountValue),
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        validFrom: new Date(form.validFrom!).toISOString(),
        validTo: form.validTo ? new Date(form.validTo).toISOString() : null,
        isActive: form.isActive,
        applicableTo: form.applicableTo,
      };
      await onSave(body, editCoupon?._id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-bold text-gray-900">{isEdit ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá mới'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">Mã coupon *</label>
            <input value={form.code ?? ''} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} required
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-[13px] font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f]"
              placeholder="SALE20" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">Loại giảm giá</label>
              <select value={form.discountType ?? 'percent'} onChange={e => setForm(p => ({ ...p, discountType: e.target.value as DiscountType }))}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] bg-white">
                <option value="percent">Phần trăm (%)</option>
                <option value="fixed">Cố định (VND)</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Giá trị {form.discountType === 'percent' ? '(%)' : '(VND)'}
              </label>
              <input type="number" min={0} value={form.discountValue ?? ''} onChange={e => setForm(p => ({ ...p, discountValue: Number(e.target.value) }))} required
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f]"
                placeholder={form.discountType === 'percent' ? '10' : '50000'} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">Ngày bắt đầu *</label>
              <input type="date" value={form.validFrom ?? ''} onChange={e => setForm(p => ({ ...p, validFrom: e.target.value }))} required
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f]" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">Ngày hết hạn</label>
              <input type="date" value={form.validTo ?? ''} onChange={e => setForm(p => ({ ...p, validTo: e.target.value || null }))}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">Giới hạn lượt dùng</label>
              <input type="number" min={0} value={form.maxUses ?? ''} onChange={e => setForm(p => ({ ...p, maxUses: e.target.value ? Number(e.target.value) : null }))}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f]"
                placeholder="Không giới hạn" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">Áp dụng cho</label>
              <select value={form.applicableTo ?? 'all'} onChange={e => setForm(p => ({ ...p, applicableTo: e.target.value as CouponApplicableTo }))}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] bg-white">
                <option value="all">Tất cả</option>
                <option value="subscription">Gói đăng ký</option>
                <option value="course">Khoá học</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}>
              {form.isActive ? <ToggleRight className="w-8 h-8 text-[#2d6a4f]" /> : <ToggleLeft className="w-8 h-8 text-gray-400" />}
            </button>
            <span className="text-[13px] text-gray-700">Mã đang <strong>{form.isActive ? 'kích hoạt' : 'tắt'}</strong></span>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-[12px] text-red-600">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 h-9 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">Hủy</button>
            <button type="submit" disabled={saving}
              className="flex-1 h-9 rounded-lg bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white text-[13px] font-medium transition-colors disabled:opacity-60">
              {saving ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo mã'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Delete Confirm ────────────────────────────────────────────────────────────
function DeleteConfirmModal({ coupon, onCancel, onConfirm, deleting }: {
  coupon: Coupon; onCancel: () => void; onConfirm: () => void; deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-gray-900">Xóa mã giảm giá</h3>
            <p className="text-[12px] text-gray-500">Hành động này không thể hoàn tác</p>
          </div>
        </div>
        <p className="text-[13px] text-gray-600 mb-5">Xóa mã <strong className="font-mono">{coupon.code}</strong>?</p>
        <div className="flex gap-2">
          <button onClick={onCancel}
            className="flex-1 h-9 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">Hủy</button>
          <button onClick={onConfirm} disabled={deleting}
            className="flex-1 h-9 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[13px] font-medium transition-colors disabled:opacity-60">
            {deleting ? 'Đang xóa...' : 'Xóa'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PromotionsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
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
  const stats = useMemo(() => ({
    total: coupons.length,
    active: coupons.filter(c => c.isActive && !isExpired(c.validTo)).length,
    totalUsed: coupons.reduce((a, c) => a + c.usedCount, 0),
  }), [coupons]);

  // Filtered
  const filtered = useMemo(() => coupons.filter(c => {
    if (search && !c.code.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter === 'active' && (!c.isActive || isExpired(c.validTo))) return false;
    if (statusFilter === 'inactive' && c.isActive) return false;
    if (statusFilter === 'expired' && !isExpired(c.validTo)) return false;
    return true;
  }), [coupons, search, statusFilter]);

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
      setCoupons(prev => prev.filter(c => c._id !== deleteTarget._id));
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
      setCoupons(prev => prev.map(c => c._id === coupon._id ? { ...c, isActive: !c.isActive } : c));
    } catch (e) {
      console.error('[Promotions] toggle error:', e);
    }
  };

  return (
    <motion.div className="p-6 space-y-6 max-w-[1400px]" variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Mã giảm giá & Khuyến mãi</h1>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý toàn bộ coupon trên nền tảng</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchCoupons}
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Làm mới
          </button>
          <button onClick={() => { setEditTarget(null); setFormOpen(true); }}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white text-[13px] font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Tạo mã mới
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Tag,          label: 'Tổng mã coupon',    value: stats.total,     iconBg: 'bg-violet-50',  iconColor: 'text-violet-600' },
          { icon: CheckCircle2, label: 'Đang hoạt động',    value: stats.active,    iconBg: 'bg-emerald-50', iconColor: 'text-[#2d6a4f]' },
          { icon: Tag,          label: 'Tổng lượt sử dụng', value: stats.totalUsed, iconBg: 'bg-amber-50',   iconColor: 'text-amber-600' },
        ].map(c => (
          <div key={c.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${c.iconBg} flex items-center justify-center`}>
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
      <motion.div variants={item} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo mã coupon..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] bg-gray-50" />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
              className="h-9 px-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] bg-white">
              <option value="all">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã tắt</option>
              <option value="expired">Hết hạn</option>
            </select>
          </div>
          <span className="text-[12px] text-gray-400 ml-auto">{filtered.length} mã</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Mã coupon', 'Giảm giá', 'Áp dụng', 'Lượt dùng', 'Hiệu lực', 'Trạng thái', ''].map(h => (
                  <th key={h} className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-5 py-3.5"><div className="h-4 bg-gray-100 rounded w-20" /></td>)}
                    </tr>
                  ))
                : paginated.length === 0
                  ? (
                    <tr>
                      <td colSpan={7} className="text-center py-14 text-gray-400">
                        <Tag className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p className="text-[14px]">Không có mã coupon nào</p>
                      </td>
                    </tr>
                  )
                  : paginated.map(coupon => (
                      <tr key={coupon._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-[13px] font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{coupon.code}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[13px] font-bold ${coupon.discountType === 'percent' ? 'text-[#2d6a4f]' : 'text-blue-600'}`}>
                            {coupon.discountType === 'percent'
                              ? `-${coupon.discountValue}%`
                              : `-${coupon.discountValue.toLocaleString('vi-VN')} ₫`}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-[12px] text-gray-600">{APPLICABLE_LABEL[coupon.applicableTo]}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-[13px] text-gray-900">
                            {coupon.usedCount}
                            {coupon.maxUses ? <span className="text-gray-400"> / {coupon.maxUses}</span> : <span className="text-gray-400"> / ∞</span>}
                          </div>
                          {coupon.maxUses && (
                            <div className="mt-1 h-1 bg-gray-100 rounded-full w-16 overflow-hidden">
                              <div className="h-full bg-[#2d6a4f] rounded-full" style={{ width: `${Math.min(100, (coupon.usedCount / coupon.maxUses) * 100)}%` }} />
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-[12px] text-gray-500">
                          <span>{formatDate(coupon.validFrom)}</span>
                          {coupon.validTo && <span className="text-gray-300"> → {formatDate(coupon.validTo)}</span>}
                        </td>
                        <td className="px-5 py-3.5"><CouponStatus coupon={coupon} /></td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1">
                            <button onClick={() => { setEditTarget(coupon); setFormOpen(true); }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleToggle(coupon)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors">
                              {coupon.isActive ? <ToggleLeft className="w-3.5 h-3.5" /> : <ToggleRight className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => setDeleteTarget(coupon)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
            <span className="text-[12px] text-gray-400">Trang {page}/{totalPages} · {filtered.length} mã</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <CouponFormModal open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} editCoupon={editTarget} />
      {deleteTarget && <DeleteConfirmModal coupon={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} deleting={deleting} />}
    </motion.div>
  );
}
