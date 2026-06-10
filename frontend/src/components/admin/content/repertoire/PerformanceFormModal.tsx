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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Layers, Loader2 } from 'lucide-react';
import { performanceSchema, zodFieldErrors } from '@/schema/form.schema';

type PerformanceFormField =
  | 'title'
  | 'thumbnail'
  | 'videoUrl'
  | 'genre'
  | 'duration'
  | 'price'
  | 'billingCycle'
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
  videoUrl: '',
  genre: '',
  isFree: true,
  duration: undefined,
  tags: [],
  isFeatured: false,
  documents: undefined,
  price: undefined,
  billingCycle: undefined,
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
        videoUrl: performance.videoUrl ?? '',
        genre: performance.genre ?? '',
        status: performance.status,
        isFree: performance.isFree,
        duration: performance.duration,
        tags: performance.tags ?? [],
        isFeatured: performance.isFeatured ?? false,
        documents: undefined,
        // Pre-populate giá từ Subscription liên kết
        price: performance.subscription?.price ?? undefined,
        billingCycle: (performance.subscription?.billingCycle as CreatePerformanceInput['billingCycle']) ?? undefined,
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
    if (!form.isFree && !form.billingCycle) {
      setFieldErrors({ billingCycle: 'Vui lòng chọn chu kỳ thanh toán' });
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
      delete payload.billingCycle;
    }
    onSave(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#2d6a4f]" />
            {performance ? 'Chỉnh sửa tiết mục' : 'Thêm tiết mục mới'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
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
                    set('billingCycle', undefined);
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

            {/* Hiện giá & chu kỳ chỉ khi trả phí */}
            {!form.isFree && (
              <>
                <div className="space-y-1.5">
                  <Label>Giá (VND) *</Label>
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
                <div className="space-y-1.5">
                  <Label>Chu kỳ thanh toán *</Label>
                  <Select
                    value={form.billingCycle ?? ''}
                    onValueChange={(v) =>
                      set('billingCycle', v as CreatePerformanceInput['billingCycle'])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn chu kỳ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Theo tháng</SelectItem>
                      <SelectItem value="quarterly">Theo quý</SelectItem>
                      <SelectItem value="yearly">Theo năm</SelectItem>
                    </SelectContent>
                  </Select>
                  {renderFieldError('billingCycle')}
                </div>
              </>
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

          <DialogFooter className="mt-4">
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
              {isSaving ? 'Đang lưu...' : performance ? 'Cập nhật' : 'Tạo tiết mục'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
