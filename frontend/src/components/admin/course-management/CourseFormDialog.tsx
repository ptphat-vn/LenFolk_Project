'use client';

import { useEffect, useState } from 'react';
import { Course, CourseLevel, CourseStatus, CreateCourseInput } from '@/types/course.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { CircleDollarSign, Layers, Loader2 } from 'lucide-react';
import { courseSchema, zodFieldErrors } from '@/schema/form.schema';

type CourseFormField =
  | 'title'
  | 'description'
  | 'thumbnail'
  | 'level'
  | 'status'
  | 'courseType';
type CourseFormErrors = Partial<Record<CourseFormField, string>>;

export interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  course: Course | null;
  isSaving: boolean;
  onSave: (data: CreateCourseInput) => void;
}

export function CourseFormDialog({
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

  const set = <K extends keyof CreateCourseInput>(k: K, v: CreateCourseInput[K]) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    if (k in fieldErrors) {
      setFieldErrors((prev) => ({ ...prev, [k]: undefined }));
    }
  };

  const renderFieldError = (field: CourseFormField) =>
    fieldErrors[field] ? (
      <p className="text-[11px] font-medium text-red-500">{fieldErrors[field]}</p>
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
              <Select value={form.level} onValueChange={(v) => set('level', v as CourseLevel)}>
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
              <Select value={form.status} onValueChange={(v) => set('status', v as CourseStatus)}>
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
                  <span className="font-semibold">Đặt giá</span> (biểu tượng $) ở bảng danh sách,
                  theo gói chu kỳ tháng/quý/năm.
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
