'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { lessonApi } from '@/lib/api/lesson.api';
import { courseApi } from '@/lib/api/course.api';
import { Lesson, CreateLessonInput } from '@/types/lesson.types';
import { Course } from '@/types/course.types';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  BookOpen,
  Clock,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
  Video,
  Eye,
} from 'lucide-react';
import { FilterInput } from '@/common/filter/FilterInput';
import { FilterSelect } from '@/common/filter/FilterSelect';
import { DataTable, Column } from '@/common/table/DataTable';
import { Pagination } from '@/common/pagination/pagination';
import { ActionButton } from '@/common/button/ActionButton';
import { RowActionsMenu } from '@/components/admin/RowActionsMenu';
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog';
import { LessonFormDialog } from '@/components/admin/lesson-management/LessonFormDialog';
import { useDebounce } from '@/hooks/useDebounce';

export default function LessonManagementPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [freeFilter, setFreeFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Lesson | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [lessonsRes, coursesRes] = await Promise.all([
        lessonApi.getAll(),
        courseApi.getAll(),
      ]);
      setLessons(lessonsRes.data || []);
      setCourses(coursesRes.data || []);
    } catch {
      toast.error('Lỗi khi tải dữ liệu bài học');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = useMemo(
    () => ({
      total: lessons.length,
      published: lessons.filter((l) => l.status === 'published').length,
      draft: lessons.filter((l) => l.status === 'draft').length,
      free: lessons.filter((l) => l.isFree).length,
    }),
    [lessons],
  );

  const filtered = useMemo(() => {
    return lessons.filter((l) => {
      if (debouncedSearch && !l.title.toLowerCase().includes(debouncedSearch.toLowerCase()))
        return false;
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      if (freeFilter === 'free' && !l.isFree) return false;
      if (freeFilter === 'paid' && l.isFree) return false;
      return true;
    });
  }, [lessons, debouncedSearch, statusFilter, freeFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [debouncedSearch, statusFilter, freeFilter]);

  const courseMap = useMemo(() => {
    const m: Record<string, string> = {};
    courses.forEach((c) => {
      m[c._id] = c.title;
    });
    return m;
  }, [courses]);

  const handleEdit = (lesson: Lesson) => {
    setEditTarget(lesson);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await lessonApi.delete(deleteTarget._id);
      toast.success('Đã xóa bài học');
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error('Lỗi khi xóa bài học');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async (data: CreateLessonInput) => {
    try {
      setIsSaving(true);
      if (editTarget) {
        await lessonApi.update(editTarget._id, data);
        toast.success('Đã cập nhật bài học');
      } else {
        await lessonApi.create(data);
        toast.success('Đã tạo bài học mới');
      }
      setFormOpen(false);
      fetchData();
    } catch {
      toast.error('Lỗi khi lưu bài học');
    } finally {
      setIsSaving(false);
    }
  };

  const columns: Column<Lesson>[] = [
    {
      header: 'Tên bài học',
      render: (lesson) => (
        <>
          <p className="font-medium text-gray-900 truncate max-w-56">{lesson.title}</p>
          {lesson.description && (
            <p className="text-gray-400 text-[11px] truncate max-w-56 mt-0.5">
              {lesson.description}
            </p>
          )}
        </>
      ),
    },
    {
      header: 'Khóa học',
      render: (lesson) => (
        <span className="text-gray-600 truncate max-w-40 block">
          {courseMap[lesson.courseId] ?? <span className="text-gray-400 italic">—</span>}
        </span>
      ),
    },
    {
      header: 'Thứ tự',
      className: 'text-center',
      render: (lesson) => <span className="text-gray-600">{lesson.order}</span>,
    },
    {
      header: 'Trạng thái',
      className: 'text-center',
      render: (lesson) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
            lesson.status === 'published'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700'
          }`}
        >
          {lesson.status === 'published' ? 'Xuất bản' : 'Nháp'}
        </span>
      ),
    },
    {
      header: 'Loại',
      className: 'text-center',
      render: (lesson) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
            lesson.isFree ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {lesson.isFree ? 'Miễn phí' : 'Trả phí'}
        </span>
      ),
    },
    {
      header: 'Thời lượng',
      className: 'text-center',
      render: (lesson) => (
        <span className="text-gray-600">
          {lesson.duration
            ? `${Math.floor(lesson.duration / 60)}:${String(lesson.duration % 60).padStart(2, '0')}`
            : '—'}
        </span>
      ),
    },
    {
      header: 'Hành động',
      className: 'text-right',
      render: (lesson) => (
        <div className="flex justify-end">
          <RowActionsMenu
            actions={[
              {
                label: 'Xem chi tiết',
                icon: Eye,
                href: `/admin/content/lesson-management/${lesson._id}`,
              },
              { label: 'Chỉnh sửa', icon: Pencil, onClick: () => handleEdit(lesson) },
              {
                label: 'Xoá',
                icon: Trash2,
                variant: 'destructive',
                separatorBefore: true,
                onClick: () => setDeleteTarget(lesson),
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
          <h1 className="text-xl font-bold text-gray-900">Quản lý bài học</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Toàn bộ nội dung bài học trên nền tảng Lenfolk
          </p>
        </div>
        <ActionButton icon={Plus} onClick={handleCreate}>
          Thêm bài học
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
                label: 'Tổng bài học',
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
                label: 'Bản nháp',
                value: stats.draft,
                icon: Clock,
                iconBg: 'bg-amber-50',
                iconColor: 'text-amber-600',
              },
              {
                label: 'Miễn phí',
                value: stats.free,
                icon: Video,
                iconBg: 'bg-violet-50',
                iconColor: 'text-violet-600',
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
          placeholder="Tìm kiếm bài học..."
          className="flex-1 min-w-48"
        />
        <FilterSelect
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as 'all' | 'published' | 'draft')}
          options={[
            { value: 'published', label: 'Đã xuất bản' },
            { value: 'draft', label: 'Bản nháp' },
          ]}
          placeholder="Tất cả trạng thái"
          className="w-36"
        />
        <FilterSelect
          value={freeFilter}
          onChange={(v) => setFreeFilter(v as 'all' | 'free' | 'paid')}
          options={[
            { value: 'free', label: 'Miễn phí' },
            { value: 'paid', label: 'Trả phí' },
          ]}
          placeholder="Tất cả loại"
          className="w-32"
        />
        <span className="text-[12px] text-gray-400 ml-auto">{filtered.length} bài học</span>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={paginated}
          isLoading={isLoading}
          emptyIcon={BookOpen}
          emptyMessage="Không có bài học nào"
          keyExtractor={(l) => l._id}
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

      <LessonFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        lesson={editTarget}
        courses={courses}
        isSaving={isSaving}
        onSave={handleSave}
      />

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}
        title="Xóa bài học"
        description={`Bạn có chắc chắn muốn xóa bài học "${deleteTarget?.title}"? Hành động này không thể hoàn tác.`}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
