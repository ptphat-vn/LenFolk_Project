'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ToggleLeft, ToggleRight, X, AlertTriangle } from 'lucide-react';
import {
  Subscription,
  CreateSubscriptionInput,
  BillingCycle,
} from '@/types/subscription.types';
import { Course } from '@/types/course.types';

const CYCLE_LABEL: Record<BillingCycle, string> = {
  monthly: 'Hàng tháng',
  quarterly: 'Hàng quý',
  yearly: 'Hàng năm',
};
const CYCLES: BillingCycle[] = ['monthly', 'quarterly', 'yearly'];

export function SubscriptionFormModal({
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
