'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { performanceApi } from '@/lib/api/performance.api';
import {
  Performance,
  PerformanceStatus,
  CreatePerformanceInput,
} from '@/types/performance.types';
import { Skeleton } from '@/components/ui/skeleton';

import { toast } from 'sonner';
import {
  Music,
  Clock,
  Pencil,
  Plus,
  Star,
  Trash2,
  PlayCircle,
  Loader2,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { FilterInput } from '@/common/filter/FilterInput';
import { FilterSelect } from '@/common/filter/FilterSelect';
import { DataTable, Column } from '@/common/table/DataTable';
import { Pagination } from '@/common/pagination/pagination';
import { ActionButton } from '@/common/button/ActionButton';
import { RowActionsMenu } from '@/components/admin/RowActionsMenu';
import { useDebounce } from '@/hooks/useDebounce';
import { PerformanceFormModal } from '@/components/admin/content/repertoire/PerformanceFormModal';
import { ApprovePerformanceDialog } from '@/components/admin/content/repertoire/ApprovePerformanceDialog';
import Image from 'next/image';

const STATUS_LABELS: Record<PerformanceStatus, string> = {
  pending: 'Chờ duyệt',
  published: 'Xuất bản',
  archived: 'Lưu trữ',
};

const STATUS_COLORS: Record<PerformanceStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  published: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-red-100 text-red-600',
};

const getApiErrorMessage = (error: unknown) => {
  if (!error || typeof error !== 'object' || !('response' in error)) return null;
  const response = (error as { response?: { data?: { message?: unknown } } }).response;
  return typeof response?.data?.message === 'string' ? response.data.message : null;
};

export default function RepertoireManagementPage() {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [statusFilter, setStatusFilter] = useState<PerformanceStatus | 'all'>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Performance | null>(null);
  const [approveTarget, setApproveTarget] = useState<Performance | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchPerformances = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await performanceApi.getAll();
      setPerformances(res.data || []);
    } catch {
      toast.error('Lỗi khi tải danh sách tiết mục');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPerformances();
  }, [fetchPerformances]);

  const stats = useMemo(
    () => ({
      total: performances.length,
      published: performances.filter((p) => p.status === 'published').length,
      pending: performances.filter((p) => p.status === 'pending').length,
      featured: performances.filter((p) => p.isFeatured).length,
    }),
    [performances],
  );

  const filtered = useMemo(() => {
    return performances.filter((p) => {
      if (debouncedSearch && !p.title.toLowerCase().includes(debouncedSearch.toLowerCase()))
        return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      return true;
    });
  }, [performances, debouncedSearch, statusFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [debouncedSearch, statusFilter]);

  const handleApprove = (perf: Performance) => {
    setApproveTarget(perf);
    setApproveOpen(true);
  };

  const handleEdit = (perf: Performance) => {
    setEditTarget(perf);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tiết mục này?')) return;
    try {
      setIsDeleting(id);
      await performanceApi.delete(id);
      toast.success('Đã xóa tiết mục');
      fetchPerformances();
    } catch {
      toast.error('Lỗi khi xóa tiết mục');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSave = async (data: CreatePerformanceInput) => {
    try {
      setIsSaving(true);
      if (editTarget) {
        await performanceApi.update(editTarget._id, data);
        toast.success('Đã cập nhật tiết mục');
      } else {
        await performanceApi.create(data);
        toast.success('Đã tạo tiết mục mới');
      }
      setFormOpen(false);
      fetchPerformances();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Lỗi khi lưu tiết mục');
    } finally {
      setIsSaving(false);
    }
  };

  const columns: Column<Performance>[] = [
    {
      header: 'Tiết mục',
      render: (perf) => (
        <div className="flex items-center gap-3">
          {perf.thumbnail ? (
            <Image src={perf.thumbnail} alt={perf.title} width={48} height={32} className="w-12 h-8 object-cover rounded shadow-sm" />
          ) : (
            <div className="w-12 h-8 bg-gray-100 flex items-center justify-center rounded">
              <PlayCircle className="w-4 h-4 text-gray-400" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-medium text-gray-900 truncate max-w-48">
                {perf.title}
              </p>
              {perf.isFeatured && (
                <Star className="w-3.5 h-3.5 text-yellow-500 shrink-0 fill-current" />
              )}
            </div>
            {perf.genre && (
              <p className="text-gray-400 text-[11px] mt-0.5">
                {perf.genre}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Trạng thái',
      className: 'text-center',
      render: (perf) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_COLORS[perf.status]}`}
        >
          {STATUS_LABELS[perf.status]}
        </span>
      ),
    },
    {
      header: 'Loại',
      className: 'text-center',
      render: (perf) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
            perf.isFree ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {perf.isFree ? 'Miễn phí' : 'Trả phí'}
        </span>
      ),
    },
    {
      header: 'Giá',
      className: 'text-center',
      render: (perf) => {
        if (perf.isFree) return <span className="text-blue-600 text-[11px] font-medium">Miễn phí</span>;
        if (!perf.price) return <span className="text-gray-400 text-[11px]">Chưa có</span>;
        const formatted = new Intl.NumberFormat('vi-VN').format(perf.price);
        return (
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-semibold text-gray-800 text-[12px]">{formatted}đ</span>
            <span className="text-gray-400 text-[10px]">mua đứt</span>
          </div>
        );
      },
    },
    {
      header: 'Thời lượng',
      className: 'text-center',
      render: (perf) => <span className="text-gray-600">{perf.duration ? `${perf.duration}s` : '—'}</span>,
    },
    {
      header: 'Hành động',
      className: 'text-right',
      render: (perf) => (
        <div className="flex justify-end">
          <RowActionsMenu
            actions={[
              {
                label: 'Xem chi tiết',
                icon: Eye,
                href: `/admin/content/repertoire-management/${perf._id}`,
              },
              {
                label: 'Duyệt tiết mục',
                icon: CheckCircle,
                hidden: perf.status !== 'pending',
                onClick: () => handleApprove(perf),
              },
              { label: 'Chỉnh sửa', icon: Pencil, onClick: () => handleEdit(perf) },
              {
                label: 'Xoá',
                icon: Trash2,
                variant: 'destructive',
                separatorBefore: true,
                disabled: isDeleting === perf._id,
                onClick: () => handleDelete(perf._id),
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-5 w-full">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Music className="w-6 h-6 text-[#2d6a4f]" />
            Quản lý Tiết mục (Repertoire)
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Danh sách các tiết mục biểu diễn, âm nhạc
          </p>
        </div>
        <ActionButton icon={Plus} onClick={handleCreate} className="w-full sm:w-auto justify-center">
          Thêm tiết mục
        </ActionButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm flex items-center gap-3"
              >
                <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-10" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))
          : [
              {
                label: 'Tổng tiết mục',
                value: stats.total,
                icon: Music,
                iconBg: 'bg-blue-50',
                iconColor: 'text-blue-600',
              },
              {
                label: 'Đã xuất bản',
                value: stats.published,
                icon: PlayCircle,
                iconBg: 'bg-emerald-50',
                iconColor: 'text-[#2d6a4f]',
              },
              {
                label: 'Chờ duyệt',
                value: stats.pending,
                icon: Clock,
                iconBg: 'bg-amber-50',
                iconColor: 'text-amber-600',
              },
              {
                label: 'Nổi bật',
                value: stats.featured,
                icon: Star,
                iconBg: 'bg-yellow-50',
                iconColor: 'text-yellow-500',
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm flex items-center gap-3"
                >
                  <div
                    className={`w-9 h-9 rounded-lg ${s.iconBg} flex items-center justify-center shrink-0`}
                  >
                    <Icon className={`w-4 h-4 ${s.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 leading-none">
                      {s.value}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {s.label}
                    </p>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center gap-3">
        <FilterInput
          value={search}
          onChange={setSearch}
          placeholder="Tìm kiếm tiết mục..."
          className="w-full sm:flex-1 sm:min-w-48"
        />
        <FilterSelect
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as PerformanceStatus | 'all')}
          options={[
            { value: 'published', label: 'Xuất bản' },
            { value: 'pending', label: 'Chờ duyệt' },
            { value: 'archived', label: 'Lưu trữ' },
          ]}
          placeholder="Tất cả trạng thái"
          className="w-full sm:w-40"
        />
        <span className="text-[12px] text-gray-400 w-full sm:w-auto sm:ml-auto">
          {filtered.length} tiết mục
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={paginated}
          isLoading={isLoading}
          emptyIcon={Music}
          emptyMessage="Không có tiết mục nào"
          keyExtractor={(p) => p._id}
          indexOffset={(page - 1) * PAGE_SIZE}
        />
        
        {!isLoading && filtered.length > PAGE_SIZE && (
          <div className="px-5 py-1 border-t border-gray-100">
            <Pagination
              total={filtered.length}
              page={page}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              showPageSizeSelector={false}
            />
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <PerformanceFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        performance={editTarget}
        isSaving={isSaving}
        onSave={handleSave}
      />

      {/* Approve Dialog */}
      <ApprovePerformanceDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        performance={approveTarget}
        onDone={fetchPerformances}
      />
    </div>
  );
}
