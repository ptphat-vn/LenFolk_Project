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
  Loader2,
  RefreshCw,
  User as UserIcon,
  BookOpen,
  Ticket,
  Hash,
  ShieldCheck,
} from 'lucide-react';
import { paymentApi } from '@/lib/api/payment.api';
import {
  TransactionRecord,
  TransactionStatus,
  txUserName,
  txUserEmail,
  txItemTitle,
  txCouponCode,
} from '@/types/payment.types';
import { ActionButton } from '@/common/button/ActionButton';
import { Button } from '@/components/ui/button';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
};

const STATUS: Record<TransactionStatus, { label: string; cls: string; icon: typeof Clock }> = {
  pending: { label: 'Chờ thanh toán', cls: 'bg-amber-50 text-amber-700', icon: Clock },
  success: { label: 'Hoàn tất', cls: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
  failed: { label: 'Thất bại', cls: 'bg-red-50 text-red-600', icon: XCircle },
  refunded: { label: 'Hoàn tiền', cls: 'bg-purple-50 text-purple-700', icon: RefreshCw },
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
  const [refundMode, setRefundMode] = useState(false);

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

  const handleRefund = async () => {
    if (!tx) return;
    setActing(true);
    try {
      await paymentApi.update(tx._id, { status: 'refunded' });
      toast.success('Đã hoàn tiền giao dịch');
      setRefundMode(false);
      fetchTx();
    } catch {
      toast.error('Lỗi khi hoàn tiền giao dịch');
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
  const canRefund = tx.status === 'success';
  const typeLabel =
    tx.transactionType === 'course'
      ? 'Khoá học'
      : tx.transactionType === 'performance'
        ? 'Tiết mục'
        : '—';

  return (
    <motion.div
      className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 w-full max-w-5xl mx-auto"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
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
        {canRefund && (
          <Button
            type="button"
            variant="outline"
            disabled={acting}
            onClick={() => setRefundMode((v) => !v)}
            className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" /> Hoàn tiền
          </Button>
        )}
      </motion.div>

      {/* Refund panel */}
      {canRefund && refundMode && (
        <motion.div
          variants={item}
          className="bg-purple-50 border border-purple-100 rounded-2xl p-5 space-y-3"
        >
          <p className="text-[13px] font-semibold text-purple-700">
            Hoàn tiền giao dịch này?
          </p>
          <p className="text-[12px] text-purple-600">
            Trạng thái sẽ chuyển sang &quot;Hoàn tiền&quot;. Thao tác này dùng khi cần
            hoàn lại tiền cho người mua theo thoả thuận.
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setRefundMode(false)}>
              Huỷ
            </Button>
            <Button
              type="button"
              disabled={acting}
              onClick={handleRefund}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {acting ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : null}
              Xác nhận hoàn tiền
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
            <InfoRow icon={UserIcon} label="Người mua">
              <span className="text-right">
                <span className="block">{txUserName(tx.userId)}</span>
                {txUserEmail(tx.userId) && (
                  <span className="block text-[12px] font-normal text-gray-500">
                    {txUserEmail(tx.userId)}
                  </span>
                )}
              </span>
            </InfoRow>
            <InfoRow icon={BookOpen} label="Nội dung">
              <span className="text-right text-[13px]">
                {txItemTitle(tx.courseId) ?? txItemTitle(tx.performanceId) ?? '—'}
              </span>
            </InfoRow>
            <InfoRow icon={Tag} label="Loại giao dịch">{typeLabel}</InfoRow>
            <InfoRow icon={CreditCard} label="Phương thức">
              {tx.paymentMethod ?? '—'}
            </InfoRow>
            {tx.payCode && (
              <InfoRow icon={Hash} label="Mã thanh toán">
                <span className="font-mono text-[12px]">{tx.payCode}</span>
              </InfoRow>
            )}
            <InfoRow icon={Ticket} label="Mã giảm giá">
              {txCouponCode(tx.couponId) ?? '—'}
            </InfoRow>
            <InfoRow icon={Tag} label="Giảm giá">
              {tx.discountAmount ? fmtMoney(tx.discountAmount) : '—'}
            </InfoRow>
            {tx.reviewedBy && (
              <InfoRow icon={ShieldCheck} label="Người xử lý">
                <span className="text-[13px]">{txUserName(tx.reviewedBy)}</span>
              </InfoRow>
            )}
            <InfoRow icon={CalendarClock} label="Tạo lúc">
              <span className="text-[13px] font-normal text-gray-600">{fmtDate(tx.createdAt)}</span>
            </InfoRow>
            <InfoRow icon={CalendarClock} label="Thanh toán lúc">
              <span className="text-[13px] font-normal text-gray-600">{fmtDate(tx.paidAt)}</span>
            </InfoRow>
          </div>
        </motion.div>

        {/* SePay note */}
        <motion.div
          variants={item}
          className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
        >
          <h3 className="text-[14px] font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#2d6a4f]" /> Thanh toán
          </h3>
          <p className="text-[13px] text-gray-500 leading-relaxed">
            Giao dịch được xác nhận tự động qua webhook SePay khi người mua chuyển
            khoản đúng nội dung. Admin không cần duyệt thủ công — chỉ xử lý hoàn tiền
            khi cần.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
