'use client';

import Link from 'next/link';
import { EllipsisVertical, type LucideIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface RowAction {
  label: string;
  icon?: LucideIcon;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
  /** chèn 1 đường kẻ phía trên item này */
  separatorBefore?: boolean;
  hidden?: boolean;
}

/**
 * Menu hành động cho mỗi dòng bảng — nút ellipsis-vertical mở dropdown
 * (Xem chi tiết / Chỉnh sửa / Xoá...). Dùng chung cho mọi trang quản lý admin.
 */
export function RowActionsMenu({
  actions,
  align = 'end',
}: {
  actions: RowAction[];
  align?: 'start' | 'end' | 'center';
}) {
  const visible = actions.filter((a) => !a.hidden);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Hành động"
          onClick={(e) => e.stopPropagation()}
          className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#2d6a4f]/40 data-[state=open]:bg-gray-100 data-[state=open]:text-gray-700"
        >
          <EllipsisVertical className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-44">
        {visible.map((action, i) => {
          const Icon = action.icon;
          const inner = (
            <>
              {Icon && <Icon className="w-4 h-4" />}
              <span>{action.label}</span>
            </>
          );
          return (
            <div key={action.label + i}>
              {action.separatorBefore && <DropdownMenuSeparator />}
              {action.href ? (
                <DropdownMenuItem
                  asChild
                  variant={action.variant}
                  disabled={action.disabled}
                  className="cursor-pointer"
                >
                  <Link href={action.href} onClick={(e) => e.stopPropagation()}>
                    {inner}
                  </Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  variant={action.variant}
                  disabled={action.disabled}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick?.();
                  }}
                >
                  {inner}
                </DropdownMenuItem>
              )}
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
