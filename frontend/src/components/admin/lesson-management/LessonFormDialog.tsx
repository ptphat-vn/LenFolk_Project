'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Lesson,
  LessonLevel,
  LessonStatus,
  LessonType,
} from '@/types/content.types';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface LessonFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson?: Lesson | null;
  onSave: (data: Partial<Lesson>) => void;
}

type FormData = {
  title: string;
  description: string;
  type: LessonType;
  level: LessonLevel;
  status: LessonStatus;
  duration: string;
  author: string;
  authorEmail: string;
  videoUrl: string;
  tags: string;
};

const DEFAULT_FORM: FormData = {
  title: '',
  description: '',
  type: 'video',
  level: 'beginner',
  status: 'draft',
  duration: '',
  author: '',
  authorEmail: '',
  videoUrl: '',
  tags: '',
};

function formFromLesson(lesson?: Lesson | null): FormData {
  if (!lesson) return DEFAULT_FORM;
  return {
    title: lesson.title,
    description: lesson.description,
    type: lesson.type,
    level: lesson.level,
    status: lesson.status,
    duration: String(lesson.duration),
    author: lesson.author,
    authorEmail: lesson.authorEmail,
    videoUrl: lesson.videoUrl ?? '',
    tags: lesson.tags.join(', '),
  };
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

function LessonFormContent({
  isEdit,
  lesson,
  onSave,
  onOpenChange,
}: {
  isEdit: boolean;
  lesson?: Lesson | null;
  onSave: (data: Partial<Lesson>) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = useState<FormData>(() => formFromLesson(lesson));
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const set = (key: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const e: Partial<FormData> = {};
    if (!form.title.trim()) e.title = 'Tiêu đề không được để trống';
    if (!form.description.trim()) e.description = 'Mô tả không được để trống';
    if (!form.author.trim()) e.author = 'Tên giảng viên không được để trống';
    if (!form.authorEmail.trim()) e.authorEmail = 'Email không được để trống';
    if (!form.duration || Number(form.duration) <= 0)
      e.duration = 'Thời lượng phải lớn hơn 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // simulate API
    onSave({
      title: form.title,
      description: form.description,
      type: form.type,
      level: form.level,
      status: form.status,
      duration: Number(form.duration),
      author: form.author,
      authorEmail: form.authorEmail,
      videoUrl: form.videoUrl || undefined,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <>
      <div className="flex min-h-0 overflow-y-auto flex-1">
        {/* ── Left column: basic info + resources ── */}
        <div className="flex-1 min-w-0 px-6 py-5 space-y-5 border-r border-gray-100">
          {/* Basic info */}
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Thông tin cơ bản
            </p>
            <Field label="Tiêu đề bài học" error={errors.title} required>
              <Input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="VD: Kỹ thuật láy hơi nâng cao"
                className="h-10 text-sm"
              />
            </Field>
            <Field label="Mô tả" error={errors.description} required>
              <Textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Mô tả ngắn về nội dung bài học..."
                rows={5}
                className="text-sm resize-none"
              />
            </Field>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Tài nguyên
            </p>
            <Field label="URL Video">
              <Input
                value={form.videoUrl}
                onChange={(e) => set('videoUrl', e.target.value)}
                placeholder="https://..."
                className="h-10 text-sm"
              />
            </Field>
            <Field label="Tags (phân cách bằng dấu phẩy)">
              <Input
                value={form.tags}
                onChange={(e) => set('tags', e.target.value)}
                placeholder="VD: căn bản, kỹ thuật, láy hơi"
                className="h-10 text-sm"
              />
            </Field>
          </div>
        </div>

        {/* ── Right column: config + instructor ── */}
        <div className="w-72 shrink-0 px-6 py-5 space-y-5 bg-gray-50/50">
          {/* Config */}
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Cấu hình
            </p>
            <Field label="Loại nội dung" required>
              <Select
                value={form.type}
                onValueChange={(v) => set('type', v as LessonType)}
              >
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="exercise">Bài tập</SelectItem>
                  <SelectItem value="theory">Lý thuyết</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Cấp độ" required>
              <Select
                value={form.level}
                onValueChange={(v) => set('level', v as LessonLevel)}
              >
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Căn bản</SelectItem>
                  <SelectItem value="intermediate">Trung cấp</SelectItem>
                  <SelectItem value="advanced">Nâng cao</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Trạng thái" required>
              <Select
                value={form.status}
                onValueChange={(v) => set('status', v as LessonStatus)}
              >
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Bản nháp</SelectItem>
                  <SelectItem value="published">Xuất bản</SelectItem>
                  <SelectItem value="archived">Lưu trữ</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Thời lượng (phút)" error={errors.duration} required>
              <Input
                type="number"
                min={1}
                value={form.duration}
                onChange={(e) => set('duration', e.target.value)}
                placeholder="VD: 15"
                className="h-10 text-sm"
              />
            </Field>
          </div>

          {/* Instructor */}
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Giảng viên
            </p>
            <Field label="Tên giảng viên" error={errors.author} required>
              <Input
                value={form.author}
                onChange={(e) => set('author', e.target.value)}
                placeholder="VD: GV. Minh Tú"
                className="h-10 text-sm"
              />
            </Field>
            <Field label="Email giảng viên" error={errors.authorEmail} required>
              <Input
                type="email"
                value={form.authorEmail}
                onChange={(e) => set('authorEmail', e.target.value)}
                placeholder="gv@lenfolk.vn"
                className="h-10 text-sm"
              />
            </Field>
          </div>
        </div>
      </div>
      <DialogFooter className="mb-1 px-6 py-4 border-t border-gray-100 shrink-0">
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={loading}
          className="text-sm"
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white text-sm min-w-32"
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEdit ? 'Lưu thay đổi' : 'Tạo bài học'}
        </Button>
      </DialogFooter>
    </>
  );
}

export function LessonFormDialog({
  open,
  onOpenChange,
  lesson,
  onSave,
}: LessonFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* ✅ FIX: thêm flex flex-col max-h-[90vh] để Footer không bị cut off */}
      <DialogContent className="max-w-4xl sm:max-w-4xl p-0 gap-0 flex flex-col max-h-[90vh]">
        <DialogHeader className="px-6 py-5 border-b border-gray-100 shrink-0">
          <DialogTitle className="text-[18px] font-semibold">
            {lesson ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}
          </DialogTitle>
          <p className="text-[12px] text-gray-500 mt-0.5">
            {lesson
              ? 'Cập nhật thông tin bài học bên dưới'
              : 'Điền đầy đủ thông tin để tạo bài học mới'}
          </p>
        </DialogHeader>

        {open && (
          <LessonFormContent
            key={lesson?.id ?? 'new'}
            isEdit={Boolean(lesson)}
            lesson={lesson}
            onSave={onSave}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
