'use client';

import { Button } from '@/components/ui/button';
import { FormDialog } from '@/components/admin/FormDialog';
import { Loader2, Trash2 } from 'lucide-react';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  description: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  /** Nhãn nút xác nhận (mặc định "Xóa") */
  confirmLabel?: string;
  /** Nhãn nút khi đang xử lý (mặc định "Đang xóa...") */
  loadingLabel?: string;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title = 'Xác nhận xóa',
  description,
  isDeleting,
  onConfirm,
  confirmLabel = 'Xóa',
  loadingLabel = 'Đang xóa...',
}: ConfirmDeleteDialogProps) {
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={Trash2}
      title={title}
      description="Hành động này cần được xác nhận."
      tone="danger"
      className="sm:max-w-md"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isDeleting ? loadingLabel : confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-[13px] leading-relaxed text-gray-600">{description}</p>
    </FormDialog>
  );
}
