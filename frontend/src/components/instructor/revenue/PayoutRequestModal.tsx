'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreatePayoutRequestInput } from '@/types/wallet.types';
import { walletApi } from '@/lib/api/wallet.api';
import { Loader2, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { payoutRequestSchema } from '@/schema/form.schema';

function getApiErrorMessage(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('response' in error)) {
    return undefined;
  }

  const response = (error as { response?: { data?: { message?: unknown } } }).response;
  return typeof response?.data?.message === 'string'
    ? response.data.message
    : undefined;
}

interface PayoutRequestModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  maxAmount: number;
}

export const PayoutRequestModal = ({
  open,
  onClose,
  onSuccess,
  maxAmount,
}: PayoutRequestModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const schema = useMemo(() => payoutRequestSchema(maxAmount), [maxAmount]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePayoutRequestInput>({
    resolver: zodResolver(schema) as never,
    defaultValues: { amount: 0 },
  });

  const onSubmit = async (data: CreatePayoutRequestInput) => {
    setIsSubmitting(true);
    setError('');
    try {
      const res = await walletApi.createPayoutRequest(data);
      toast.success(res.message || 'Đã gửi yêu cầu rút tiền thành công');
      reset();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setError(getApiErrorMessage(err) || 'Có lỗi xảy ra khi tạo yêu cầu');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Yêu cầu rút tiền</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="flex gap-3 p-3 mb-6 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-100">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>Bạn chỉ có thể rút tiền nếu có số dư khả dụng và đã cập nhật đầy đủ thông tin ngân hàng.</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}

            <form id="payout-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Số dư khả dụng</label>
                <div className="text-2xl font-bold text-emerald-600">
                  {maxAmount.toLocaleString('vi-VN')} đ
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Số tiền muốn rút (VNĐ)</label>
                <input
                  {...register('amount', {
                    required: 'Vui lòng nhập số tiền',
                    min: { value: 50000, message: 'Số tiền tối thiểu là 50,000đ' },
                    max: { value: maxAmount, message: 'Vượt quá số dư khả dụng' },
                    valueAsNumber: true,
                  })}
                  type="number"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors outline-none font-medium text-gray-900"
                  placeholder="VD: 500000"
                />
                {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              form="payout-form"
              disabled={isSubmitting || maxAmount <= 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Gửi yêu cầu
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
