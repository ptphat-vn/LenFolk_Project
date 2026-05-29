'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { courseApi } from '@/lib/api/course.api';
import {
  Course,
  CourseLevel,
  CourseStatus,
  CreateCourseInput,
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
  Search,
  Star,
  Trash2,
  TrendingUp,
} from 'lucide-react';

const LEVEL_LABELS: Record<CourseLevel, string> = {
  beginner: 'Cơ bản',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao',
};

const STATUS_LABELS: Record<CourseStatus, string> = {
  draft: 'Nháp',
  pending: 'Chờ duyệt',
  published: 'Xuất bản',
  archived: 'Lưu trữ',
};

const LEVEL_COLORS: Record<CourseLevel, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-blue-100 text-blue-700',
  advanced: 'bg-purple-100 text-purple-700',
};

const STATUS_COLORS: Record<CourseStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  pending: 'bg-amber-100 text-amber-700',
  published: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-red-100 text-red-600',
};

export default function CourseManagementPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CourseStatus | 'all'>('all');
  const [levelFilter, setLevelFilter] = useState<CourseLevel | 'all'>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

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
      if (search && !c.title.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (levelFilter !== 'all' && c.level !== levelFilter) return false;
      return true;
    });
  }, [courses, search, statusFilter, levelFilter]);

  const handleEdit = (course: Course) => {
    setEditTarget(course);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
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

  return (
    <div className="p-6 space-y-5 max-w-350">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý khóa học</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Toàn bộ khóa học trên nền tảng Lenfolk
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white text-[13px] h-9"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Thêm khóa học
        </Button>
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
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm khóa học..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-[13px]"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
        >
          <SelectTrigger className="w-36 h-9 text-[13px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="published">Xuất bản</SelectItem>
            <SelectItem value="pending">Chờ duyệt</SelectItem>
            <SelectItem value="draft">Bản nháp</SelectItem>
            <SelectItem value="archived">Lưu trữ</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={levelFilter}
          onValueChange={(v) => setLevelFilter(v as typeof levelFilter)}
        >
          <SelectTrigger className="w-32 h-9 text-[13px]">
            <SelectValue placeholder="Cấp độ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả cấp độ</SelectItem>
            <SelectItem value="beginner">Cơ bản</SelectItem>
            <SelectItem value="intermediate">Trung cấp</SelectItem>
            <SelectItem value="advanced">Nâng cao</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-[12px] text-gray-400 ml-auto">
          {filtered.length} khóa học
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">
                Tên khóa học
              </th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">
                Cấp độ
              </th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">
                Trạng thái
              </th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">
                Loại
              </th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">
                Giá
              </th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">
                Bài học
              </th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">
                Học viên
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-52" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Skeleton className="h-5 w-20 mx-auto rounded-full" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Skeleton className="h-5 w-20 mx-auto rounded-full" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Skeleton className="h-5 w-16 mx-auto rounded-full" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Skeleton className="h-4 w-16 mx-auto" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Skeleton className="h-4 w-8 mx-auto" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Skeleton className="h-4 w-8 mx-auto" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Skeleton className="h-7 w-20 ml-auto" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-12 text-center text-gray-400 text-[13px]"
                >
                  Không có khóa học nào
                </td>
              </tr>
            ) : (
              filtered.map((course) => (
                <tr
                  key={course._id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-3">
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
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${LEVEL_COLORS[course.level]}`}
                    >
                      {LEVEL_LABELS[course.level]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_COLORS[course.status]}`}
                    >
                      {STATUS_LABELS[course.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        course.isFree
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {course.isFree ? 'Miễn phí' : 'Trả phí'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {course.isFree
                      ? '—'
                      : course.price
                        ? `${course.price.toLocaleString('vi-VN')}đ`
                        : '—'}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {course.totalLessons ?? 0}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {course.enrollCount ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleEdit(course)}
                        className="p-1.5 rounded-md hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(course._id)}
                        disabled={isDeleting === course._id}
                        className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form Dialog */}
      <CourseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        course={editTarget}
        isSaving={isSaving}
        onSave={handleSave}
      />
    </div>
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
    status: 'draft',
    courseType: '',
    isFree: true,
    price: undefined,
    tags: [],
    isFeatured: false,
  });
  const [tagsInput, setTagsInput] = useState('');

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
        price: course.price,
        tags: course.tags ?? [],
        isFeatured: course.isFeatured ?? false,
      });
      setTagsInput((course.tags ?? []).join(', '));
    } else {
      setForm({
        title: '',
        description: '',
        thumbnail: '',
        level: 'beginner',
        status: 'draft',
        courseType: '',
        isFree: true,
        price: undefined,
        tags: [],
        isFeatured: false,
      });
      setTagsInput('');
    }
  }, [course, open]);

  const set = <K extends keyof CreateCourseInput>(
    k: K,
    v: CreateCourseInput[K],
  ) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Vui lòng nhập tên khóa học');
      return;
    }
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    onSave({ ...form, tags });
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
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Tên khóa học *</Label>
              <Input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Nhập tên khóa học"
              />
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
                  <SelectItem value="draft">Bản nháp</SelectItem>
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
              <div className="col-span-2 space-y-1.5">
                <Label>Giá (VNĐ)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.price ?? ''}
                  onChange={(e) =>
                    set(
                      'price',
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  placeholder="0"
                />
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
              className="bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white"
            >
              {isSaving ? 'Đang lưu...' : course ? 'Cập nhật' : 'Tạo khóa học'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
