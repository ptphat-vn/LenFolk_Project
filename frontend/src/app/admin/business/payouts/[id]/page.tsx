'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Banknote,
  Landmark,
  User as UserIcon,
  CalendarClock,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  StickyNote,
} from 'lucide-react';
import { walletApi } from '@/lib/api/wallet.api';
import { PayoutRequest, PayoutStatus } from '@/types/wallet.types';
import { ActionButton } from '@/common/button/ActionButton';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
};

const STATUS: Record<PayoutStatus, { label: string; cls: string; icon: typeof Clock }> = {
  pending: { label: 'Chờ duyệt', cls: 'bg-amber-50 text-amber-700', icon: Clock },
  approved: { label: 'Đã duyệt', cls: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
  rejected: { label: 'Từ chối', cls: 'bg-red-50 text-red-600', icon: XCircle },
};

function fmtMoney(n?: number) {
  return (n ?? 0).toLocaleString('vi-VN') + ' ₫';
}
function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleString('vi-VN');
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Banknote;
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

export default function PayoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const payoutId = params.id as string;

  const [payout, setPayout] = useState<PayoutRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  const fetchPayout = useCallback(async () => {
    try {
      setLoading(true);
      // wallet API không có getById → lấy danh sách rồi tìm theo id
      const res = await walletApi.getAllPayouts();
      const found = (res.data || []).find((p) => p._id === payoutId) || null;
      setPayout(found);
    } catch {
      toast.error('Lỗi khi tải yêu cầu rút tiền');
    } finally {
      setLoading(false);
    }
  }, [payoutId]);

  useEffect(() => {
    if (payoutId) fetchPayout();
  }, [fetchPayout, payoutId]);

  const review = async (status: 'approved' | 'rejected') => {
    if (!payout) return;
    setActing(true);
    try {
      await walletApi.reviewPayout(payout._id, {
        status,
        adminNote: adminNote || undefined,
      });
      toast.success(status === 'approved' ? 'Đã duyệt yêu cầu rút tiền' : 'Đã từ chối yêu cầu');
      setRejectMode(false);
      setAdminNote('');
      fetchPayout();
    } catch {
      toast.error('Lỗi khi xử lý yêu cầu');
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-[#2d6a4f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!payout) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Không tìm thấy yêu cầu rút tiền</h2>
        <ActionButton icon={ArrowLeft} onClick={() => router.back()}>
          Quay lại
        </ActionButton>
      </div>
    );
  }

  const st = STATUS[payout.status];
  const StIcon = st.icon;
  const canReview = payout.status === 'pending';
  const instructor =
    typeof payout.instructorId === 'object'
      ? (payout.instructorId as { name?: string; email?: string })
      : null;

  return (
    <motion.div
      className="p-6 md:p-8 space-y-6 w-full max-w-4xl mx-auto"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết yêu cầu rút tiền</h1>
            <p className="text-[13px] text-gray-500">
              ID:{' '}
              <span className="font-mono text-gray-900 bg-gray-100 px-1 rounded">
                {payout._id}
              </span>
            </p>
          </div>
        </div>
        {canReview && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={acting}
              onClick={() => setRejectMode((v) => !v)}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <XCircle className="w-4 h-4 mr-1.5" /> Từ chối
            </Button>
            <Button
              type="button"
              disabled={acting}
              onClick={() => review('approved')}
              className="bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white"
            >
              {acting ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
              )}
              Duyệt &amp; chi trả
            </Button>
          </div>
        )}
      </motion.div>

      {/* Reject panel */}
      {canReview && rejectMode && (
        <motion.div variants={item} className="bg-red-50 border border-red-100 rounded-2xl p-5 space-y-3">
          <p className="text-[13px] font-semibold text-red-700">Ghi chú từ chối (tuỳ chọn)</p>
          <Textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            rows={3}
            placeholder="VD: Thông tin ngân hàng chưa chính xác..."
            className="border-red-200 focus:border-red-400 bg-white"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setRejectMode(false)}>
              Huỷ
            </Button>
            <Button
              type="button"
              disabled={acting}
              onClick={() => review('rejected')}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {acting ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : null}
              Xác nhận từ chối
            </Button>
          </div>
        </motion.div>
      )}

      {/* Amount + status */}
      <motion.div variants={item} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[12px] text-gray-400">Số tiền yêu cầu rút</p>
            <p className="text-3xl font-extrabold text-[#2d6a4f]">{fmtMoney(payout.amount)}</p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full ${st.cls}`}
          >
            <StIcon className="w-3.5 h-3.5" /> {st.label}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 pt-2 border-t border-gray-100">
          <InfoRow icon={UserIcon} label="Giảng viên">
            {instructor?.name ? (
              instructor.name
            ) : (
              <span className="font-mono text-[12px]">
                {typeof payout.instructorId === 'string' ? payout.instructorId.slice(-8) : '—'}
              </span>
            )}
          </InfoRow>
          <InfoRow icon={CalendarClock} label="Ngày yêu cầu">
            <span className="text-[13px] font-normal text-gray-600">{fmtDate(payout.createdAt)}</span>
          </InfoRow>
          <InfoRow icon={CalendarClock} label="Xử lý lúc">
            <span className="text-[13px] font-normal text-gray-600">{fmtDate(payout.processedAt)}</span>
          </InfoRow>
        </div>
      </motion.div>

      {/* Bank info */}
      <motion.div variants={item} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-[15px] font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Landmark className="w-4 h-4 text-[#2d6a4f]" /> Thông tin nhận tiền
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
          <InfoRow icon={Landmark} label="Ngân hàng">
            {payout.bankDetails?.bankName || '—'}
          </InfoRow>
          <InfoRow icon={Banknote} label="Số tài khoản">
            <span className="font-mono">{payout.bankDetails?.accountNumber || '—'}</span>
          </InfoRow>
          <InfoRow icon={UserIcon} label="Chủ tài khoản">
            {payout.bankDetails?.accountName || '—'}
          </InfoRow>
        </div>

        {payout.adminNote && (
          <div className="mt-4 rounded-xl bg-gray-50 border border-gray-100 p-3">
            <p className="text-[12px] font-semibold text-gray-500 mb-0.5 flex items-center gap-1.5">
              <StickyNote className="w-3.5 h-3.5" /> Ghi chú của admin
            </p>
            <p className="text-[13px] text-gray-700">{payout.adminNote}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
