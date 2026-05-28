'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
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
import { CurriculumItem, CurriculumItemType } from '@/types/content.types';
import { useState } from 'react';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: CurriculumItem | null;
  onSave: (data: Partial<CurriculumItem>) => void;
}

type FormState = {
  session: string;
  title: string;
  type: CurriculumItemType;
  description: string;
};

const EMPTY: FormState = {
  session: '',
  title: '',
  type: 'lesson',
  description: '',
};

export function CurriculumItemFormDialog({
  open,
  onOpenChange,
  item,
  onSave,
}: Props) {
  
  const initialForm = (): FormState =>
    item
      ? {
          session: item.title.split(' ')[1] ?? '',
          title: item.title,
          type: item.type,
          description: item.description,
        }
      : EMPTY;

  const [form, setForm] = useState<FormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.session.trim()) e.session = 'Bắt buộc';
    if (!form.title.trim()) e.title = 'Bắt buộc';
    if (!form.description.trim()) e.description = 'Bắt buộc';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    onSave(form);
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {item ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            {/* Session */}
            <div className="space-y-1.5">
              <Label className="text-[13px]">
                Buổi học <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Buổi 1"
                value={form.session}
                onChange={(e) => setForm({ ...form, session: e.target.value })}
                className={`h-8 text-[13px] ${errors.session ? 'border-red-400' : ''}`}
              />
              {errors.session && (
                <p className="text-[11px] text-red-500">{errors.session}</p>
              )}
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <Label className="text-[13px]">Loại nội dung</Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm({ ...form, type: v as CurriculumItemType })
                }
              >
                <SelectTrigger className="h-8 text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lesson">Bài học</SelectItem>
                  <SelectItem value="exercise">Luyện tập</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-[13px]">
              Tiêu đề <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="VD: Giới thiệu sáo trúc (6 lỗ)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={`h-8 text-[13px] ${errors.title ? 'border-red-400' : ''}`}
            />
            {errors.title && (
              <p className="text-[11px] text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-[13px]">
              Nội dung / Mô tả <span className="text-red-500">*</span>
            </Label>
            <Textarea
              placeholder="Mô tả nội dung bài học..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className={`text-[13px] resize-none ${errors.description ? 'border-red-400' : ''}`}
            />
            {errors.description && (
              <p className="text-[11px] text-red-500">{errors.description}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Hủy
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={saving}
            className="bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white"
          >
            {saving ? 'Đang lưu...' : item ? 'Cập nhật' : 'Thêm bài'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
