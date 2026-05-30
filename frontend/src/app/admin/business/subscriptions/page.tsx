'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { Plus, Zap, DollarSign, CheckCircle2, RefreshCw } from 'lucide-react';
import { SubscriptionFormModal } from '@/components/admin/subscriptions/SubscriptionFormModal';
import { SubscriptionDeleteConfirmModal } from '@/components/admin/subscriptions/SubscriptionDeleteConfirmModal';
import { PlanCard } from '@/components/admin/subscriptions/PlanCard';
import { subscriptionApi } from '@/lib/api/subscription.api';
import {
  Subscription,
  CreateSubscriptionInput,
  BillingCycle,
} from '@/types/subscription.types';
import { courseApi } from '@/lib/api/course.api';
import { Course } from '@/types/course.types';
import { ActionButton } from '@/common/button/ActionButton';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatCurrency(n: number) {
  if (n === 0) return 'Miễn phí';
  return n.toLocaleString('vi-VN') + ' ₫';
}

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
      className="p-6 space-y-6 w-full"
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
          <ActionButton icon={RefreshCw} variant="outline" onClick={fetchAll}>
            Làm mới
          </ActionButton>
          <ActionButton
            icon={Plus}
            onClick={() => {
              setEditTarget(null);
              setFormOpen(true);
            }}
          >
            Tạo gói mới
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
        <SubscriptionDeleteConfirmModal
          sub={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </motion.div>
  );
}
