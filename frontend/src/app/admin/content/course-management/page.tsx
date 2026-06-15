'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import { courseApi } from '@/lib/api/course.api';
import {
  Course,
  CourseLevel,
  CourseStatus,
  CreateCourseInput,
  UpsertCoursePlanInput,
} from '@/types/course.types';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  BookOpen,
  CircleDollarSign,
  Clock,
  Eye,
  Pencil,
  Plus,
  Star,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { FilterInput } from '@/common/filter/FilterInput';
import { FilterSelect } from '@/common/filter/FilterSelect';
import { DataTable, Column } from '@/common/table/DataTable';
import { Pagination } from '@/common/pagination/pagination';
import { ActionButton } from '@/common/button/ActionButton';
import { useDebounce } from '@/hooks/useDebounce';
import { RowActionsMenu } from '@/components/admin/RowActionsMenu';
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog';
import { CourseFormDialog } from '@/components/admin/course-management/CourseFormDialog';
import { CoursePlanDialog } from '@/components/admin/course-management/CoursePlanDialog';

const LEVEL_LABELS: Record<CourseLevel, string> = {
  beginner: 'Cơ bản',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao',
};

const STATUS_LABELS: Record<CourseStatus, string> = {
  pending: 'Chờ duyệt',
  published: 'Xuất bản',
  archived: 'Lưu trữ',
};

const CYCLE_LABELS: Record<string, string> = {
  monthly: 'tháng',
  quarterly: 'quý',
  yearly: 'năm',
};

const LEVEL_COLORS: Record<CourseLevel, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-blue-100 text-blue-700',
  advanced: 'bg-purple-100 text-purple-700',
};

const STATUS_COLORS: Record<CourseStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  published: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-red-100 text-red-600',
};

export default function CourseManagementPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [statusFilter, setStatusFilter] = useState<CourseStatus | 'all'>('all');
  const [levelFilter, setLevelFilter] = useState<CourseLevel | 'all'>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Course | null>(null);
  const [planTarget, setPlanTarget] = useState<Course | null>(null);
  const [planOpen, setPlanOpen] = useState(false);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await courseApi.getAll();
      setCourses(res.data || []);
    } catch {
      toast.error('Lỗi khi tải danh sách khóa học');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const stats = useMemo(
    () => ({
      total: courses.length,
      published: courses.filter((c) => c.status === 'published').length,
      pending: courses.filter((c) => c.status === 'pending').length,
      featured: courses.filter((c) => c.isFeatured).length,
    }),
    [courses],
  );

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      if (debouncedSearch && !c.title.toLowerCase().includes(debouncedSearch.toLowerCase()))
        return false;
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (levelFilter !== 'all' && c.level !== levelFilter) return false;
      return true;
    });
  }, [courses, debouncedSearch, statusFilter, levelFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [debouncedSearch, statusFilter, levelFilter]);

  const handleEdit = (course: Course) => {
    setEditTarget(course);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const handleSetPlan = (course: Course) => {
    setPlanTarget(course);
    setPlanOpen(true);
  };

  const handleSavePlan = async (data: UpsertCoursePlanInput) => {
    if (!planTarget) return;
    try {
      setIsSavingPlan(true);
      await courseApi.setPlan(planTarget._id, data);
      toast.success('Đã cập nhật giá khóa học');
      setPlanOpen(false);
      fetchCourses();
    } catch {
      toast.error('Lỗi khi cập nhật giá');
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await courseApi.delete(deleteTarget._id);
      toast.success('Đã xóa khóa học');
      setDeleteTarget(null);
      fetchCourses();
    } catch (error) {
      const msg = isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message
        : undefined;
      toast.error(msg || 'Lỗi khi xóa khóa học');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async (data: CreateCourseInput) => {
    try {
      setIsSaving(true);
      if (editTarget) {
        await courseApi.update(editTarget._id, data);
        toast.success('Đã cập nhật khóa học');
      } else {
        await courseApi.create(data);
        toast.success('Đã tạo khóa học mới');
      }
      setFormOpen(false);
      fetchCourses();
    } catch {
      toast.error('Lỗi khi lưu khóa học');
    } finally {
      setIsSaving(false);
    }
  };

  const columns: Column<Course>[] = [
    {
      header: 'Tên khóa học',
      render: (course) => (
        <>
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900 truncate max-w-52">{course.title}</p>
            {course.isFeatured && (
              <Star className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
            )}
          </div>
          {course.courseType && (
            <p className="text-gray-400 text-[11px] mt-0.5">{course.courseType}</p>
          )}
        </>
      ),
    },
    {
      header: 'Cấp độ',
      className: 'text-center',
      render: (course) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${LEVEL_COLORS[course.level]}`}
        >
          {LEVEL_LABELS[course.level]}
        </span>
      ),
    },
    {
      header: 'Trạng thái',
      className: 'text-center',
      render: (course) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_COLORS[course.status]}`}
        >
          {STATUS_LABELS[course.status]}
        </span>
      ),
    },
    {
      header: 'Loại',
      className: 'text-center',
      render: (course) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
            course.isFree ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {course.isFree ? 'Miễn phí' : 'Trả phí'}
        </span>
      ),
    },
    {
      header: 'Giá / Gói',
      className: 'text-center',
      render: (course) =>
        course.isFree ? (
          <span className="text-gray-400">Miễn phí</span>
        ) : course.plan ? (
          <span className="text-gray-700 font-medium">
            {course.plan.price.toLocaleString('vi-VN')}đ
            <span className="text-gray-400 font-normal">
              {' '}/{CYCLE_LABELS[course.plan.billingCycle] ?? course.plan.billingCycle}
            </span>
          </span>
        ) : (
          <span className="text-amber-600 text-[11px]">Chưa đặt giá</span>
        ),
    },
    {
      header: 'Bài học',
      className: 'text-center',
      render: (course) => <span className="text-gray-600">{course.totalLessons ?? 0}</span>,
    },
    {
      header: 'Học viên',
      className: 'text-center',
      render: (course) => <span className="text-gray-600">{course.enrollCount ?? 0}</span>,
    },
    {
      header: 'Hành động',
      className: 'text-right',
      render: (course) => (
        <div className="flex justify-end">
          <RowActionsMenu
            actions={[
              {
                label: 'Xem chi tiết',
                icon: Eye,
                href: `/admin/content/course-management/${course._id}`,
              },
              {
                label: 'Đặt giá / gói',
                icon: CircleDollarSign,
                hidden: course.isFree,
                onClick: () => handleSetPlan(course),
              },
              {
                label: 'Chỉnh sửa',
                icon: Pencil,
                onClick: () => handleEdit(course),
              },
              {
                label: 'Xoá',
                icon: Trash2,
                variant: 'destructive',
                separatorBefore: true,
                disabled: (course.totalLessons ?? 0) > 0,
                onClick: () => {
                  if ((course.totalLessons ?? 0) > 0) {
                    toast.error('Không thể xoá khóa học còn bài học. Hãy xoá hết bài học trước.');
                    return;
                  }
                  setDeleteTarget(course);
                },
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-5 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý khóa học</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Toàn bộ khóa học trên nền tảng Lenfolk
          </p>
        </div>
        <ActionButton icon={Plus} onClick={handleCreate}>
          Thêm khóa học
        </ActionButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
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
                label: 'Tổng khóa học',
                value: stats.total,
                icon: BookOpen,
                iconBg: 'bg-blue-50',
                iconColor: 'text-blue-600',
              },
              {
                label: 'Đã xuất bản',
                value: stats.published,
                icon: TrendingUp,
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
                    <p className="text-lg font-bold text-gray-900 leading-none">{s.value}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{s.label}</p>
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
          placeholder="Tìm kiếm khóa học..."
          className="flex-1 min-w-48"
        />
        <FilterSelect
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as CourseStatus | 'all')}
          options={[
            { value: 'published', label: 'Xuất bản' },
            { value: 'pending', label: 'Chờ duyệt' },
            { value: 'draft', label: 'Bản nháp' },
            { value: 'archived', label: 'Lưu trữ' },
          ]}
          placeholder="Tất cả trạng thái"
          className="w-36"
        />
        <FilterSelect
          value={levelFilter}
          onChange={(v) => setLevelFilter(v as CourseLevel | 'all')}
          options={[
            { value: 'beginner', label: 'Cơ bản' },
            { value: 'intermediate', label: 'Trung cấp' },
            { value: 'advanced', label: 'Nâng cao' },
          ]}
          placeholder="Tất cả cấp độ"
          className="w-32"
        />
        <span className="text-[12px] text-gray-400 ml-auto">{filtered.length} khóa học</span>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={paginated}
          isLoading={isLoading}
          emptyIcon={BookOpen}
          emptyMessage="Không có khóa học nào"
          keyExtractor={(c) => c._id}
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

      <CourseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        course={editTarget}
        isSaving={isSaving}
        onSave={handleSave}
      />

      <CoursePlanDialog
        open={planOpen}
        onOpenChange={setPlanOpen}
        course={planTarget}
        isSaving={isSavingPlan}
        onSave={handleSavePlan}
      />

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}
        title="Xóa khóa học"
        description={`Bạn có chắc chắn muốn xóa khóa học "${deleteTarget?.title}"? Hành động này không thể hoàn tác.`}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
