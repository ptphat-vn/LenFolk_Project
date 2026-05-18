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
import { LearningPath, LessonLevel, PathCategory } from '@/types/content.types';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PathFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  path?: LearningPath | null;
  category: PathCategory;
  onSave: (data: Partial<LearningPath>) => void;
}

type FormData = {
  title: string;
  description: string;
  level: LessonLevel;
  status: 'published' | 'draft';
  instructor: string;
};

const DEFAULT: FormData = {
  title: '',
  description: '',
  level: 'beginner',
  status: 'draft',
  instructor: '',
};

export function PathFormDialog({
  open,
  onOpenChange,
  path,
  category,
  onSave,
}: PathFormDialogProps) {
  const isEdit = Boolean(path);
  const [form, setForm] = useState<FormData>(DEFAULT);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        path
          ? {
              title: path.title,
              description: path.description,
              level: path.level,
              status: path.status,
              instructor: path.instructor,
            }
          : DEFAULT,
      );
      setErrors({});
    }
  }, [open, path]);

  const set = (k: keyof FormData, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e: Partial<FormData> = {};
    if (!form.title.trim()) e.title = 'Tiêu đề không được để trống';
    if (!form.description.trim()) e.description = 'Mô tả không được để trống';
    if (!form.instructor.trim())
      e.instructor = 'Giảng viên không được để trống';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    onSave({ ...form, category });
    setLoading(false);
    onOpenChange(false);
  };

  const Field = ({
    label,
    error,
    required,
    children,
  }: {
    label: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
  }) => (
    <div className="space-y-1.5">
      <Label className="text-[13px] font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );

  const categoryLabels: Record<PathCategory, string> = {
    foundation: 'Nền tảng',
    technique: 'Kỹ thuật',
    repertoire: 'Tiết mục',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[15px]">
            {isEdit
              ? 'Chỉnh sửa lộ trình'
              : `Thêm lộ trình · ${categoryLabels[category]}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Field label="Tiêu đề lộ trình" error={errors.title} required>
            <Input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="VD: Nhập môn sáo trúc"
              className="h-9 text-[13px]"
            />
          </Field>

          <Field label="Mô tả" error={errors.description} required>
            <Textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Mô tả nội dung và mục tiêu lộ trình..."
              rows={3}
              className="text-[13px] resize-none"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Cấp độ" required>
              <Select
                value={form.level}
                onValueChange={(v) => set('level', v as LessonLevel)}
              >
                <SelectTrigger className="h-9 text-[13px]">
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
                onValueChange={(v) => set('status', v as 'published' | 'draft')}
              >
                <SelectTrigger className="h-9 text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Bản nháp</SelectItem>
                  <SelectItem value="published">Xuất bản</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field
            label="Giảng viên phụ trách"
            error={errors.instructor}
            required
          >
            <Input
              value={form.instructor}
              onChange={(e) => set('instructor', e.target.value)}
              placeholder="VD: GV. Minh Tú"
              className="h-9 text-[13px]"
            />
          </Field>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="text-[13px]"
          >
            Hủy
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white text-[13px] min-w-25"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            {isEdit ? 'Lưu thay đổi' : 'Tạo lộ trình'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
