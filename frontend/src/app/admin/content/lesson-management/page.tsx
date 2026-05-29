'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { lessonApi } from '@/lib/api/lesson.api';
import { courseApi } from '@/lib/api/course.api';
import { Lesson, CreateLessonInput } from '@/types/lesson.types';
import { Course } from '@/types/course.types';
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
  Pencil,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  Video,
} from 'lucide-react';

export default function LessonManagementPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'published' | 'draft'
  >('all');
  const [freeFilter, setFreeFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

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
      if (search && !l.title.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      if (freeFilter === 'free' && !l.isFree) return false;
      if (freeFilter === 'paid' && l.isFree) return false;
      return true;
    });
  }, [lessons, search, statusFilter, freeFilter]);

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

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài học này?')) return;
    try {
      setIsDeleting(id);
      await lessonApi.delete(id);
      toast.success('Đã xóa bài học');
      fetchData();
    } catch {
      toast.error('Lỗi khi xóa bài học');
    } finally {
      setIsDeleting(null);
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

  return (
    <div className="p-6 space-y-5 max-w-350">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý bài học</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Toàn bộ nội dung bài học trên nền tảng Lenfolk
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white text-[13px] h-9"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Thêm bài học
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
            placeholder="Tìm kiếm bài học..."
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
            <SelectItem value="published">Đã xuất bản</SelectItem>
            <SelectItem value="draft">Bản nháp</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={freeFilter}
          onValueChange={(v) => setFreeFilter(v as typeof freeFilter)}
        >
          <SelectTrigger className="w-32 h-9 text-[13px]">
            <SelectValue placeholder="Loại" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="free">Miễn phí</SelectItem>
            <SelectItem value="paid">Trả phí</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-[12px] text-gray-400 ml-auto">
          {filtered.length} bài học
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">
                Tên bài học
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">
                Khóa học
              </th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">
                Thứ tự
              </th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">
                Trạng thái
              </th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">
                Loại
              </th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">
                Thời lượng
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
                    <Skeleton className="h-4 w-48" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Skeleton className="h-4 w-8 mx-auto" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Skeleton className="h-5 w-20 mx-auto rounded-full" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Skeleton className="h-5 w-16 mx-auto rounded-full" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Skeleton className="h-4 w-12 mx-auto" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Skeleton className="h-7 w-20 ml-auto" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-gray-400 text-[13px]"
                >
                  Không có bài học nào
                </td>
              </tr>
            ) : (
              filtered.map((lesson) => (
                <tr
                  key={lesson._id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 truncate max-w-56">
                      {lesson.title}
                    </p>
                    {lesson.description && (
                      <p className="text-gray-400 text-[11px] truncate max-w-56 mt-0.5">
                        {lesson.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 truncate max-w-40">
                    {courseMap[lesson.courseId] ?? (
                      <span className="text-gray-400 italic">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {lesson.order}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        lesson.status === 'published'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {lesson.status === 'published' ? 'Xuất bản' : 'Nháp'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        lesson.isFree
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {lesson.isFree ? 'Miễn phí' : 'Trả phí'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {lesson.duration
                      ? `${Math.floor(lesson.duration / 60)}:${String(lesson.duration % 60).padStart(2, '0')}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleEdit(lesson)}
                        className="p-1.5 rounded-md hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(lesson._id)}
                        disabled={isDeleting === lesson._id}
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
      <LessonFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        lesson={editTarget}
        courses={courses}
        isSaving={isSaving}
        onSave={handleSave}
      />
    </div>
  );
}

/* ─── Inline Form Dialog ─── */
interface LessonFormDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lesson: Lesson | null;
  courses: Course[];
  isSaving: boolean;
  onSave: (data: CreateLessonInput) => void;
}

function LessonFormDialog({
  open,
  onOpenChange,
  lesson,
  courses,
  isSaving,
  onSave,
}: LessonFormDialogProps) {
  const [form, setForm] = useState<CreateLessonInput>({
    courseId: '',
    title: '',
    description: '',
    videoUrl: '',
    audioUrl: '',
    order: 1,
    duration: undefined,
    status: 'draft',
    isFree: false,
    techniques: [],
  });

  useEffect(() => {
    if (lesson) {
      setForm({
        courseId: lesson.courseId,
        title: lesson.title,
        description: lesson.description ?? '',
        videoUrl: lesson.videoUrl ?? '',
        audioUrl: lesson.audioUrl ?? '',
        order: lesson.order,
        duration: lesson.duration,
        status: lesson.status,
        isFree: lesson.isFree,
        techniques: lesson.techniques ?? [],
      });
    } else {
      setForm({
        courseId: '',
        title: '',
        description: '',
        videoUrl: '',
        audioUrl: '',
        order: 1,
        duration: undefined,
        status: 'draft',
        isFree: false,
        techniques: [],
      });
    }
  }, [lesson, open]);

  const set = <K extends keyof CreateLessonInput>(
    k: K,
    v: CreateLessonInput[K],
  ) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.courseId) {
      toast.error('Vui lòng điền tiêu đề và chọn khóa học');
      return;
    }
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {lesson ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Tên bài học *</Label>
              <Input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Nhập tên bài học"
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Khóa học *</Label>
              <Select
                value={form.courseId}
                onValueChange={(v) => set('courseId', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn khóa học" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Thứ tự</Label>
              <Input
                type="number"
                min={1}
                value={form.order}
                onChange={(e) => set('order', Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Thời lượng (giây)</Label>
              <Input
                type="number"
                min={0}
                value={form.duration ?? ''}
                onChange={(e) =>
                  set(
                    'duration',
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                placeholder="Không bắt buộc"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Trạng thái</Label>
              <Select
                value={form.status}
                onValueChange={(v) => set('status', v as 'draft' | 'published')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Bản nháp</SelectItem>
                  <SelectItem value="published">Xuất bản</SelectItem>
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
            <div className="col-span-2 space-y-1.5">
              <Label>Mô tả</Label>
              <Textarea
                value={form.description ?? ''}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Mô tả ngắn về bài học"
                rows={2}
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>URL video</Label>
              <Input
                value={form.videoUrl ?? ''}
                onChange={(e) => set('videoUrl', e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>URL audio</Label>
              <Input
                value={form.audioUrl ?? ''}
                onChange={(e) => set('audioUrl', e.target.value)}
                placeholder="https://..."
              />
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
              {isSaving ? 'Đang lưu...' : lesson ? 'Cập nhật' : 'Tạo bài học'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
