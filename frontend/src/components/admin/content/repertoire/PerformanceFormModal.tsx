'use client';

import { useState, useEffect } from 'react';
import {
  Performance,
  PerformanceStatus,
  CreatePerformanceInput,
} from '@/types/performance.types';
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
import { Image as ImageIcon, Music, Loader2, X } from 'lucide-react';
import { performanceSchema, zodFieldErrors } from '@/schema/form.schema';

type PerformanceFormField =
  | 'title'
  | 'thumbnail'
  | 'existingImageUrls'
  | 'imageUrls'
  | 'videoUrl'
  | 'genre'
  | 'duration'
  | 'price'
  | 'documents';
type PerformanceFormErrors = Partial<Record<PerformanceFormField, string>>;

interface PerformanceFormModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  performance: Performance | null;
  isSaving: boolean;
  onSave: (data: CreatePerformanceInput) => void;
}

const EMPTY_FORM: CreatePerformanceInput = {
  title: '',
  description: '',
  thumbnail: '',
  existingImageUrls: [],
  imageUrls: [],
  videoUrl: '',
  genre: '',
  isFree: true,
  duration: undefined,
  tags: [],
  isFeatured: false,
  documents: undefined,
  price: undefined,
};

export function PerformanceFormModal({
  open,
  onOpenChange,
  performance,
  isSaving,
  onSave,
}: PerformanceFormModalProps) {
  const [form, setForm] = useState<CreatePerformanceInput>(EMPTY_FORM);
  const [tagsInput, setTagsInput] = useState('');
  const [fieldErrors, setFieldErrors] = useState<PerformanceFormErrors>({});

  useEffect(() => {
    if (performance) {
      setForm({
        title: performance.title,
        description: performance.description ?? '',
        thumbnail: performance.thumbnail ?? '',
        existingImageUrls: performance.imageUrls ?? [],
        imageUrls: [],
        videoUrl: performance.videoUrl ?? '',
        genre: performance.genre ?? '',
        status: performance.status,
        isFree: performance.isFree,
        duration: performance.duration,
        tags: performance.tags ?? [],
        isFeatured: performance.isFeatured ?? false,
        documents: undefined,
        // Giá nằm thẳng trên tiết mục (mua đứt)
        price: performance.price ?? undefined,
      });
      setTagsInput((performance.tags ?? []).join(', '));
      setFieldErrors({});
    } else {
      setForm(EMPTY_FORM);
      setTagsInput('');
      setFieldErrors({});
    }
  }, [performance, open]);

  const set = <K extends keyof CreatePerformanceInput>(
    k: K,
    v: CreatePerformanceInput[K],
  ) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    if (k in fieldErrors) {
      setFieldErrors((prev) => ({ ...prev, [k]: undefined }));
    }
  };

  const renderFieldError = (field: PerformanceFormField) =>
    fieldErrors[field] ? (
      <p className="text-[11px] font-medium text-red-500">
        {fieldErrors[field]}
      </p>
    ) : null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});
    if (!form.title.trim()) {
      setFieldErrors({ title: 'Vui lòng nhập tên tiết mục' });
      return;
    }
    if (!form.isFree && !form.price) {
      setFieldErrors({ price: 'Vui lòng nhập giá cho tiết mục trả phí' });
      return;
    }
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    // Nếu miễn phí thì không gửi giá
    const parsed = performanceSchema.safeParse({ ...form, tags });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors<PerformanceFormField>(parsed.error));
      return;
    }

    const payload: CreatePerformanceInput = parsed.data;
    if (payload.isFree) {
      delete payload.price;
    }
    onSave(payload);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={Music}
      title={performance ? 'Chỉnh sửa tiết mục' : 'Thêm tiết mục mới'}
      description={
        performance
          ? 'Cập nhật thông tin, video và tài liệu cho tiết mục.'
          : 'Tạo tiết mục mới cho thư viện biểu diễn.'
      }
      className="sm:max-w-2xl"
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
            {isSaving ? 'Đang lưu...' : performance ? 'Cập nhật' : 'Tạo tiết mục'}
          </Button>
        </>
      }
    >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Tên tiết mục *</Label>
              <Input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Nhập tên tiết mục"
              />
              {renderFieldError('title')}
            </div>

            <div className="space-y-1.5">
              <Label>Trạng thái (Admin)</Label>
              <Select
                value={form.status ?? 'pending'}
                onValueChange={(v) => set('status', v as PerformanceStatus)}
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
              <Label>Loại hình</Label>
              <Select
                value={form.isFree ? 'free' : 'paid'}
                onValueChange={(v) => {
                  set('isFree', v === 'free');
                  if (v === 'free') {
                    set('price', undefined);
                  }
                }}
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

            {/* Giá chỉ khi trả phí — tiết mục bán mua đứt 1 lần */}
            {!form.isFree && (
              <div className="space-y-1.5">
                <Label>Giá mua đứt (VND) *</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.price ?? ''}
                  onChange={(e) =>
                    set('price', e.target.value ? Number(e.target.value) : undefined)
                  }
                  placeholder="50000"
                />
                {renderFieldError('price')}
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Thể loại (Genre)</Label>
              <Input
                value={form.genre ?? ''}
                onChange={(e) => set('genre', e.target.value)}
                placeholder="Pop, Classical..."
              />
              {renderFieldError('genre')}
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
                placeholder="180"
              />
              {renderFieldError('duration')}
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label>Video URL</Label>
              <Input
                value={form.videoUrl ?? ''}
                onChange={(e) => set('videoUrl', e.target.value)}
                placeholder="https://..."
              />
              {renderFieldError('videoUrl')}
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label>Tài liệu đính kèm</Label>
              <Input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
                onChange={(e) => set('documents', Array.from(e.target.files || []))}
              />
              {performance?.documents && performance.documents.length > 0 && (
                <p className="text-[11px] text-gray-500">
                  Đã có {performance.documents.length} tài liệu. Upload mới sẽ được thêm vào danh sách.
                </p>
              )}
              {renderFieldError('documents')}
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Ảnh sheet nhạc</Label>
              {(form.existingImageUrls?.length ?? 0) > 0 && (
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
                  {form.existingImageUrls!.map((url) => (
                    <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200">
                      <img src={url} alt="Trang sheet nhạc" className="h-full w-full bg-white object-contain" />
                      <button
                        type="button"
                        onClick={() => set('existingImageUrls', (form.existingImageUrls ?? []).filter((u) => u !== url))}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {(form.imageUrls?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.imageUrls!.map((file, i) => (
                    <span key={`new-${i}`} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] text-[#2d6a4f]">
                      <ImageIcon className="h-3 w-3" />
                      <span className="max-w-32 truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => set('imageUrls', (form.imageUrls ?? []).filter((_, idx) => idx !== i))}
                        className="text-[#2d6a4f]/70 hover:text-[#2d6a4f]"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length) set('imageUrls', [...(form.imageUrls ?? []), ...files]);
                  e.target.value = '';
                }}
              />
              <p className="text-[11px] text-gray-500">
                Tải hình trực tiếp từ thiết bị; có thể chọn nhiều ảnh theo đúng thứ tự các trang sheet.
              </p>
              {renderFieldError('imageUrls')}
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label>Ảnh thumbnail (URL, tùy chọn)</Label>
              <Input
                value={form.thumbnail ?? ''}
                onChange={(e) => set('thumbnail', e.target.value)}
                placeholder="https://..."
              />
              {renderFieldError('thumbnail')}
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label>Mô tả</Label>
              <Textarea
                value={form.description ?? ''}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Mô tả nội dung tiết mục"
                rows={2}
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label>Tags (cách nhau bởi dấu phẩy)</Label>
              <Input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="piano, solo"
              />
            </div>

            <div className="col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={form.isFeatured ?? false}
                onChange={(e) => set('isFeatured', e.target.checked)}
                className="w-4 h-4 accent-[#2d6a4f] cursor-pointer"
              />
              <Label htmlFor="isFeatured" className="cursor-pointer">
                Đánh dấu là tiết mục nổi bật
              </Label>
            </div>
          </div>
    </FormDialog>
  );
}
