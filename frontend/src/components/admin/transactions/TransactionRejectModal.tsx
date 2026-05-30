'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';
import { TransactionRecord } from '@/types/payment.types';

export function TransactionRejectModal({
  tx,
  onCancel,
  onConfirm,
  loading,
}: {
  tx: TransactionRecord;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-gray-900">
              Từ chối giao dịch
            </h3>
            <p className="text-[12px] text-gray-400 mt-0.5">
              #{tx._id.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-[12px] font-medium text-gray-700 mb-1.5">
            Lý do từ chối
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Nhập lý do từ chối (có thể để trống)..."
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 h-9 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading}
            className="flex-1 h-9 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[13px] font-medium transition-colors disabled:opacity-60"
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
