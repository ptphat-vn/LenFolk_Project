'use client';

import { Coupon } from '@/types/coupon.types';

function isExpired(validTo?: string | null) {
  if (!validTo) return false;
  return new Date(validTo) < new Date();
}

function isNotStarted(validFrom: string) {
  return new Date(validFrom) > new Date();
}

export function CouponStatus({ coupon }: { coupon: Coupon }) {
  if (!coupon.isActive)
    return (
      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
        Tắt
      </span>
    );
  if (isExpired(coupon.validTo))
    return (
      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-500">
        Hết hạn
      </span>
    );
  if (isNotStarted(coupon.validFrom))
    return (
      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
        Chưa bắt đầu
      </span>
    );
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses)
    return (
      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
        Đã dùng hết
      </span>
    );
  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
      Đang hoạt động
    </span>
  );
}
