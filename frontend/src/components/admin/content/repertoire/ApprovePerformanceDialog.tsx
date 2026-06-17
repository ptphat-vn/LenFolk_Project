'use client';

import { useEffect, useState } from 'react';
import { Performance } from '@/types/performance.types';
import { performanceApi } from '@/lib/api/performance.api';
import { FormDialog } from '@/components/admin/FormDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  CheckCircle2,
  XCircle,
  PlayCircle,
  Loader2,
  Music,
  Clock,
  DollarSign,
  Percent,
} from 'lucide-react';
import Image from 'next/image';

interface ApprovePerformanceDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  performance: Performance | null;
  onDone: () => void;
}

function formatVND(amount?: number) {
  if (!amount) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDuration(seconds?: number) {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ApprovePerformanceDialog({
  open,
  onOpenChange,
  performance,
  onDone,
}: ApprovePerformanceDialogProps) {
  const [commission, setCommission] = useState<number>(30);
  const [rejectReason, setRejectReason] = useState('');
  const [mode, setMode] = useState<'view' | 'reject'>('view');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // Load detail with subscription price
  const [detail, setDetail] = useState<Performance | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (open && performance) {
      setCommission(performance.adminCommissionPercentage ?? 30);
      setMode('view');
      setRejectReason('');
      setDetail(null);
      // Fetch detail to get subscription plan price
      setLoadingDetail(true);
      performanceApi
        .getById(performance._id)
        .then((res) => setDetail(res.data))
        .catch(() => setDetail(performance))
        .finally(() => setLoadingDetail(false));
    }
  }, [open, performance]);

  const handleApprove = async () => {
    if (!performance) return;
    setIsApproving(true);
    try {
      await performanceApi.approve(performance._id, {
        adminCommissionPercentage: commission,
      });
      toast.success('Tiết mục đã được duyệt và xuất bản!');
      onOpenChange(false);
      onDone();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Lỗi khi duyệt tiết mục');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!performance) return;
    setIsRejecting(true);
    try {
      await performanceApi.reject(performance._id, {
        rejectReason: rejectReason || undefined,
      });
      toast.success('Đã từ chối tiết mục.');
      onOpenChange(false);
      onDone();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Lỗi khi từ chối tiết mục');
    } finally {
      setIsRejecting(false);
    }
  };

  if (!performance) return null;

  const price = detail?.price;
  const instructorRevenue = price
    ? Math.round(price * (1 - commission / 100))
    : undefined;
  const adminRevenue = price ? Math.round(price * (commission / 100)) : undefined;

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={Music}
      title="Duyệt tiết mục"
      description="Xem chi tiết và duyệt hoặc từ chối tiết mục."
      className="sm:max-w-xl"
      footer={
        mode === 'view' ? (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-gray-600"
            >
              Đóng
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setMode('reject')}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <XCircle className="w-4 h-4 mr-1.5" />
              Từ chối
            </Button>
            <Button
              type="button"
              onClick={handleApprove}
              disabled={isApproving}
              className="bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white"
            >
              {isApproving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
              )}
              Duyệt & Xuất bản
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setMode('view')}
              disabled={isRejecting}
            >
              Quay lại
            </Button>
            <Button
              type="button"
              onClick={handleReject}
              disabled={isRejecting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isRejecting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              ) : (
                <XCircle className="w-4 h-4 mr-1.5" />
              )}
              Xác nhận từ chối
            </Button>
          </>
        )
      }
    >
        <div className="space-y-4">
          {/* Thumbnail + Title */}
          <div className="flex gap-3 items-start">
            {performance.thumbnail ? (
              <Image
                src={performance.thumbnail}
                alt={performance.title}
                width={72}
                height={48}
                className="rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="w-18 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <PlayCircle className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                {performance.title}
              </h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {performance.genre && (
                  <span className="text-[11px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                    {performance.genre}
                  </span>
                )}
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                    performance.isFree
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-orange-50 text-orange-700'
                  }`}
                >
                  {performance.isFree ? 'Miễn phí' : 'Trả phí'}
                </span>
              </div>
            </div>
          </div>

          {/* Mô tả */}
          {performance.description && (
            <p className="text-[13px] text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100">
              {performance.description}
            </p>
          )}

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-3">
            {performance.duration !== undefined && (
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3 border border-gray-100">
                <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400">Thời lượng</p>
                  <p className="text-sm font-medium text-gray-700">
                    {formatDuration(performance.duration)}
                  </p>
                </div>
              </div>
            )}
            {performance.videoUrl && (
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3 border border-gray-100 truncate">
                <PlayCircle className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400">Video URL</p>
                  <a
                    href={performance.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] font-medium text-blue-600 hover:underline truncate block"
                  >
                    Xem video ↗
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Subscription / Price info */}
          {loadingDetail ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 space-y-1.5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-[#2d6a4f]" />
                <span className="text-sm font-semibold text-[#2d6a4f]">Thông tin giá</span>
              </div>
              {price ? (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white rounded-lg py-2 px-3 border border-emerald-100">
                    <p className="text-[10px] text-gray-400">Giá bán</p>
                    <p className="text-sm font-bold text-gray-900">{formatVND(price)}</p>
                    <p className="text-[10px] text-gray-400">mua đứt</p>
                  </div>
                  <div className="bg-white rounded-lg py-2 px-3 border border-blue-100">
                    <p className="text-[10px] text-gray-400">Admin nhận</p>
                    <p className="text-sm font-bold text-blue-700">{formatVND(adminRevenue)}</p>
                    <p className="text-[10px] text-gray-400">{commission}%</p>
                  </div>
                  <div className="bg-white rounded-lg py-2 px-3 border border-purple-100">
                    <p className="text-[10px] text-gray-400">Instructor nhận</p>
                    <p className="text-sm font-bold text-purple-700">{formatVND(instructorRevenue)}</p>
                    <p className="text-[10px] text-gray-400">{100 - commission}%</p>
                  </div>
                </div>
              ) : (
                <p className="text-[13px] text-gray-500">
                  {performance.isFree
                    ? 'Tiết mục miễn phí — không bán.'
                    : 'Chưa đặt giá cho tiết mục này.'}
                </p>
              )}
            </div>
          )}

          {/* Admin commission setting */}
          {mode === 'view' && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-gray-500" />
                Hoa hồng Admin (%)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={commission}
                  onChange={(e) => setCommission(Number(e.target.value))}
                  className="w-28"
                />
                <span className="text-[13px] text-gray-500">
                  Instructor sẽ nhận{' '}
                  <strong className="text-purple-700">{100 - commission}%</strong> doanh thu
                  {price
                    ? ` = ${formatVND(Math.round(price * (1 - commission / 100)))}`
                    : ''}
                </span>
              </div>
            </div>
          )}

          {/* Reject reason input */}
          {mode === 'reject' && (
            <div className="space-y-1.5">
              <Label className="text-red-700">Lý do từ chối (tuỳ chọn)</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="VD: Video chất lượng thấp, vui lòng upload lại..."
                rows={3}
                className="border-red-200 focus:border-red-400"
              />
              <p className="text-[11px] text-gray-400">
                Lý do này sẽ được lưu trong response. Instructor có thể chỉnh sửa và gửi lại.
              </p>
            </div>
          )}
        </div>
    </FormDialog>
  );
}
