'use client';

import * as React from 'react';
import { X, type LucideIcon } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type FormDialogTone = 'brand' | 'danger';

const TONE_GRADIENT: Record<FormDialogTone, string> = {
  brand: 'from-[#1a3a2a] to-[#2d6a4f]',
  danger: 'from-[#7f1d1d] to-[#dc2626]',
};

export interface FormDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Icon hiển thị trong huy hiệu ở header */
  icon: LucideIcon;
  title: string;
  description?: React.ReactNode;
  /** Khi có onSubmit, body sẽ được bọc trong <form>; nút submit nằm trong footer */
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  /** Các nút hành động ở chân dialog */
  footer: React.ReactNode;
  children: React.ReactNode;
  /** Class chỉnh độ rộng, mặc định sm:max-w-3xl */
  className?: string;
  tone?: FormDialogTone;
}

/**
 * Khung dialog dùng chung cho mọi form/quản lý trong admin:
 * header gradient + huy hiệu icon + nút đóng trắng, thân cuộn (ẩn thanh cuộn),
 * footer dính ở đáy. Đồng bộ với LessonFormDialog.
 */
export function FormDialog({
  open,
  onOpenChange,
  icon: Icon,
  title,
  description,
  onSubmit,
  footer,
  children,
  className,
  tone = 'brand',
}: FormDialogProps) {
  const body = (
    <>
      <div className="flex-1 space-y-7 overflow-y-auto scrollbar-hide px-6 py-6">
        {children}
      </div>
      <DialogFooter className="mx-0 mb-0 border-t bg-gray-50/70 px-6 py-4">
        {footer}
      </DialogFooter>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn('sm:max-w-3xl p-0 gap-0 overflow-hidden', className)}
      >
        <DialogClose className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-white/80 outline-none transition-colors hover:bg-white/15 hover:text-white">
          <X className="h-4 w-4" />
          <span className="sr-only">Đóng</span>
        </DialogClose>
        <DialogHeader
          className={cn(
            'flex flex-row items-center gap-3.5 border-b bg-linear-to-r px-6 py-5',
            TONE_GRADIENT[tone],
          )}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-white">{title}</DialogTitle>
            <DialogDescription
              className={cn('text-white/75', !description && 'sr-only')}
            >
              {description ?? title}
            </DialogDescription>
          </div>
        </DialogHeader>
        {onSubmit ? (
          <form onSubmit={onSubmit} noValidate className="flex max-h-[75vh] flex-col">
            {body}
          </form>
        ) : (
          <div className="flex max-h-[75vh] flex-col">{body}</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
