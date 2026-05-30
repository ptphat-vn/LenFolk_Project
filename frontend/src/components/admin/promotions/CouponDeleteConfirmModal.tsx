'use client';

import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Coupon } from '@/types/coupon.types';

export function CouponDeleteConfirmModal({
  coupon,
  onCancel,
  onConfirm,
  deleting,
}: {
  coupon: Coupon;
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
              Xóa mã giảm giá
            </h3>
            <p className="text-[12px] text-gray-500">
              Hành động này không thể hoàn tác
            </p>
          </div>
        </div>
        <p className="text-[13px] text-gray-600 mb-5">
          Xóa mã <strong className="font-mono">{coupon.code}</strong>?
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
