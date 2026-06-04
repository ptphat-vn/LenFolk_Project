'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BankDetails } from '@/types/wallet.types';
import { walletApi } from '@/lib/api/wallet.api';
import { Loader2, Building, User, CreditCard, Save } from 'lucide-react';
import { bankInfoSchema } from '@/schema/form.schema';

function getApiErrorMessage(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('response' in error)) {
    return undefined;
  }

  const response = (error as { response?: { data?: { message?: unknown } } }).response;
  return typeof response?.data?.message === 'string'
    ? response.data.message
    : undefined;
}

export const BankInfoForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BankDetails>({
    resolver: zodResolver(bankInfoSchema),
    defaultValues: {
      bankName: '',
      accountName: '',
      accountNumber: '',
    },
  });

  const onSubmit = async (data: BankDetails) => {
    setIsSubmitting(true);
    setError('');
    try {
      const res = await walletApi.updateBankInfo(data);
      toast.success(res.message || 'Cập nhật thông tin ngân hàng thành công');
    } catch (err: unknown) {
      console.error(err);
      setError(getApiErrorMessage(err) || 'Có lỗi xảy ra khi cập nhật');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-1">Thông tin ngân hàng</h2>
      <p className="text-sm text-gray-500 mb-6">
        Cập nhật thông tin tài khoản để nhận thanh toán rút tiền.
      </p>


      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Ngân hàng</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building className="h-4 w-4 text-gray-400" />
            </div>
            <input
              {...register('bankName', { required: 'Vui lòng nhập tên ngân hàng' })}
              type="text"
              className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors outline-none"
              placeholder="VD: Vietcombank, Techcombank..."
            />
          </div>
          {errors.bankName && <p className="text-xs text-red-500">{errors.bankName.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Tên chủ tài khoản</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-gray-400" />
            </div>
            <input
              {...register('accountName', { required: 'Vui lòng nhập tên chủ tài khoản' })}
              type="text"
              className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors outline-none uppercase"
              placeholder="VD: NGUYEN VAN A"
            />
          </div>
          {errors.accountName && <p className="text-xs text-red-500">{errors.accountName.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Số tài khoản</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CreditCard className="h-4 w-4 text-gray-400" />
            </div>
            <input
              {...register('accountNumber', { required: 'Vui lòng nhập số tài khoản' })}
              type="text"
              className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors outline-none"
              placeholder="VD: 1903..."
            />
          </div>
          {errors.accountNumber && <p className="text-xs text-red-500">{errors.accountNumber.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 mt-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Lưu thay đổi
        </button>
      </form>
    </div>
  );
};
