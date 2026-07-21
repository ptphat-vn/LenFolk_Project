'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Award,
  Target,
  Hash,
  Activity,
  Calendar,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { badgeApi } from '@/lib/api/badge.api';
import { Badge, BadgeType } from '@/types/badge.types';
import { ActionButton } from '@/common/button/ActionButton';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
};

const TYPE_LABELS: Record<BadgeType, string> = {
  streak: 'Chuỗi ngày',
  completion: 'Hoàn thành',
  practice: 'Luyện tập',
  achievement: 'Thành tựu',
};

const TYPE_COLORS: Record<BadgeType, string> = {
  streak: 'bg-amber-100 text-amber-700',
  completion: 'bg-emerald-100 text-emerald-700',
  practice: 'bg-blue-100 text-blue-700',
  achievement: 'bg-violet-100 text-violet-700',
};

function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleString('vi-VN');
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Award;
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

export default function BadgeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const badgeId = params.id as string;

  const [badge, setBadge] = useState<Badge | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBadge = useCallback(async () => {
    try {
      setLoading(true);
      const res = await badgeApi.getById(badgeId);
      setBadge(res.data || null);
    } catch {
      toast.error('Lỗi khi tải thông tin huy hiệu');
    } finally {
      setLoading(false);
    }
  }, [badgeId]);

  useEffect(() => {
    if (badgeId) fetchBadge();
  }, [fetchBadge, badgeId]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-[#2d6a4f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!badge) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Không tìm thấy huy hiệu</h2>
        <ActionButton icon={ArrowLeft} onClick={() => router.back()}>
          Quay lại
        </ActionButton>
      </div>
    );
  }

  const isUrl = /^https?:\/\//i.test(badge.icon ?? '');

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
          <h1 className="text-2xl font-bold text-gray-900">Chi tiết huy hiệu</h1>
          <p className="text-[13px] text-gray-500">
            ID:{' '}
            <span className="font-mono text-gray-900 bg-gray-100 px-1 rounded">
              {badge._id}
            </span>
          </p>
        </div>
      </motion.div>

      {/* Main card */}
      <motion.div
        variants={item}
        className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-8 items-start"
      >
        <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#2d6a4f]/10 to-[#1a3a2a]/10 flex items-center justify-center shrink-0 overflow-hidden">
          {isUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={badge.icon} alt={badge.name} className="w-full h-full object-contain p-2" />
          ) : (
            <Award className="w-14 h-14 text-[#2d6a4f]" />
          )}
        </div>

        <div className="flex-1 w-full">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{badge.name}</h2>
            <span
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${TYPE_COLORS[badge.type]}`}
            >
              {TYPE_LABELS[badge.type]}
            </span>
          </div>
          <p className="text-[14px] text-gray-600 mb-4">
            {badge.description || 'Chưa có mô tả'}
          </p>
          <span
            className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-full ${
              badge.isActive !== false
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {badge.isActive !== false ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <XCircle className="w-3.5 h-3.5" />
            )}
            {badge.isActive !== false ? 'Đang kích hoạt' : 'Đã tắt'}
          </span>
        </div>
      </motion.div>

      {/* Điều kiện mở khoá */}
      <motion.div
        variants={item}
        className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
      >
        <h3 className="text-[15px] font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-[#2d6a4f]" /> Điều kiện mở khoá
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
          <InfoRow icon={Hash} label="Khoá điều kiện">
            <span className="font-mono text-[13px]">{badge.conditionKey}</span>
          </InfoRow>
          <InfoRow icon={Activity} label="Ngưỡng đạt">
            {badge.conditionValue}
          </InfoRow>
          <InfoRow icon={Award} label="Loại">
            {TYPE_LABELS[badge.type]}
          </InfoRow>
          <InfoRow icon={Calendar} label="Ngày tạo">
            <span className="text-[13px] font-normal text-gray-600">{formatDate(badge.createdAt)}</span>
          </InfoRow>
        </div>
      </motion.div>
    </motion.div>
  );
}
