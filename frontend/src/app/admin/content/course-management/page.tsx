'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { courseApi } from '@/lib/api/course.api';
import {
  Course,
  CourseLevel,
  CourseStatus,
  CreateCourseInput,
  UpsertCoursePlanInput,
} from '@/types/course.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  BookOpen,
  Clock,
  Layers,
  Pencil,
  Plus,
  Star,
  Trash2,
  TrendingUp,
  Loader2,
  Eye,
  CircleDollarSign,
} from 'lucide-react';
import { FilterInput } from '@/common/filter/FilterInput';
import { FilterSelect } from '@/common/filter/FilterSelect';
import { DataTable, Column } from '@/common/table/DataTable';
import { Pagination } from '@/common/pagination/pagination';
import { ActionButton } from '@/common/button/ActionButton';
import { useDebounce } from '@/hooks/useDebounce';
import { RowActionsMenu } from '@/components/admin/RowActionsMenu';
import { courseSchema, coursePlanSchema, zodFieldErrors, firstZodError } from '@/schema/form.schema';
import type { BillingCycle } from '@/types/course.types';

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

type CourseFormField =
  | 'title'
  | 'description'
  | 'thumbnail'
  | 'level'
  | 'status'
  | 'courseType';
type CourseFormErrors = Partial<Record<CourseFormField, string>>;

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
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
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

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khóa học này?')) return;
    try {
      setIsDeleting(id);
      await courseApi.delete(id);
      toast.success('Đã xóa khóa học');
      fetchCourses();
    } catch {
      toast.error('Lỗi khi xóa khóa học');
    } finally {
      setIsDeleting(null);
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
            <p className="font-medium text-gray-900 truncate max-w-52">
              {course.title}
            </p>
            {course.isFeatured && (
              <Star className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
            )}
          </div>
          {course.courseType && (
            <p className="text-gray-400 text-[11px] mt-0.5">
              {course.courseType}
            </p>
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
              { label: 'Chỉnh sửa', icon: Pencil, onClick: () => handleEdit(course) },
              {
                label: 'Xoá',
                icon: Trash2,
                variant: 'destructive',
                separatorBefore: true,
                disabled: isDeleting === course._id,
                onClick: () => handleDelete(course._id),
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
        <span className="text-[12px] text-gray-400 ml-auto">
          {filtered.length} khóa học
        </span>
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
      <CourseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        course={editTarget}
        isSaving={isSaving}
        onSave={handleSave}
      />

      {/* Plan (giá) Dialog */}
      <CoursePlanDialog
        open={planOpen}
        onOpenChange={setPlanOpen}
        course={planTarget}
        isSaving={isSavingPlan}
        onSave={handleSavePlan}
      />
    </div>
  );
}

/* ─── Course Plan (giá) Dialog ─── */
interface CoursePlanDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  course: Course | null;
  isSaving: boolean;
  onSave: (data: UpsertCoursePlanInput) => void;
}

function CoursePlanDialog({
  open,
  onOpenChange,
  course,
  isSaving,
  onSave,
}: CoursePlanDialogProps) {
  const [price, setPrice] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (course?.plan) {
      setPrice(String(course.plan.price ?? ''));
      setBillingCycle((course.plan.billingCycle as BillingCycle) ?? 'monthly');
    } else {
      setPrice('');
      setBillingCycle('monthly');
    }
    setError(null);
  }, [course, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = coursePlanSchema.safeParse({
      price: price === '' ? undefined : Number(price),
      billingCycle,
    });
    if (!parsed.success) {
      setError(firstZodError(parsed.error));
      return;
    }
    onSave({ price: parsed.data.price, billingCycle: parsed.data.billingCycle });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CircleDollarSign className="w-4 h-4 text-amber-600" />
            Đặt giá khóa học
          </DialogTitle>
        </DialogHeader>
        {course && (
          <p className="text-[13px] text-gray-500 -mt-1">
            <span className="font-medium text-gray-700">{course.title}</span> — bán theo gói chu kỳ.
          </p>
        )}
        <form onSubmit={handleSubmit} noValidate className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Giá (VNĐ) *</Label>
            <Input
              type="number"
              min={0}
              step={1000}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="VD: 199000"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Chu kỳ thanh toán *</Label>
            <Select
              value={billingCycle}
              onValueChange={(v) => setBillingCycle(v as BillingCycle)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Hàng tháng</SelectItem>
                <SelectItem value="quarterly">Hàng quý (3 tháng)</SelectItem>
                <SelectItem value="yearly">Hàng năm</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-[11px] font-medium text-red-500">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSaving ? 'Đang lưu...' : 'Lưu giá'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Inline Course Form Dialog ─── */
interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  course: Course | null;
  isSaving: boolean;
  onSave: (data: CreateCourseInput) => void;
}

function CourseFormDialog({
  open,
  onOpenChange,
  course,
  isSaving,
  onSave,
}: CourseFormDialogProps) {
  const [form, setForm] = useState<CreateCourseInput>({
    title: '',
    description: '',
    thumbnail: '',
    level: 'beginner',
    status: 'pending',
    courseType: '',
    isFree: true,
    tags: [],
    isFeatured: false,
  });
  const [tagsInput, setTagsInput] = useState('');
  const [fieldErrors, setFieldErrors] = useState<CourseFormErrors>({});

  useEffect(() => {
    if (course) {
      setForm({
        title: course.title,
        description: course.description ?? '',
        thumbnail: course.thumbnail ?? '',
        level: course.level,
        status: course.status,
        courseType: course.courseType ?? '',
        isFree: course.isFree,
        tags: course.tags ?? [],
        isFeatured: course.isFeatured ?? false,
      });
      setTagsInput((course.tags ?? []).join(', '));
      setFieldErrors({});
    } else {
      setForm({
        title: '',
        description: '',
        thumbnail: '',
        level: 'beginner',
        status: 'pending',
        courseType: '',
        isFree: true,
        tags: [],
        isFeatured: false,
      });
      setTagsInput('');
      setFieldErrors({});
    }
  }, [course, open]);

  const set = <K extends keyof CreateCourseInput>(
    k: K,
    v: CreateCourseInput[K],
  ) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    if (k in fieldErrors) {
      setFieldErrors((prev) => ({ ...prev, [k]: undefined }));
    }
  };

  const renderFieldError = (field: CourseFormField) =>
    fieldErrors[field] ? (
      <p className="text-[11px] font-medium text-red-500">
        {fieldErrors[field]}
      </p>
    ) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    if (!form.title.trim()) {
      setFieldErrors({ title: 'Vui lòng nhập tên khóa học' });
      return;
    }
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const parsed = courseSchema.safeParse({ ...form, tags });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors<CourseFormField>(parsed.error));
      return;
    }
    onSave(parsed.data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#2d6a4f]" />
            {course ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Tên khóa học *</Label>
              <Input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Nhập tên khóa học"
              />
              {renderFieldError('title')}
            </div>
            <div className="space-y-1.5">
              <Label>Cấp độ</Label>
              <Select
                value={form.level}
                onValueChange={(v) => set('level', v as CourseLevel)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Cơ bản</SelectItem>
                  <SelectItem value="intermediate">Trung cấp</SelectItem>
                  <SelectItem value="advanced">Nâng cao</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Trạng thái</Label>
              <Select
                value={form.status}
                onValueChange={(v) => set('status', v as CourseStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Chờ duyệt</SelectItem>
                  <SelectItem value="published">Xuất bản</SelectItem>
                  <SelectItem value="archived">Lưu trữ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Loại</Label>
              <Select
                value={form.isFree ? 'free' : 'paid'}
                onValueChange={(v) => set('isFree', v === 'free')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Miễn phí</SelectItem>
                  <SelectItem value="paid">Trả phí</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Loại khóa học</Label>
              <Input
                value={form.courseType ?? ''}
                onChange={(e) => set('courseType', e.target.value)}
                placeholder="foundation, advanced..."
              />
            </div>
            {!form.isFree && (
              <div className="col-span-2 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
                <CircleDollarSign className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-[12px] text-amber-700">
                  Giá khóa học trả phí được đặt riêng bằng nút{' '}
                  <span className="font-semibold">Đặt giá</span> (biểu tượng $) ở
                  bảng danh sách, theo gói chu kỳ tháng/quý/năm.
                </p>
              </div>
            )}
            <div className="col-span-2 space-y-1.5">
              <Label>Mô tả</Label>
              <Textarea
                value={form.description ?? ''}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Mô tả nội dung khóa học"
                rows={2}
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Ảnh thumbnail (URL)</Label>
              <Input
                value={form.thumbnail ?? ''}
                onChange={(e) => set('thumbnail', e.target.value)}
                placeholder="https://..."
              />
              {renderFieldError('thumbnail')}
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Tags (cách nhau bởi dấu phẩy)</Label>
              <Input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="guitar, acoustic, beginner"
              />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={form.isFeatured ?? false}
                onChange={(e) => set('isFeatured', e.target.checked)}
                className="w-4 h-4 accent-[#2d6a4f]"
              />
              <Label htmlFor="isFeatured" className="cursor-pointer">
                Đánh dấu là khóa học nổi bật
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSaving ? 'Đang lưu...' : course ? 'Cập nhật' : 'Tạo khóa học'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
