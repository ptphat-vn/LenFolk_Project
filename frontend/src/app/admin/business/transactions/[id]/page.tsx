'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Receipt,
  CreditCard,
  Tag,
  CalendarClock,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Loader2,
  ImageOff,
  User as UserIcon,
} from 'lucide-react';
import Image from 'next/image';
import { paymentApi } from '@/lib/api/payment.api';
import { TransactionRecord, TransactionStatus } from '@/types/payment.types';
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

const STATUS: Record<TransactionStatus, { label: string; cls: string; icon: typeof Clock }> = {
  pending: { label: 'Chờ thanh toán', cls: 'bg-gray-100 text-gray-600', icon: Clock },
  reviewing: { label: 'Đang xét duyệt', cls: 'bg-amber-50 text-amber-700', icon: Eye },
  success: { label: 'Hoàn tất', cls: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
  failed: { label: 'Từ chối', cls: 'bg-red-50 text-red-600', icon: XCircle },
  refunded: { label: 'Hoàn tiền', cls: 'bg-purple-50 text-purple-700', icon: CheckCircle2 },
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
  icon: typeof Receipt;
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

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const txId = params.id as string;

  const [tx, setTx] = useState<TransactionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const fetchTx = useCallback(async () => {
    try {
      setLoading(true);
      const res = await paymentApi.getById(txId);
      setTx(res.data || null);
    } catch {
      toast.error('Lỗi khi tải giao dịch');
    } finally {
      setLoading(false);
    }
  }, [txId]);

  useEffect(() => {
    if (txId) fetchTx();
  }, [fetchTx, txId]);

  const handleApprove = async () => {
    if (!tx) return;
    setActing(true);
    try {
      await paymentApi.approve(tx._id);
      toast.success('Đã duyệt giao dịch');
      fetchTx();
    } catch {
      toast.error('Lỗi khi duyệt giao dịch');
    } finally {
      setActing(false);
    }
  };

  const handleReject = async () => {
    if (!tx) return;
    setActing(true);
    try {
      await paymentApi.reject(tx._id, { rejectReason: rejectReason || undefined });
      toast.success('Đã từ chối giao dịch');
      setRejectMode(false);
      setRejectReason('');
      fetchTx();
    } catch {
      toast.error('Lỗi khi từ chối giao dịch');
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

  if (!tx) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Không tìm thấy giao dịch</h2>
        <ActionButton icon={ArrowLeft} onClick={() => router.back()}>
          Quay lại
        </ActionButton>
      </div>
    );
  }

  const st = STATUS[tx.status];
  const StIcon = st.icon;
  const canReview = tx.status === 'reviewing';
  const typeLabel =
    tx.transactionType === 'course'
      ? 'Khoá học'
      : tx.transactionType === 'performance'
        ? 'Tiết mục'
        : '—';

  return (
    <motion.div
      className="p-6 md:p-8 space-y-6 w-full max-w-5xl mx-auto"
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
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết giao dịch</h1>
            <p className="text-[13px] text-gray-500">
              Mã GD:{' '}
              <span className="font-mono text-gray-900 bg-gray-100 px-1 rounded">
                #{tx._id.slice(-8).toUpperCase()}
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
              onClick={handleApprove}
              className="bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white"
            >
              {acting ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
              )}
              Duyệt
            </Button>
          </div>
        )}
      </motion.div>

      {/* Reject panel */}
      {canReview && rejectMode && (
        <motion.div
          variants={item}
          className="bg-red-50 border border-red-100 rounded-2xl p-5 space-y-3"
        >
          <p className="text-[13px] font-semibold text-red-700">Lý do từ chối (tuỳ chọn)</p>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            placeholder="VD: Số tiền không khớp, ảnh minh chứng không hợp lệ..."
            className="border-red-200 focus:border-red-400 bg-white"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setRejectMode(false)}>
              Huỷ
            </Button>
            <Button
              type="button"
              disabled={acting}
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {acting ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : null}
              Xác nhận từ chối
            </Button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Amount + status */}
        <motion.div
          variants={item}
          className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-gray-400">Số tiền thanh toán</p>
              <p className="text-3xl font-extrabold text-[#2d6a4f]">{fmtMoney(tx.amount)}</p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full ${st.cls}`}
            >
              <StIcon className="w-3.5 h-3.5" /> {st.label}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 pt-2 border-t border-gray-100">
            <InfoRow icon={Tag} label="Loại giao dịch">{typeLabel}</InfoRow>
            <InfoRow icon={CreditCard} label="Phương thức">
              {tx.paymentMethod ?? '—'}
            </InfoRow>
            <InfoRow icon={Tag} label="Giảm giá">
              {tx.discountAmount ? fmtMoney(tx.discountAmount) : '—'}
            </InfoRow>
            <InfoRow icon={UserIcon} label="Người mua">
              <span className="font-mono text-[12px]">
                {typeof tx.userId === 'string' ? tx.userId.slice(-8) : '—'}
              </span>
            </InfoRow>
            <InfoRow icon={CalendarClock} label="Tạo lúc">
              <span className="text-[13px] font-normal text-gray-600">{fmtDate(tx.createdAt)}</span>
            </InfoRow>
            <InfoRow icon={CalendarClock} label="Thanh toán lúc">
              <span className="text-[13px] font-normal text-gray-600">{fmtDate(tx.paidAt)}</span>
            </InfoRow>
            {tx.reviewedAt && (
              <InfoRow icon={CalendarClock} label="Duyệt lúc">
                <span className="text-[13px] font-normal text-gray-600">{fmtDate(tx.reviewedAt)}</span>
              </InfoRow>
            )}
          </div>

          {tx.rejectReason && (
            <div className="rounded-xl bg-red-50 border border-red-100 p-3">
              <p className="text-[12px] font-semibold text-red-600 mb-0.5">Lý do từ chối</p>
              <p className="text-[13px] text-red-700">{tx.rejectReason}</p>
            </div>
          )}
        </motion.div>

        {/* Proof */}
        <motion.div
          variants={item}
          className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
        >
          <h3 className="text-[14px] font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#2d6a4f]" /> Minh chứng chuyển khoản
          </h3>
          {tx.proofImageUrl ? (
            <a href={tx.proofImageUrl} target="_blank" rel="noopener noreferrer" className="block group">
              <div className="relative w-full aspect-3/4 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                <Image
                  src={tx.proofImageUrl}
                  alt="Minh chứng"
                  fill
                  className="object-contain group-hover:scale-[1.02] transition-transform"
                  unoptimized
                />
              </div>
              <p className="text-[12px] text-center text-gray-400 mt-2">Bấm để xem ảnh gốc ↗</p>
            </a>
          ) : (
            <div className="w-full aspect-3/4 rounded-xl border border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-300">
              <ImageOff className="w-10 h-10 mb-2" />
              <p className="text-[12px] text-gray-400">Chưa có minh chứng</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
