'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  variant = 'danger',
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
              variant === 'danger' ? 'bg-red-50' : 'bg-amber-50'
            }`}
          >
            <AlertTriangle
              className={`w-5 h-5 ${variant === 'danger' ? 'text-red-500' : 'text-amber-500'}`}
            />
          </div>
          <DialogTitle className="text-[15px]">{title}</DialogTitle>
          <DialogDescription className="text-[13px] text-gray-500">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-[13px]"
          >
            {cancelLabel}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className={`text-[13px] ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 text-white border-red-600'
                : 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500'
            }`}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
