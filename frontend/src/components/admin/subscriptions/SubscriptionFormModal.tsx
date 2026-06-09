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
import { Performance } from '@/types/performance.types';
import { subscriptionSchema, zodFieldErrors } from '@/schema/form.schema';

type SubscriptionFormField =
  | 'name'
  | 'itemType'
  | 'courseId'
  | 'performanceId'
  | 'description'
  | 'price'
  | 'currency'
  | 'billingCycle'
  | 'features'
  | 'qrCode';
type SubscriptionFormErrors = Partial<Record<SubscriptionFormField, string>>;

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
  performances,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateSubscriptionInput, id?: string) => Promise<void>;
  editSub: Subscription | null;
  courses: Course[];
  performances: Performance[];
}) {
  const isEdit = !!editSub;
  const [form, setForm] = useState<
    Partial<CreateSubscriptionInput & { isActive: boolean }>
  >({
    name: '',
    itemType: 'course',
    courseId: '',
    performanceId: '',
    description: '',
    price: 0,
    currency: 'VND',
    billingCycle: 'monthly',
    features: [],
    qrCode: undefined,
    isActive: true,
  });
  const [featuresText, setFeaturesText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<SubscriptionFormErrors>({});

  useEffect(() => {
    if (open) {
      setError('');
      setFieldErrors({});
      if (editSub) {
        setForm({
          name: editSub.name,
          itemType: editSub.itemType ?? 'course',
          courseId: editSub.courseId ?? '',
          performanceId: editSub.performanceId ?? '',
          description: editSub.description ?? '',
          price: editSub.price,
          currency: editSub.currency ?? 'VND',
          billingCycle: editSub.billingCycle,
          features: editSub.features ?? [],
          qrCode: undefined,
          isActive: editSub.isActive ?? true,
        });
        setFeaturesText((editSub.features ?? []).join('\n'));
      } else {
        setForm({
          name: '',
          itemType: 'course',
          courseId: '',
          performanceId: '',
          description: '',
          price: 0,
          currency: 'VND',
          billingCycle: 'monthly',
          features: [],
          qrCode: undefined,
          isActive: true,
        });
        setFeaturesText('');
      }
    }
  }, [open, editSub]);

  if (!open) return null;

  const setField = <K extends keyof CreateSubscriptionInput | 'isActive'>(
    key: K,
    value: (CreateSubscriptionInput & { isActive: boolean })[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key in fieldErrors) {
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const inputClass = (field: SubscriptionFormField, extra = '') =>
    `w-full h-9 px-3 rounded-lg border text-[13px] focus:outline-none focus:ring-2 ${
      fieldErrors[field]
        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
        : 'border-gray-200 focus:border-[#2d6a4f] focus:ring-[#2d6a4f]/30'
    } ${extra}`;

  const renderFieldError = (field: SubscriptionFormField) =>
    fieldErrors[field] ? (
      <p className="mt-1 text-[11px] font-medium text-red-500">
        {fieldErrors[field]}
      </p>
    ) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    const features = featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);
    const parsed = subscriptionSchema.safeParse({
      name: form.name,
      itemType: form.itemType,
      courseId: form.courseId,
      performanceId: form.performanceId,
      description: form.description,
      price: form.price,
      currency: form.currency,
      billingCycle: form.billingCycle,
      features,
      qrCode: form.qrCode,
      isActive: form.isActive,
    });

    if (!parsed.success) {
      setFieldErrors(zodFieldErrors<SubscriptionFormField>(parsed.error));
      return;
    }

    setSaving(true);
    try {
      const body: CreateSubscriptionInput = {
        ...parsed.data,
        ...(parsed.data.itemType === 'course'
          ? { courseId: parsed.data.courseId || undefined, performanceId: undefined }
          : { performanceId: parsed.data.performanceId || undefined, courseId: undefined }),
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
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">
              Tên gói *
            </label>
            <input
              value={form.name ?? ''}
              onChange={(e) => setField('name', e.target.value)}
              required
              className={inputClass('name')}
              placeholder="VD: Gói Technique - Hàng tháng"
            />
            {renderFieldError('name')}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Loại liên kết *
              </label>
              <select
                value={form.itemType ?? 'course'}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    itemType: e.target.value as 'course' | 'performance',
                    courseId: '',
                    performanceId: '',
                  }))
                }
                required
                className={inputClass('itemType', 'bg-white')}
              >
                <option value="course">Khóa học</option>
                <option value="performance">Tiết mục biểu diễn</option>
              </select>
              {renderFieldError('itemType')}
            </div>

            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                {form.itemType === 'course' ? 'Khóa học *' : 'Tiết mục *'}
              </label>
              {form.itemType === 'course' ? (
                <>
                <select
                  value={form.courseId ?? ''}
                  onChange={(e) =>
                    setField('courseId', e.target.value)
                  }
                  required
                  className={inputClass('courseId', 'bg-white')}
                >
                  <option value="">-- Chọn khóa học --</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
                {renderFieldError('courseId')}
                </>
              ) : (
                <>
                <select
                  value={form.performanceId ?? ''}
                  onChange={(e) =>
                    setField('performanceId', e.target.value)
                  }
                  required
                  className={inputClass('performanceId', 'bg-white')}
                >
                  <option value="">-- Chọn tiết mục --</option>
                  {performances.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title}
                    </option>
                  ))}
                </select>
                {renderFieldError('performanceId')}
                </>
              )}
            </div>
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
                  setField('price', Number(e.target.value))
                }
                required
                className={inputClass('price')}
                placeholder="299000"
              />
              {renderFieldError('price')}
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Chu kỳ *
              </label>
              <select
                value={form.billingCycle ?? 'monthly'}
                onChange={(e) =>
                  setField('billingCycle', e.target.value as BillingCycle)
                }
                className={inputClass('billingCycle', 'bg-white')}
              >
                {CYCLES.map((c) => (
                  <option key={c} value={c}>
                    {CYCLE_LABEL[c]}
                  </option>
                ))}
              </select>
              {renderFieldError('billingCycle')}
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

          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">
              QR chuyển khoản
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setField('qrCode', e.target.files?.[0])}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] file:mr-3 file:rounded-md file:border-0 file:bg-[#2d6a4f]/10 file:px-3 file:py-1.5 file:text-[#2d6a4f]"
            />
            {editSub?.qrCodeUrl && (
              <p className="mt-1 truncate text-[11px] text-gray-500">
                QR hiện tại: {editSub.qrCodeUrl}
              </p>
            )}
            {renderFieldError('qrCode')}
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
