'use client';

import { useEffect, useState } from 'react';
import { Lesson, CreateLessonInput } from '@/types/lesson.types';
import { Course } from '@/types/course.types';
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
import { Loader2 } from 'lucide-react';
import { lessonSchema, zodFieldErrors } from '@/schema/form.schema';

type LessonFormField =
  | 'courseId'
  | 'title'
  | 'description'
  | 'videoUrl'
  | 'video'
  | 'audioUrl'
  | 'order'
  | 'duration';
type LessonFormErrors = Partial<Record<LessonFormField, string>>;

export interface LessonFormDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lesson: Lesson | null;
  courses: Course[];
  isSaving: boolean;
  onSave: (data: CreateLessonInput) => void;
}

export function LessonFormDialog({
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
    video: undefined,
    status: 'draft',
    isFree: false,
    techniques: [],
  });
  const [fieldErrors, setFieldErrors] = useState<LessonFormErrors>({});

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
        video: undefined,
        status: lesson.status,
        isFree: lesson.isFree,
        techniques: lesson.techniques ?? [],
      });
      setFieldErrors({});
    } else {
      setForm({
        courseId: '',
        title: '',
        description: '',
        videoUrl: '',
        audioUrl: '',
        order: 1,
        duration: undefined,
        video: undefined,
        status: 'draft',
        isFree: false,
        techniques: [],
      });
      setFieldErrors({});
    }
  }, [lesson, open]);

  const set = <K extends keyof CreateLessonInput>(k: K, v: CreateLessonInput[K]) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    if (k in fieldErrors) {
      setFieldErrors((prev) => ({ ...prev, [k]: undefined }));
    }
  };

  const renderFieldError = (field: LessonFormField) =>
    fieldErrors[field] ? (
      <p className="text-[11px] font-medium text-red-500">{fieldErrors[field]}</p>
    ) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    if (!form.title.trim() || !form.courseId) {
      setFieldErrors({
        ...(!form.title.trim() ? { title: 'Vui lòng nhập tên bài học' } : {}),
        ...(!form.courseId ? { courseId: 'Vui lòng chọn khóa học' } : {}),
      });
      return;
    }
    const parsed = lessonSchema.safeParse(form);
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors<LessonFormField>(parsed.error));
      return;
    }
    onSave(parsed.data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{lesson ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Tên bài học *</Label>
              <Input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Nhập tên bài học"
              />
              {renderFieldError('title')}
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Khóa học *</Label>
              <Select value={form.courseId} onValueChange={(v) => set('courseId', v)}>
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
              {renderFieldError('courseId')}
            </div>
            <div className="space-y-1.5">
              <Label>Thứ tự</Label>
              <Input
                type="number"
                min={1}
                value={form.order}
                onChange={(e) => set('order', Number(e.target.value))}
              />
              {renderFieldError('order')}
            </div>
            <div className="space-y-1.5">
              <Label>Thời lượng (giây)</Label>
              <Input
                type="number"
                min={0}
                value={form.duration ?? ''}
                onChange={(e) =>
                  set('duration', e.target.value ? Number(e.target.value) : undefined)
                }
                placeholder="Không bắt buộc"
              />
              {renderFieldError('duration')}
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
              {renderFieldError('videoUrl')}
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Upload video</Label>
              <Input
                type="file"
                accept="video/*"
                onChange={(e) => set('video', e.target.files?.[0])}
              />
              {lesson?.videoUrl && (
                <p className="text-[11px] text-gray-500 truncate">
                  Video hiện tại: {lesson.videoUrl}
                </p>
              )}
              {renderFieldError('video')}
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>URL audio</Label>
              <Input
                value={form.audioUrl ?? ''}
                onChange={(e) => set('audioUrl', e.target.value)}
                placeholder="https://..."
              />
              {renderFieldError('audioUrl')}
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
              {isSaving ? 'Đang lưu...' : lesson ? 'Cập nhật' : 'Tạo bài học'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
