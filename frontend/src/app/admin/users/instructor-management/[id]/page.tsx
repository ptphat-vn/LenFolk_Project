'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { instructorApi } from '@/lib/api/instructor.api';
import {
  InstructorProfile,
  InstructorStatus,
  getInstructorUserId,
  getInstructorUserName,
  getInstructorUserEmail,
} from '@/types/instructor.types';
import {
  ArrowLeft,
  UserCheck,
  Star,
  Users,
  BookOpen,
  Globe,
  Calendar,
  Briefcase,
  FileText,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Mail,
  Landmark,
} from 'lucide-react';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { motion, Variants } from 'framer-motion';
import { ActionButton } from '@/common/button/ActionButton';
import { Button } from '@/components/ui/button';

const STATUS_META: Record<
  InstructorStatus,
  { label: string; className: string; icon: typeof Clock }
> = {
  pending: { label: 'Chờ duyệt', className: 'bg-amber-100 text-amber-700', icon: Clock },
  approved: { label: 'Đã duyệt', className: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  rejected: { label: 'Từ chối', className: 'bg-red-100 text-red-700', icon: XCircle },
};

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
};

export default function InstructorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const instructorId = params.id as string;

  const [instructor, setInstructor] = useState<InstructorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const getBackendMessage = (error: unknown): string | undefined =>
    isAxiosError(error)
      ? (error.response?.data as { message?: string } | undefined)?.message
      : undefined;

  const fetchInstructorData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await instructorApi.getById(instructorId);
      setInstructor(res.data || null);
    } catch (error) {
      console.error('Failed to fetch instructor details', error);
      toast.error('Lỗi khi tải thông tin giảng viên');
    } finally {
      setLoading(false);
    }
  }, [instructorId]);

  useEffect(() => {
    if (instructorId) fetchInstructorData();
  }, [fetchInstructorData, instructorId]);

  const handleApprove = async () => {
    if (!instructor) return;
    try {
      setActing(true);
      await instructorApi.approve(instructor._id);
      toast.success('Đã duyệt giảng viên');
      fetchInstructorData();
    } catch (error) {
      toast.error(getBackendMessage(error) || 'Lỗi khi duyệt giảng viên');
    } finally {
      setActing(false);
    }
  };

  const handleReject = async () => {
    if (!instructor) return;
    try {
      setActing(true);
      await instructorApi.reject(instructor._id, rejectReason.trim() || undefined);
      toast.success('Đã từ chối đơn giảng viên');
      setRejectMode(false);
      setRejectReason('');
      fetchInstructorData();
    } catch (error) {
      toast.error(getBackendMessage(error) || 'Lỗi khi từ chối đơn');
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

  if (!instructor) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Không tìm thấy hồ sơ giảng viên</h2>
        <ActionButton icon={ArrowLeft} onClick={() => router.back()}>
          Quay lại
        </ActionButton>
      </div>
    );
  }

  return (
    <motion.div className="p-6 md:p-8 space-y-6 w-full max-w-5xl mx-auto" variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={item} className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Hồ sơ Giảng viên
          </h1>
          <p className="text-[13px] text-gray-500">ID: <span className="font-mono text-gray-900 bg-gray-100 px-1 rounded">{instructor._id}</span></p>
        </div>
      </motion.div>

      {/* Main Info Card */}
      <motion.div variants={item} className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-shrink-0 flex flex-col items-center gap-3">
          <div className="w-28 h-28 rounded-full bg-violet-100 text-violet-700 text-4xl font-bold flex items-center justify-center shadow-inner">
            <UserCheck className="w-12 h-12" />
          </div>
          {(() => {
            const meta = STATUS_META[instructor.status ?? 'approved'] ?? STATUS_META.approved;
            const Icon = meta.icon;
            return (
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${meta.className}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {meta.label}
              </span>
            );
          })()}
        </div>

        <div className="flex-1 w-full space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {getInstructorUserName(instructor.userId) || 'Giảng viên'}
            </h2>
            <p className="text-sm text-gray-500 mb-4 flex items-center gap-1.5">
              <Mail className="w-4 h-4" />
              {getInstructorUserEmail(instructor.userId) || (
                <span className="font-mono">{getInstructorUserId(instructor.userId)}</span>
              )}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-[14px] text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <Briefcase className="w-5 h-5 text-[#2d6a4f]" />
                <div>
                  <p className="text-xs text-gray-500">Chuyên môn</p>
                  <p className="font-semibold">{instructor.expertise || 'Chưa cập nhật'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-[14px] text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <Globe className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500">Website</p>
                  {instructor.websiteUrl ? (
                    <a href={instructor.websiteUrl} target="_blank" rel="noreferrer" className="font-semibold text-blue-600 hover:underline">
                      {new URL(instructor.websiteUrl).hostname}
                    </a>
                  ) : (
                    <p className="font-semibold text-gray-400">Không có</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 text-[14px] text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 sm:col-span-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Ngày tạo hồ sơ</p>
                  <p className="font-semibold">{instructor.createdAt ? new Date(instructor.createdAt).toLocaleDateString('vi-VN') : '—'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#2d6a4f]" />
              Tiểu sử (Bio)
            </h3>
            <p className="text-[14px] text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
              {instructor.bio || <span className="italic text-gray-400">Giảng viên chưa cập nhật tiểu sử.</span>}
            </p>
          </div>

          {instructor.bankDetails?.accountNumber && (
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-[#2d6a4f]" />
                Thông tin ngân hàng
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[14px]">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500">Ngân hàng</p>
                  <p className="font-semibold">{instructor.bankDetails.bankName || '—'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500">Chủ tài khoản</p>
                  <p className="font-semibold">{instructor.bankDetails.accountName || '—'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500">Số tài khoản</p>
                  <p className="font-semibold font-mono">{instructor.bankDetails.accountNumber}</p>
                </div>
              </div>
            </div>
          )}

          {instructor.status === 'rejected' && instructor.rejectReason && (
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-base font-semibold text-red-600 mb-2 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Lý do từ chối
              </h3>
              <p className="text-[14px] text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
                {instructor.rejectReason}
              </p>
            </div>
          )}

          {(instructor.status ?? 'approved') === 'pending' && (
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Duyệt đơn đăng ký</h3>
              {!rejectMode ? (
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    disabled={acting}
                    onClick={handleApprove}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Duyệt giảng viên
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={acting}
                    onClick={() => setRejectMode(true)}
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Từ chối
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Lý do từ chối (tùy chọn) — sẽ gửi qua email cho giảng viên..."
                    className="w-full h-24 p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 resize-none"
                  />
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={acting}
                      onClick={handleReject}
                    >
                      Xác nhận từ chối
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={acting}
                      onClick={() => {
                        setRejectMode(false);
                        setRejectReason('');
                      }}
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{instructor.totalCourses || 0}</p>
            <p className="text-sm text-gray-500">Khóa học</p>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-[#2d6a4f]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{instructor.totalStudents || 0}</p>
            <p className="text-sm text-gray-500">Học viên</p>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{instructor.rating ? instructor.rating.toFixed(1) : 'Chưa có'}</p>
            <p className="text-sm text-gray-500">Đánh giá trung bình</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
