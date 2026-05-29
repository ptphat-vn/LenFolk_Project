'use client';

import { motion, Variants } from 'framer-motion';
import {
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
} from 'lucide-react';
import { Subscription, BillingCycle } from '@/types/subscription.types';

const CYCLE_LABEL: Record<BillingCycle, string> = {
  monthly: 'Hàng tháng',
  quarterly: 'Hàng quý',
  yearly: 'Hàng năm',
};

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

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 26 },
  },
};

export function PlanCard({
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
