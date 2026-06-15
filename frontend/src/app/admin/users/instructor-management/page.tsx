'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import {
  InstructorProfile,
  CreateInstructorProfileInput,
  InstructorStatus,
  getInstructorUserId,
  getInstructorUserName,
  getInstructorUserEmail,
} from '@/types/instructor.types';
import { instructorApi } from '@/lib/api/instructor.api';
import {
  UserCheck,
  Star,
  Users,
  BookOpen,
  Trash2,
  Globe,
  Eye,
  Plus,
  Pencil,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { FilterInput } from '@/common/filter/FilterInput';
import { FilterSelect } from '@/common/filter/FilterSelect';
import { DataTable, Column } from '@/common/table/DataTable';
import { ActionButton } from '@/common/button/ActionButton';
import { RowActionsMenu } from '@/components/admin/RowActionsMenu';
import { InstructorFormModal } from '@/components/admin/users/InstructorFormModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const STATUS_META: Record<
  InstructorStatus,
  { label: string; className: string; icon: typeof Clock }
> = {
  pending: { label: 'Chờ duyệt', className: 'bg-amber-100 text-amber-700', icon: Clock },
  approved: { label: 'Đã duyệt', className: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  rejected: { label: 'Từ chối', className: 'bg-red-100 text-red-700', icon: XCircle },
};

const STATUS_FILTER_OPTIONS = [
  { label: 'Tất cả trạng thái', value: 'all' },
  { label: 'Chờ duyệt', value: 'pending' },
  { label: 'Đã duyệt', value: 'approved' },
  { label: 'Từ chối', value: 'rejected' },
];

function getBackendMessage(error: unknown): string | undefined {
  return isAxiosError(error)
    ? (error.response?.data as { message?: string } | undefined)?.message
    : undefined;
}

export default function AdminInstructorsPage() {
  const [instructors, setInstructors] = useState<InstructorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const debouncedSearch = useDebounce(search, 500);
  const [actingId, setActingId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<InstructorProfile | null>(null);

  const [rejectTarget, setRejectTarget] = useState<InstructorProfile | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  async function fetchInstructors() {
    try {
      setLoading(true);
      const res = await instructorApi.getAll(
        statusFilter === 'all' ? undefined : { status: statusFilter as InstructorStatus },
      );
      setInstructors(res.data || []);
    } catch (error) {
      console.error('Failed to fetch instructors', error);
      toast.error('Lỗi khi tải dữ liệu giảng viên');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInstructors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleSave = async (data: CreateInstructorProfileInput, id?: string) => {
    try {
      if (id) {
        await instructorApi.update(id, data);
        toast.success('Đã cập nhật hồ sơ giảng viên');
      } else {
        await instructorApi.create(data);
        toast.success('Đã tạo hồ sơ giảng viên');
      }
      fetchInstructors();
    } catch (error) {
      console.error('Failed to save instructor', error);
      toast.error(getBackendMessage(error) || 'Lỗi khi lưu hồ sơ');
      throw error; // Let modal handle loading state
    }
  };

  const handleDelete = async (inst: InstructorProfile) => {
    if (
      !confirm(
        'Bạn có chắc chắn muốn xóa hồ sơ giảng viên này? Hành động này không thể hoàn tác.',
      )
    )
      return;

    try {
      setActingId(inst._id);
      await instructorApi.delete(inst._id);
      toast.success('Đã xóa hồ sơ giảng viên');
      fetchInstructors();
    } catch (error) {
      console.error('Failed to delete instructor', error);
      toast.error(getBackendMessage(error) || 'Lỗi khi xóa hồ sơ');
    } finally {
      setActingId(null);
    }
  };

  const handleApprove = async (inst: InstructorProfile) => {
    try {
      setActingId(inst._id);
      await instructorApi.approve(inst._id);
      toast.success('Đã duyệt giảng viên');
      fetchInstructors();
    } catch (error) {
      console.error('Failed to approve instructor', error);
      toast.error(getBackendMessage(error) || 'Lỗi khi duyệt giảng viên');
    } finally {
      setActingId(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return;
    try {
      setActingId(rejectTarget._id);
      await instructorApi.reject(rejectTarget._id, rejectReason.trim() || undefined);
      toast.success('Đã từ chối đơn giảng viên');
      setRejectTarget(null);
      setRejectReason('');
      fetchInstructors();
    } catch (error) {
      console.error('Failed to reject instructor', error);
      toast.error(getBackendMessage(error) || 'Lỗi khi từ chối đơn');
    } finally {
      setActingId(null);
    }
  };

  const filteredInstructors = useMemo(() => {
    const searchLower = debouncedSearch.toLowerCase();
    if (!searchLower) return instructors;
    return instructors.filter((inst) => {
      const name = getInstructorUserName(inst.userId) || '';
      const email = getInstructorUserEmail(inst.userId) || '';
      return (
        name.toLowerCase().includes(searchLower) ||
        email.toLowerCase().includes(searchLower) ||
        getInstructorUserId(inst.userId).toLowerCase().includes(searchLower) ||
        (inst.expertise || '').toLowerCase().includes(searchLower)
      );
    });
  }, [instructors, debouncedSearch]);

  const columns: Column<InstructorProfile>[] = [
    {
      header: 'Giảng viên',
      render: (inst) => {
        const name = getInstructorUserName(inst.userId);
        const email = getInstructorUserEmail(inst.userId);
        return (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">
              {name || (
                <span className="font-mono text-xs text-gray-500">
                  {getInstructorUserId(inst.userId)}
                </span>
              )}
            </span>
            {email && <span className="text-xs text-gray-500">{email}</span>}
          </div>
        );
      },
    },
    {
      header: 'Chuyên môn',
      render: (inst) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">
            {inst.expertise || 'Chưa cập nhật'}
          </span>
          {inst.bio && (
            <span
              className="text-xs text-gray-500 line-clamp-1 max-w-50 cursor-pointer hover:text-[#2d6a4f]"
              title={inst.bio}
            >
              {inst.bio}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Trạng thái',
      className: 'text-center',
      render: (inst) => {
        const meta = STATUS_META[inst.status ?? 'approved'] ?? STATUS_META.approved;
        const Icon = meta.icon;
        return (
          <div className="flex flex-col items-center gap-1">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${meta.className}`}
            >
              <Icon className="w-3 h-3" />
              {meta.label}
            </span>
            {inst.status === 'rejected' && inst.rejectReason && (
              <span
                className="text-[10px] text-red-400 line-clamp-1 max-w-40"
                title={inst.rejectReason}
              >
                {inst.rejectReason}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Thông số',
      render: (inst) => (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <BookOpen className="w-3.5 h-3.5 text-[#2d6a4f]" />
            <span>{inst.totalCourses || 0} khóa học</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>{inst.totalStudents || 0} học viên</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span>{inst.rating ? inst.rating.toFixed(1) : 'Chưa có'} điểm</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Liên kết',
      render: (inst) =>
        inst.websiteUrl ? (
          <a
            href={inst.websiteUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#2d6a4f] hover:underline"
          >
            <Globe className="w-3.5 h-3.5" />
            Website
          </a>
        ) : (
          <span className="text-gray-400 italic text-xs">Không có</span>
        ),
    },
    {
      header: 'Thao tác',
      className: 'text-right',
      render: (inst) => {
        const isPending = (inst.status ?? 'approved') === 'pending';
        return (
          <div className="flex justify-end">
            <RowActionsMenu
              actions={[
                {
                  label: 'Xem chi tiết',
                  icon: Eye,
                  href: `/admin/users/instructor-management/${inst._id}`,
                },
                {
                  label: 'Duyệt giảng viên',
                  icon: Check,
                  hidden: !isPending,
                  disabled: actingId === inst._id,
                  onClick: () => handleApprove(inst),
                },
                {
                  label: 'Từ chối',
                  icon: X,
                  variant: 'destructive',
                  hidden: !isPending,
                  disabled: actingId === inst._id,
                  onClick: () => {
                    setRejectReason('');
                    setRejectTarget(inst);
                  },
                },
                {
                  label: 'Chỉnh sửa hồ sơ',
                  icon: Pencil,
                  separatorBefore: true,
                  onClick: () => {
                    setEditTarget(inst);
                    setFormOpen(true);
                  },
                },
                {
                  label: 'Xóa hồ sơ',
                  icon: Trash2,
                  variant: 'destructive',
                  disabled: actingId === inst._id,
                  onClick: () => handleDelete(inst),
                },
              ]}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-[#2d6a4f]" />
            Quản lý giảng viên
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Duyệt đơn đăng ký và quản lý hồ sơ giảng viên trên hệ thống
          </p>
        </div>
        <ActionButton
          icon={Plus}
          onClick={() => {
            setEditTarget(null);
            setFormOpen(true);
          }}
        >
          Thêm hồ sơ
        </ActionButton>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <FilterInput
            value={search}
            onChange={setSearch}
            placeholder="Tìm theo tên, email, chuyên môn..."
            className="w-full sm:w-80"
          />
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_FILTER_OPTIONS}
            icon
            className="w-full sm:w-56"
          />
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={filteredInstructors}
          isLoading={loading}
          emptyIcon={UserCheck}
          emptyMessage="Không tìm thấy hồ sơ giảng viên nào"
          keyExtractor={(inst) => inst._id}
        />
      </div>

      <InstructorFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        editInstructor={editTarget}
      />

      {/* Reject reason dialog */}
      <Dialog
        open={!!rejectTarget}
        onOpenChange={(o) => {
          if (!o) {
            setRejectTarget(null);
            setRejectReason('');
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Từ chối đơn giảng viên
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            <p className="text-sm text-gray-600">
              Nhập lý do từ chối (tùy chọn). Lý do sẽ được gửi qua email cho giảng viên.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="VD: Hồ sơ thiếu thông tin chuyên môn..."
              className="w-full h-28 p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 resize-none"
            />
          </div>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setRejectTarget(null);
                setRejectReason('');
              }}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!!actingId}
              onClick={handleRejectConfirm}
            >
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
