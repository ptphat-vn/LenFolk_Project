'use client';

import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { User } from '@/types/user.types';

export function UserDeleteConfirmModal({
  user,
  onCancel,
  onConfirm,
  deleting,
}: {
  user: User;
  onCancel: () => void;
  onConfirm: () => void;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center"
      >
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-[15px] font-bold text-gray-900 mb-2">
          Xoá người dùng?
        </h3>
        <p className="text-[13px] text-gray-500 mb-6">
          Bạn có chắc muốn xoá người dùng{' '}
          <span className="font-semibold text-gray-800">{user.name}</span>? Hành
          động này không thể hoàn tác.
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
            {deleting ? 'Đang xoá...' : 'Xoá'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
