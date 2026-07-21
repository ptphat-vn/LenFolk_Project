'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ToggleLeft, ToggleRight, X, AlertTriangle } from 'lucide-react';
import {
  Coupon,
  CreateCouponInput,
  DiscountType,
  CouponApplicableTo,
} from '@/types/coupon.types';
import { couponSchema, zodFieldErrors } from '@/schema/form.schema';

type CouponFormField =
  | 'code'
  | 'discountType'
  | 'discountValue'
  | 'maxUses'
  | 'validFrom'
  | 'validTo'
  | 'applicableTo';
type CouponFormErrors = Partial<Record<CouponFormField, string>>;

export function CouponFormModal({
  open,
  onClose,
  onSave,
  editCoupon,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateCouponInput, id?: string) => Promise<void>;
  editCoupon: Coupon | null;
}) {
  const isEdit = !!editCoupon;
  const [form, setForm] = useState<Partial<CreateCouponInput>>({
    code: '',
    discountType: 'percent',
    discountValue: 10,
    maxUses: null,
    validFrom: new Date().toISOString().slice(0, 10),
    validTo: null,
    isActive: true,
    applicableTo: 'all',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<CouponFormErrors>({});

  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => {
        setError('');
        setFieldErrors({});
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
            code: '',
            discountType: 'percent',
            discountValue: 10,
            maxUses: null,
            validFrom: new Date().toISOString().slice(0, 10),
            validTo: null,
            isActive: true,
            applicableTo: 'all',
          });
        }
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [open, editCoupon]);

  if (!open) return null;

  const setField = <K extends keyof CreateCouponInput>(
    key: K,
    value: CreateCouponInput[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key in fieldErrors) {
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const inputClass = (field: CouponFormField, extra = '') =>
    `w-full h-9 px-3 rounded-lg border text-[13px] focus:outline-none focus:ring-2 ${
      fieldErrors[field]
        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
        : 'border-gray-200 focus:border-[#2d6a4f] focus:ring-[#2d6a4f]/30'
    } ${extra}`;

  const renderFieldError = (field: CouponFormField) =>
    fieldErrors[field] ? (
      <p className="mt-1 text-[11px] font-medium text-red-500">
        {fieldErrors[field]}
      </p>
    ) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    const parsed = couponSchema.safeParse({
      code: form.code,
      discountType: form.discountType,
      discountValue: form.discountValue,
      maxUses: form.maxUses,
      validFrom: form.validFrom,
      validTo: form.validTo,
      isActive: form.isActive,
      applicableTo: form.applicableTo,
    });

    if (!parsed.success) {
      setFieldErrors(zodFieldErrors<CouponFormField>(parsed.error));
      return;
    }

    setSaving(true);
    try {
      const body: CreateCouponInput = {
        ...parsed.data,
        validFrom: new Date(parsed.data.validFrom).toISOString(),
        validTo: parsed.data.validTo ? new Date(parsed.data.validTo).toISOString() : null,
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 sm:px-6">
          <h2 className="text-[15px] font-bold text-gray-900">
            {isEdit ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá mới'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate className="p-4 space-y-4 sm:p-6">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">
              Mã coupon *
            </label>
            <input
              value={form.code ?? ''}
              onChange={(e) => setField('code', e.target.value.toUpperCase())}
              required
              className={inputClass('code', 'font-mono uppercase')}
              placeholder="SALE20"
            />
            {renderFieldError('code')}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Loại giảm giá
              </label>
              <select
                value={form.discountType ?? 'percent'}
                onChange={(e) =>
                  setField('discountType', e.target.value as DiscountType)
                }
                className={inputClass('discountType', 'bg-white')}
              >
                <option value="percent">Phần trăm (%)</option>
                <option value="fixed">Cố định (VND)</option>
              </select>
              {renderFieldError('discountType')}
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Giá trị {form.discountType === 'percent' ? '(%)' : '(VND)'}
              </label>
              <input
                type="number"
                min={0}
                value={form.discountValue ?? ''}
                onChange={(e) =>
                  setField('discountValue', Number(e.target.value))
                }
                required
                className={inputClass('discountValue')}
                placeholder={form.discountType === 'percent' ? '10' : '50000'}
              />
              {renderFieldError('discountValue')}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Ngày bắt đầu *
              </label>
              <input
                type="date"
                value={form.validFrom ?? ''}
                onChange={(e) =>
                  setField('validFrom', e.target.value)
                }
                required
                className={inputClass('validFrom')}
              />
              {renderFieldError('validFrom')}
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Ngày hết hạn
              </label>
              <input
                type="date"
                value={form.validTo ?? ''}
                onChange={(e) =>
                  setField('validTo', e.target.value || null)
                }
                className={inputClass('validTo')}
              />
              {renderFieldError('validTo')}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Giới hạn lượt dùng
              </label>
              <input
                type="number"
                min={0}
                value={form.maxUses ?? ''}
                onChange={(e) =>
                  setField('maxUses', e.target.value ? Number(e.target.value) : null)
                }
                className={inputClass('maxUses')}
                placeholder="Không giới hạn"
              />
              {renderFieldError('maxUses')}
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Áp dụng cho
              </label>
              <select
                value={form.applicableTo ?? 'all'}
                onChange={(e) =>
                  setField('applicableTo', e.target.value as CouponApplicableTo)
                }
                className={inputClass('applicableTo', 'bg-white')}
              >
                <option value="all">Tất cả</option>
                <option value="course">Khoá học</option>
                <option value="performance">Tiết mục</option>
              </select>
              {renderFieldError('applicableTo')}
            </div>
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
              Mã đang <strong>{form.isActive ? 'kích hoạt' : 'tắt'}</strong>
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
              {saving ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo mã'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
