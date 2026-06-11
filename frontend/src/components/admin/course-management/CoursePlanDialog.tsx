'use client';

import { useEffect, useState } from 'react';
import { Course, UpsertCoursePlanInput } from '@/types/course.types';
import type { BillingCycle } from '@/types/course.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { CircleDollarSign, Loader2 } from 'lucide-react';
import { coursePlanSchema, firstZodError } from '@/schema/form.schema';

export interface CoursePlanDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  course: Course | null;
  isSaving: boolean;
  onSave: (data: UpsertCoursePlanInput) => void;
}

export function CoursePlanDialog({
  open,
  onOpenChange,
  course,
  isSaving,
  onSave,
}: CoursePlanDialogProps) {
  const [price, setPrice] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (course?.plan) {
      setPrice(String(course.plan.price ?? ''));
      setBillingCycle((course.plan.billingCycle as BillingCycle) ?? 'monthly');
    } else {
      setPrice('');
      setBillingCycle('monthly');
    }
    setError(null);
  }, [course, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = coursePlanSchema.safeParse({
      price: price === '' ? undefined : Number(price),
      billingCycle,
    });
    if (!parsed.success) {
      setError(firstZodError(parsed.error));
      return;
    }
    onSave({ price: parsed.data.price, billingCycle: parsed.data.billingCycle });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CircleDollarSign className="w-4 h-4 text-amber-600" />
            Đặt giá khóa học
          </DialogTitle>
        </DialogHeader>
        {course && (
          <p className="text-[13px] text-gray-500 -mt-1">
            <span className="font-medium text-gray-700">{course.title}</span> — bán theo gói chu kỳ.
          </p>
        )}
        <form onSubmit={handleSubmit} noValidate className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Giá (VNĐ) *</Label>
            <Input
              type="number"
              min={0}
              step={1000}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="VD: 199000"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Chu kỳ thanh toán *</Label>
            <Select value={billingCycle} onValueChange={(v) => setBillingCycle(v as BillingCycle)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Hàng tháng</SelectItem>
                <SelectItem value="quarterly">Hàng quý (3 tháng)</SelectItem>
                <SelectItem value="yearly">Hàng năm</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-[11px] font-medium text-red-500">{error}</p>}
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
              {isSaving ? 'Đang lưu...' : 'Lưu giá'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
