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
import { toast } from 'sonner';
import { Layers, Loader2 } from 'lucide-react';

interface PerformanceFormModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  performance: Performance | null;
  isSaving: boolean;
  onSave: (data: CreatePerformanceInput) => void;
}

export function PerformanceFormModal({
  open,
  onOpenChange,
  performance,
  isSaving,
  onSave,
}: PerformanceFormModalProps) {
  const [form, setForm] = useState<CreatePerformanceInput>({
    title: '',
    description: '',
    thumbnail: '',
    videoUrl: '',
    genre: '',
    status: 'draft',
    isFree: true,
    duration: undefined,
    tags: [],
    isFeatured: false,
  });
  const [tagsInput, setTagsInput] = useState('');

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
      });
      setTagsInput((performance.tags ?? []).join(', '));
    } else {
      setForm({
        title: '',
        description: '',
        thumbnail: '',
        videoUrl: '',
        genre: '',
        status: 'draft',
        isFree: true,
        duration: undefined,
        tags: [],
        isFeatured: false,
      });
      setTagsInput('');
    }
  }, [performance, open]);

  const set = <K extends keyof CreatePerformanceInput>(
    k: K,
    v: CreatePerformanceInput[K],
  ) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Vui lòng nhập tên tiết mục');
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
            {performance ? 'Chỉnh sửa tiết mục' : 'Thêm tiết mục mới'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Tên tiết mục *</Label>
              <Input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Nhập tên tiết mục"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label>Trạng thái</Label>
              <Select
                value={form.status}
                onValueChange={(v) => set('status', v as PerformanceStatus)}
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
              <Label>Loại hình</Label>
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
              <Label>Thể loại (Genre)</Label>
              <Input
                value={form.genre ?? ''}
                onChange={(e) => set('genre', e.target.value)}
                placeholder="Pop, Classical..."
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
                placeholder="180"
              />
            </div>
            
            <div className="col-span-2 space-y-1.5">
              <Label>Video URL</Label>
              <Input
                value={form.videoUrl ?? ''}
                onChange={(e) => set('videoUrl', e.target.value)}
                placeholder="https://..."
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
