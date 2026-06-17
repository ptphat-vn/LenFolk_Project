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
import { FormDialog } from '@/components/admin/FormDialog';
import Image from 'next/image';
import { BookOpen, FileText, Image as ImageIcon, Loader2, Music, Video, X } from 'lucide-react';
import { lessonSchema, zodFieldErrors } from '@/schema/form.schema';

type LessonFormField =
  | 'courseId'
  | 'title'
  | 'description'
  | 'videoUrl'
  | 'video'
  | 'audioUrl'
  | 'audio'
  | 'pdfUrl'
  | 'pdf'
  | 'imageUrls'
  | 'images'
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
    pdfUrl: '',
    imageUrls: [],
    order: 1,
    duration: undefined,
    video: undefined,
    audio: undefined,
    pdf: undefined,
    images: [],
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
        pdfUrl: lesson.pdfUrl ?? '',
        imageUrls: lesson.imageUrls ?? [],
        order: lesson.order,
        duration: lesson.duration,
        video: undefined,
        audio: undefined,
        pdf: undefined,
        images: [],
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
        pdfUrl: '',
        imageUrls: [],
        order: 1,
        duration: undefined,
        video: undefined,
        audio: undefined,
        pdf: undefined,
        images: [],
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
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={BookOpen}
      title={lesson ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}
      description={
        lesson
          ? 'Cập nhật thông tin, video và tài liệu cho bài học.'
          : 'Điền thông tin để tạo bài học mới cho khóa học.'
      }
      onSubmit={handleSubmit}
      footer={
        <>
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
        </>
      }
    >
          {/* ── Thông tin cơ bản ── */}
          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-gray-500">
              <span className="h-3.5 w-1 rounded-full bg-[#2d6a4f]" />
              Thông tin cơ bản
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
              <div className="md:col-span-2 space-y-1.5">
                <Label>Tên bài học *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="Nhập tên bài học"
                />
                {renderFieldError('title')}
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <Label>Khóa học *</Label>
                <Select value={form.courseId} onValueChange={(v) => set('courseId', v)}>
                  <SelectTrigger className="w-full">
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
                  <SelectTrigger className="w-full">
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
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Miễn phí</SelectItem>
                    <SelectItem value="paid">Trả phí</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <Label>Mô tả</Label>
                <Textarea
                  value={form.description ?? ''}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Mô tả ngắn về bài học"
                  rows={3}
                />
              </div>
            </div>
          </section>

          {/* ── Nội dung & tài liệu ── */}
          <section className="space-y-4 border-t pt-6">
            <h3 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-gray-500">
              <span className="h-3.5 w-1 rounded-full bg-[#2d6a4f]" />
              Nội dung & tài liệu
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
              <div className="space-y-1.5">
                <Label>URL video</Label>
                <Input
                  value={form.videoUrl ?? ''}
                  onChange={(e) => set('videoUrl', e.target.value)}
                  placeholder="https://..."
                />
                {renderFieldError('videoUrl')}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lesson-video-file">Upload video</Label>
                <label
                  htmlFor="lesson-video-file"
                  className="flex items-center gap-3 rounded-lg border border-dashed border-gray-300 px-3 py-2.5 transition-colors hover:border-[#2d6a4f] hover:bg-emerald-50/40"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                    <Video className="h-4 w-4 text-[#2d6a4f]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-gray-700">
                      {form.video ? form.video.name : 'Chọn video để tải lên'}
                    </span>
                    <span className="block truncate text-[11px] text-gray-400">
                      {form.video
                        ? `${(form.video.size / 1024 / 1024).toFixed(1)} MB`
                        : lesson?.videoUrl
                          ? 'Đã có video — chọn để thay thế'
                          : 'MP4, MOV, WEBM…'}
                    </span>
                  </span>
                  <input
                    id="lesson-video-file"
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => set('video', e.target.files?.[0])}
                  />
                </label>
                {renderFieldError('video')}
              </div>
              <div className="space-y-1.5">
                <Label>URL audio</Label>
                <Input
                  value={form.audioUrl ?? ''}
                  onChange={(e) => set('audioUrl', e.target.value)}
                  placeholder="https://..."
                />
                {renderFieldError('audioUrl')}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lesson-audio-file">Upload audio</Label>
                <label
                  htmlFor="lesson-audio-file"
                  className="flex items-center gap-3 rounded-lg border border-dashed border-gray-300 px-3 py-2.5 transition-colors hover:border-[#2d6a4f] hover:bg-emerald-50/40"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                    <Music className="h-4 w-4 text-[#2d6a4f]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-gray-700">
                      {form.audio ? form.audio.name : 'Chọn audio để tải lên'}
                    </span>
                    <span className="block truncate text-[11px] text-gray-400">
                      {form.audio
                        ? `${(form.audio.size / 1024 / 1024).toFixed(1)} MB`
                        : lesson?.audioUrl
                          ? 'Đã có audio — chọn để thay thế'
                          : 'MP3, WAV, M4A…'}
                    </span>
                  </span>
                  <input
                    id="lesson-audio-file"
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => set('audio', e.target.files?.[0])}
                  />
                </label>
                {renderFieldError('audio')}
              </div>
              <div className="space-y-1.5">
                <Label>URL tài liệu PDF</Label>
                <Input
                  value={form.pdfUrl ?? ''}
                  onChange={(e) => set('pdfUrl', e.target.value)}
                  placeholder="https://..."
                />
                {renderFieldError('pdfUrl')}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lesson-pdf-file">Upload tài liệu PDF</Label>
                <label
                  htmlFor="lesson-pdf-file"
                  className="flex items-center gap-3 rounded-lg border border-dashed border-gray-300 px-3 py-2.5 transition-colors hover:border-[#2d6a4f] hover:bg-emerald-50/40"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                    <FileText className="h-4 w-4 text-[#2d6a4f]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-gray-700">
                      {form.pdf ? form.pdf.name : 'Chọn tài liệu PDF'}
                    </span>
                    <span className="block truncate text-[11px] text-gray-400">
                      {form.pdf ? (
                        `${(form.pdf.size / 1024 / 1024).toFixed(1)} MB`
                      ) : lesson?.pdfUrl ? (
                        <a
                          href={lesson.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#2d6a4f] underline"
                        >
                          Xem tài liệu hiện tại
                        </a>
                      ) : (
                        'Định dạng PDF'
                      )}
                    </span>
                  </span>
                  <input
                    id="lesson-pdf-file"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => set('pdf', e.target.files?.[0])}
                  />
                </label>
                {renderFieldError('pdf')}
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="lesson-images-file">Hình ảnh minh hoạ</Label>

                {/* Ảnh hiện có (có thể xoá) */}
                {(form.imageUrls?.length ?? 0) > 0 && (
                  <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
                    {form.imageUrls!.map((url) => (
                      <div
                        key={url}
                        className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200"
                      >
                        <Image
                          src={url}
                          alt="Ảnh bài học"
                          fill
                          sizes="120px"
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            set(
                              'imageUrls',
                              (form.imageUrls ?? []).filter((u) => u !== url),
                            )
                          }
                          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Ảnh mới chọn (chưa upload) */}
                {(form.images?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.images!.map((file, i) => (
                      <span
                        key={`new-${i}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] text-[#2d6a4f]"
                      >
                        <ImageIcon className="h-3 w-3" />
                        <span className="max-w-32 truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() =>
                            set(
                              'images',
                              (form.images ?? []).filter((_, idx) => idx !== i),
                            )
                          }
                          className="text-[#2d6a4f]/70 hover:text-[#2d6a4f]"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Chọn thêm ảnh */}
                <label
                  htmlFor="lesson-images-file"
                  className="flex items-center gap-3 rounded-lg border border-dashed border-gray-300 px-3 py-2.5 transition-colors hover:border-[#2d6a4f] hover:bg-emerald-50/40"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                    <ImageIcon className="h-4 w-4 text-[#2d6a4f]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium text-gray-700">
                      Thêm hình ảnh
                    </span>
                    <span className="block text-[11px] text-gray-400">
                      Chọn nhiều ảnh · JPG, PNG, WEBP
                    </span>
                  </span>
                  <input
                    id="lesson-images-file"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? []);
                      if (files.length)
                        set('images', [...(form.images ?? []), ...files]);
                      e.target.value = '';
                    }}
                  />
                </label>
                {renderFieldError('images')}
              </div>
            </div>
          </section>
    </FormDialog>
  );
}
