'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Ticket,
  Percent,
  Tag,
  Layers,
  CalendarClock,
  Users,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { couponApi } from '@/lib/api/coupon.api';
import { Coupon, CouponApplicableTo } from '@/types/coupon.types';
import { ActionButton } from '@/common/button/ActionButton';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
};

const APPLICABLE_LABEL: Record<CouponApplicableTo, string> = {
  course: 'Khoá học',
  performance: 'Tiết mục',
  all: 'Tất cả',
};

function formatDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleString('vi-VN');
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Ticket;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center text-[14px]">
      <span className="text-gray-500 flex items-center gap-2">
        <Icon className="w-4 h-4" /> {label}
      </span>
      <span className="font-semibold text-gray-900">{children}</span>
    </div>
  );
}

export default function CouponDetailPage() {
  const params = useParams();
  const router = useRouter();
  const couponId = params.id as string;

  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCoupon = useCallback(async () => {
    try {
      setLoading(true);
      const res = await couponApi.getById(couponId);
      setCoupon(res.data || null);
    } catch {
      toast.error('Lỗi khi tải mã giảm giá');
    } finally {
      setLoading(false);
    }
  }, [couponId]);

  useEffect(() => {
    if (couponId) fetchCoupon();
  }, [fetchCoupon, couponId]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-[#2d6a4f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Không tìm thấy mã giảm giá</h2>
        <ActionButton icon={ArrowLeft} onClick={() => router.back()}>
          Quay lại
        </ActionButton>
      </div>
    );
  }

  const now = new Date();
  const expired = coupon.validTo ? new Date(coupon.validTo) < now : false;
  const notStarted = coupon.validFrom ? new Date(coupon.validFrom) > now : false;
  const usedUp = coupon.maxUses ? coupon.usedCount >= coupon.maxUses : false;
  const live = coupon.isActive && !expired && !notStarted && !usedUp;

  const discountText =
    coupon.discountType === 'percent'
      ? `${coupon.discountValue}%`
      : `${coupon.discountValue.toLocaleString('vi-VN')}đ`;

  const usagePct = coupon.maxUses
    ? Math.min(100, Math.round((coupon.usedCount / coupon.maxUses) * 100))
    : 0;

  return (
    <motion.div
      className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 w-full max-w-5xl mx-auto"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chi tiết mã giảm giá</h1>
          <p className="text-[13px] text-gray-500">
            ID:{' '}
            <span className="font-mono text-gray-900 bg-gray-100 px-1 rounded">
              {coupon._id}
            </span>
          </p>
        </div>
      </motion.div>

      {/* Main card */}
      <motion.div
        variants={item}
        className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start"
      >
        <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#2d6a4f] to-[#1a3a2a] text-white flex flex-col items-center justify-center shrink-0">
          <Ticket className="w-8 h-8 mb-1" />
          <span className="text-xl font-extrabold leading-none">{discountText}</span>
          <span className="text-[10px] opacity-80 mt-1">giảm</span>
        </div>

        <div className="flex-1 w-full">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900 font-mono tracking-wider">
              {coupon.code}
            </h2>
            <span
              className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-full ${
                live ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {live ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              {live
                ? 'Đang hoạt động'
                : expired
                  ? 'Đã hết hạn'
                  : usedUp
                    ? 'Hết lượt'
                    : notStarted
                      ? 'Chưa bắt đầu'
                      : 'Đã tắt'}
            </span>
          </div>

          {/* Usage bar */}
          <div className="mt-4">
            <div className="flex justify-between text-[12px] text-gray-500 mb-1">
              <span>Lượt sử dụng</span>
              <span className="font-semibold text-gray-800">
                {coupon.usedCount}
                {coupon.maxUses ? ` / ${coupon.maxUses}` : ' / không giới hạn'}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2d6a4f] rounded-full transition-all"
                style={{ width: `${coupon.maxUses ? usagePct : 0}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Detail grid */}
      <motion.div
        variants={item}
        className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
      >
        <h3 className="text-[15px] font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Tag className="w-4 h-4 text-[#2d6a4f]" /> Thông tin mã
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
          <InfoRow icon={Percent} label="Loại giảm">
            {coupon.discountType === 'percent' ? 'Theo phần trăm' : 'Số tiền cố định'}
          </InfoRow>
          <InfoRow icon={Percent} label="Giá trị giảm">
            {discountText}
          </InfoRow>
          <InfoRow icon={Layers} label="Áp dụng cho">
            {APPLICABLE_LABEL[coupon.applicableTo]}
          </InfoRow>
          <InfoRow icon={Users} label="Lượt đã dùng">
            {coupon.usedCount}
          </InfoRow>
          <InfoRow icon={CalendarClock} label="Hiệu lực từ">
            <span className="text-[13px] font-normal text-gray-600">{formatDate(coupon.validFrom)}</span>
          </InfoRow>
          <InfoRow icon={CalendarClock} label="Hết hạn">
            <span className="text-[13px] font-normal text-gray-600">
              {coupon.validTo ? formatDate(coupon.validTo) : 'Không giới hạn'}
            </span>
          </InfoRow>
        </div>
      </motion.div>
    </motion.div>
  );
}
