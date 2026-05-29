'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import {
  Plus,
  Zap,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { subscriptionApi } from '@/lib/api/subscription.api';
import {
  Subscription,
  CreateSubscriptionInput,
  BillingCycle,
} from '@/types/subscription.types';
import { courseApi } from '@/lib/api/course.api';
import { Course } from '@/types/course.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatCurrency(n: number) {
  if (n === 0) return 'Miễn phí';
  return n.toLocaleString('vi-VN') + ' ₫';
}
function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const CYCLE_LABEL: Record<BillingCycle, string> = {
  monthly: 'Hàng tháng',
  quarterly: 'Hàng quý',
  yearly: 'Hàng năm',
};
const CYCLES: BillingCycle[] = ['monthly', 'quarterly', 'yearly'];

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

// ─── Subscription Form Modal ──────────────────────────────────────────────────
function SubscriptionFormModal({
  open,
  onClose,
  onSave,
  editSub,
  courses,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateSubscriptionInput, id?: string) => Promise<void>;
  editSub: Subscription | null;
  courses: Course[];
}) {
  const isEdit = !!editSub;
  const [form, setForm] = useState<
    Partial<CreateSubscriptionInput & { isActive: boolean }>
  >({
    name: '',
    courseId: '',
    description: '',
    price: 0,
    currency: 'VND',
    billingCycle: 'monthly',
    features: [],
    isActive: true,
  });
  const [featuresText, setFeaturesText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setError('');
      if (editSub) {
        setForm({
          name: editSub.name,
          courseId: editSub.courseId ?? '',
          description: editSub.description ?? '',
          price: editSub.price,
          currency: editSub.currency ?? 'VND',
          billingCycle: editSub.billingCycle,
          features: editSub.features ?? [],
          isActive: editSub.isActive ?? true,
        });
        setFeaturesText((editSub.features ?? []).join('\n'));
      } else {
        setForm({
          name: '',
          courseId: '',
          description: '',
          price: 0,
          currency: 'VND',
          billingCycle: 'monthly',
          features: [],
          isActive: true,
        });
        setFeaturesText('');
      }
    }
  }, [open, editSub]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const features = featuresText
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);
      const body: CreateSubscriptionInput = {
        name: form.name!,
        courseId: form.courseId!,
        description: form.description,
        price: Number(form.price),
        currency: form.currency,
        billingCycle: form.billingCycle!,
        features,
        isActive: form.isActive,
      };
      await onSave(body, editSub?._id);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-[15px] font-bold text-gray-900">
            {isEdit ? 'Chỉnh sửa gói' : 'Tạo gói đăng ký mới'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">
              Tên gói *
            </label>
            <input
              value={form.name ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f]"
              placeholder="VD: Gói Technique - Hàng tháng"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">
              Khoá học liên kết *
            </label>
            <select
              value={form.courseId ?? ''}
              onChange={(e) =>
                setForm((p) => ({ ...p, courseId: e.target.value }))
              }
              required
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] bg-white"
            >
              <option value="">-- Chọn khoá học --</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              value={form.description ?? ''}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f]"
              placeholder="Mô tả ngắn về gói..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Giá (VND) *
              </label>
              <input
                type="number"
                min={0}
                value={form.price ?? 0}
                onChange={(e) =>
                  setForm((p) => ({ ...p, price: Number(e.target.value) }))
                }
                required
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f]"
                placeholder="299000"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Chu kỳ *
              </label>
              <select
                value={form.billingCycle ?? 'monthly'}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    billingCycle: e.target.value as BillingCycle,
                  }))
                }
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] bg-white"
              >
                {CYCLES.map((c) => (
                  <option key={c} value={c}>
                    {CYCLE_LABEL[c]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">
              Tính năng (mỗi dòng một tính năng)
            </label>
            <textarea
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] font-mono"
              placeholder={
                'Truy cập tất cả bài học\nLuyện tập với AI\nChứng chỉ hoàn thành'
              }
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
            >
              {form.isActive ? (
                <ToggleRight className="w-8 h-8 text-[#2d6a4f]" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-gray-400" />
              )}
            </button>
            <span className="text-[13px] text-gray-700">
              Gói đang <strong>{form.isActive ? 'kích hoạt' : 'tắt'}</strong>
            </span>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-[12px] text-red-600">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-9 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-9 rounded-lg bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white text-[13px] font-medium transition-colors disabled:opacity-60"
            >
              {saving ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo gói'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Delete Confirm ────────────────────────────────────────────────────────────
function DeleteConfirmModal({
  sub,
  onCancel,
  onConfirm,
  deleting,
}: {
  sub: Subscription;
  onCancel: () => void;
  onConfirm: () => void;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-gray-900">
              Xóa gói đăng ký
            </h3>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Hành động này không thể hoàn tác
            </p>
          </div>
        </div>
        <p className="text-[13px] text-gray-600 mb-5">
          Xóa gói <strong>{sub.name}</strong>?
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 h-9 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 h-9 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[13px] font-medium transition-colors disabled:opacity-60"
          >
            {deleting ? 'Đang xóa...' : 'Xóa'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({
  sub,
  onEdit,
  onDelete,
  onToggle,
}: {
  sub: Subscription;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  return (
    <motion.div
      variants={item}
      className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* Card top accent */}
      <div
        className={`h-1 ${sub.isActive ? 'bg-linear-to-r from-[#2d6a4f] to-emerald-400' : 'bg-gray-200'}`}
      />
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-[14px] font-bold text-gray-900 truncate">
                {sub.name}
              </h3>
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${sub.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}
              >
                {sub.isActive ? 'Hoạt động' : 'Tắt'}
              </span>
            </div>
            <p className="text-[12px] text-gray-500">
              {sub.description || 'Không có mô tả'}
            </p>
          </div>
        </div>

        {/* Price & Cycle */}
        <div className="flex items-center justify-between py-3 border-y border-gray-100 mb-3">
          <div>
            <p className="text-2xl font-bold text-[#1a3a2a]">
              {formatCurrency(sub.price)}
            </p>
            <p className="text-[11px] text-gray-400">
              {CYCLE_LABEL[sub.billingCycle]}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-gray-500">Ngày tạo</p>
            <p className="text-[12px] font-medium text-gray-700">
              {formatDate(sub.createdAt)}
            </p>
          </div>
        </div>

        {/* Features */}
        {sub.features && sub.features.length > 0 && (
          <ul className="space-y-1.5 mb-4">
            {sub.features.slice(0, 4).map((f, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-[12px] text-gray-600"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2d6a4f] shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
            {sub.features.length > 4 && (
              <li className="text-[11px] text-gray-400 pl-5">
                +{sub.features.length - 4} tính năng khác
              </li>
            )}
          </ul>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" /> Sửa
          </button>
          <button
            onClick={onToggle}
            className={`flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg border text-[12px] font-medium transition-colors ${sub.isActive ? 'border-amber-200 text-amber-600 hover:bg-amber-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}
          >
            {sub.isActive ? (
              <ToggleLeft className="w-3.5 h-3.5" />
            ) : (
              <ToggleRight className="w-3.5 h-3.5" />
            )}
            {sub.isActive ? 'Tắt' : 'Bật'}
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg border border-red-100 text-[12px] font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Subscription | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subscription | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [subsRes, coursesRes] = await Promise.allSettled([
        subscriptionApi.getAll(),
        courseApi.getAll({ limit: 200 }),
      ]);
      if (subsRes.status === 'fulfilled' && Array.isArray(subsRes.value.data))
        setSubs(subsRes.value.data);
      if (
        coursesRes.status === 'fulfilled' &&
        Array.isArray(coursesRes.value.data)
      )
        setCourses(coursesRes.value.data);
    } catch (e) {
      console.error('[Subscriptions] fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const stats = useMemo(
    () => ({
      total: subs.length,
      active: subs.filter((s) => s.isActive).length,
      totalRevenue: subs.reduce((a, s) => a + s.price, 0),
    }),
    [subs],
  );

  const handleSave = async (data: CreateSubscriptionInput, id?: string) => {
    if (id) {
      await subscriptionApi.update(id, data);
    } else {
      await subscriptionApi.create(data);
    }
    await fetchAll();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await subscriptionApi.delete(deleteTarget._id);
      setSubs((prev) => prev.filter((s) => s._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (e) {
      console.error('[Subscriptions] delete error:', e);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggle = async (sub: Subscription) => {
    try {
      await subscriptionApi.update(sub._id, { isActive: !sub.isActive });
      setSubs((prev) =>
        prev.map((s) =>
          s._id === sub._id ? { ...s, isActive: !s.isActive } : s,
        ),
      );
    } catch (e) {
      console.error('[Subscriptions] toggle error:', e);
    }
  };

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
          <h1 className="text-xl font-bold text-gray-900">Gói đăng ký</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Quản lý các gói subscription của nền tảng
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAll}
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
            <Plus className="w-4 h-4" /> Tạo gói mới
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
            icon: Zap,
            label: 'Tổng gói',
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
            icon: DollarSign,
            label: 'Tổng giá trị/kỳ',
            value: formatCurrency(stats.totalRevenue),
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
                className={`w-10 h-10 rounded-lg ${c.iconBg} flex items-center justify-center shrink-0`}
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

      {/* Plans Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm animate-pulse"
            >
              <div className="h-5 bg-gray-100 rounded w-2/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-5" />
              <div className="h-8 bg-gray-100 rounded w-1/3 mb-5" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-3 bg-gray-100 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : subs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Zap className="w-12 h-12 mb-3 opacity-20" />
          <p className="text-[15px] font-medium">Chưa có gói đăng ký nào</p>
          <p className="text-[13px] mt-1">
            Nhấn &quot;Tạo gói mới&quot; để bắt đầu
          </p>
        </div>
      ) : (
        <motion.div
          variants={container}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {subs.map((sub) => (
            <PlanCard
              key={sub._id}
              sub={sub}
              onEdit={() => {
                setEditTarget(sub);
                setFormOpen(true);
              }}
              onDelete={() => setDeleteTarget(sub)}
              onToggle={() => handleToggle(sub)}
            />
          ))}
        </motion.div>
      )}

      {/* Modals */}
      <SubscriptionFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        editSub={editTarget}
        courses={courses}
      />
      {deleteTarget && (
        <DeleteConfirmModal
          sub={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </motion.div>
  );
}
