'use client';

import {
  ApprovalBadge,
  ContentTypeBadge,
  LevelBadge,
} from '@/components/admin/content-approval/ContentBadges';
import { Button } from '@/components/ui/button';
import { ContentSubmission } from '@/types/content.types';
import {
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  Mail,
  MessageSquare,
  TrendingUp,
  User,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { CommissionModal } from './CommissionModal';
import { RejectModal } from './RejectModal';

interface ApprovalCardProps {
  submission: ContentSubmission;
  onApprove?: (id: string, rate: number, basePrice: number) => void;
  onReject?: (id: string, reason: string) => void;
}

export function ApprovalCard({
  submission: s,
  onApprove,
  onReject,
}: ApprovalCardProps) {
  const [commissionOpen, setCommissionOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const isPending = s.status === 'pending';
  const isApproved = s.status === 'approved';
  const isRejected = s.status === 'rejected';

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <ContentTypeBadge type={s.type} />
              <LevelBadge level={s.level} />
              <ApprovalBadge status={s.status} />
            </div>
            <h3 className="text-[14px] font-semibold text-gray-900 leading-snug">
              {s.title}
            </h3>
          </div>

          {isPending && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                onClick={() => setCommissionOpen(true)}
                className="h-8 text-[12px] bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Duyệt
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setRejectOpen(true)}
                className="h-8 text-[12px] border-red-200 text-red-600 hover:bg-red-50 gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                Từ chối
              </Button>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2">
          {s.description}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-[12px] text-gray-400 flex-wrap">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            {s.author}
          </span>
          <span className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            {s.authorEmail}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Nộp: {new Date(s.submittedAt).toLocaleDateString('vi-VN')}
          </span>
          {s.duration && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {s.duration} phút
            </span>
          )}
        </div>

        {/* Approved — commission info */}
        {isApproved && s.commission && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 space-y-2">
            <p className="text-[12px] font-semibold text-emerald-700 flex items-center gap-1.5">
              <Banknote className="w-3.5 h-3.5" />
              Cơ cấu hoa hồng
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-[11px] text-emerald-600">Tỉ lệ</p>
                <p className="text-[14px] font-bold text-[#1a3a2a]">
                  {s.commission.rate}%
                </p>
              </div>
              <div>
                <p className="text-[11px] text-emerald-600">Giá gốc</p>
                <p className="text-[14px] font-bold text-[#1a3a2a]">
                  {s.commission.basePrice.toLocaleString('vi-VN')} ₫
                </p>
              </div>
              <div>
                <p className="text-[11px] text-emerald-600">Tổng đã kiếm</p>
                <p className="text-[14px] font-bold text-[#1a3a2a]">
                  {s.commission.totalEarned.toLocaleString('vi-VN')} ₫
                </p>
              </div>
            </div>
            {s.reviewedAt && s.reviewedBy && (
              <p className="text-[11px] text-emerald-600 pt-1 border-t border-emerald-200">
                Duyệt bởi <b>{s.reviewedBy}</b> lúc{' '}
                {new Date(s.reviewedAt).toLocaleDateString('vi-VN')}
              </p>
            )}
          </div>
        )}

        {/* Rejected — reason */}
        {isRejected && s.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-[12px] font-semibold text-red-600 flex items-center gap-1.5 mb-1">
              <MessageSquare className="w-3.5 h-3.5" />
              Lý do từ chối
            </p>
            <p className="text-[12px] text-red-700">{s.rejectionReason}</p>
            {s.reviewedAt && s.reviewedBy && (
              <p className="text-[11px] text-red-400 mt-2 pt-2 border-t border-red-200">
                Từ chối bởi <b>{s.reviewedBy}</b> lúc{' '}
                {new Date(s.reviewedAt).toLocaleDateString('vi-VN')}
              </p>
            )}
          </div>
        )}
      </div>

      {isPending && (
        <>
          <CommissionModal
            open={commissionOpen}
            onOpenChange={setCommissionOpen}
            contentTitle={s.title}
            onConfirm={(rate, basePrice) => onApprove?.(s.id, rate, basePrice)}
          />
          <RejectModal
            open={rejectOpen}
            onOpenChange={setRejectOpen}
            contentTitle={s.title}
            onConfirm={(reason) => onReject?.(s.id, reason)}
          />
        </>
      )}
    </>
  );
}
