'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaginationProps {
  /** Tổng số bản ghi */
  total: number;
  /** Trang hiện tại (1-based) */
  page: number;
  /** Số bản ghi mỗi trang */
  pageSize: number;
  /** Các lựa chọn page size */
  pageSizeOptions?: number[];
  /** Có hiển thị page size selector không */
  showPageSizeSelector?: boolean;
  /** Có hiển thị thông tin tổng số bản ghi không */
  showTotal?: boolean;
  /** Có hiển thị input nhảy đến trang không */
  showJumper?: boolean;
  /** Gọi khi thay đổi trang — nếu không truyền sẽ dùng URL params */
  onPageChange?: (page: number) => void;
  /** Gọi khi thay đổi page size */
  onPageSizeChange?: (pageSize: number) => void;
  /** Query param cho trang (mặc định: "page") */
  pageParam?: string;
  /** Query param cho page size (mặc định: "pageSize") */
  pageSizeParam?: string;
  /** Class name tuỳ chỉnh */
  className?: string;
  /** Số trang liền kề hiển thị hai bên trang hiện tại */
  siblingCount?: number;
  /** Disabled toàn bộ pagination */
  disabled?: boolean;
}

// ─── Utils ────────────────────────────────────────────────────────────────────

const DOTS = '...' as const;
type PageItem = number | typeof DOTS;

function generatePages(
  current: number,
  total: number,
  siblingCount = 1,
): PageItem[] {
  // Tổng số nút hiển thị = sibling * 2 + first + last + current + 2 dots
  const totalDisplayed = siblingCount * 2 + 5;

  if (totalDisplayed >= total) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(current - siblingCount, 1);
  const rightSibling = Math.min(current + siblingCount, total);

  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < total - 1;

  if (!showLeftDots && showRightDots) {
    const leftCount = 3 + siblingCount * 2;
    return [...Array.from({ length: leftCount }, (_, i) => i + 1), DOTS, total];
  }

  if (showLeftDots && !showRightDots) {
    const rightCount = 3 + siblingCount * 2;
    return [
      1,
      DOTS,
      ...Array.from(
        { length: rightCount },
        (_, i) => total - rightCount + i + 1,
      ),
    ];
  }

  return [
    1,
    DOTS,
    ...Array.from(
      { length: rightSibling - leftSibling + 1 },
      (_, i) => leftSibling + i,
    ),
    DOTS,
    total,
  ];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Pagination({
  total,
  page,
  pageSize,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSizeSelector = true,
  showTotal = true,
  showJumper = false,
  onPageChange,
  onPageSizeChange,
  pageParam = 'page',
  pageSizeParam = 'pageSize',
  className,
  siblingCount = 1,
  disabled = false,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pages = generatePages(page, totalPages, siblingCount);

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  // ── Navigation helpers ──────────────────────────────────────────────────────

  const createUrl = useCallback(
    (newPage: number, newPageSize?: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(pageParam, String(newPage));
      if (newPageSize !== undefined)
        params.set(pageSizeParam, String(newPageSize));
      return `${pathname}?${params.toString()}`;
    },
    [pathname, searchParams, pageParam, pageSizeParam],
  );

  const goToPage = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalPages || newPage === page || disabled)
        return;
      if (onPageChange) {
        onPageChange(newPage);
      } else {
        router.push(createUrl(newPage));
      }
    },
    [page, totalPages, disabled, onPageChange, router, createUrl],
  );

  const handlePageSizeChange = useCallback(
    (value: string) => {
      const newSize = Number(value);
      const newPage = 1; // reset về trang 1
      if (onPageSizeChange) {
        onPageSizeChange(newSize);
        onPageChange?.(newPage);
      } else {
        router.push(createUrl(newPage, newSize));
      }
    },
    [onPageSizeChange, onPageChange, router, createUrl],
  );

  // ── Page button ─────────────────────────────────────────────────────────────

  const PageButton = ({
    value,
    active,
  }: {
    value: number;
    active: boolean;
  }) => (
    <Button
      variant={active ? 'default' : 'outline'}
      size="icon"
      className={cn(
        'h-8 w-8 text-xs font-medium transition-all',
        active &&
          'bg-primary text-primary-foreground shadow-sm pointer-events-none',
        !active &&
          'hover:bg-muted text-muted-foreground hover:text-foreground border-border',
      )}
      onClick={() => goToPage(value)}
      disabled={disabled}
      aria-label={`Trang ${value}`}
      aria-current={active ? 'page' : undefined}
    >
      {value}
    </Button>
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-center sm:justify-between gap-2 sm:gap-3 py-3',
        className,
      )}
      aria-label="Phân trang"
    >
      {/* Thông tin tổng số */}
      {showTotal && (
        <p className="w-full sm:w-auto text-center sm:text-left text-xs sm:text-sm text-muted-foreground select-none whitespace-nowrap">
          {total === 0 ? (
            'Không có dữ liệu'
          ) : (
            <>
              Hiển thị{' '}
              <span className="font-semibold text-foreground">
                {from}–{to}
              </span>{' '}
              trong{' '}
              <span className="font-semibold text-foreground">
                {total.toLocaleString('vi-VN')}
              </span>{' '}
              bản ghi
            </>
          )}
        </p>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-2 mx-auto sm:mx-0 sm:ml-auto">
        {/* Page size selector */}
        {showPageSizeSelector && (
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground whitespace-nowrap hidden sm:inline">
              Hiển thị
            </span>
            <Select
              value={String(pageSize)}
              onValueChange={handlePageSizeChange}
              disabled={disabled}
            >
              <SelectTrigger className="h-8 w-[70px] text-xs border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem
                    key={size}
                    value={String(size)}
                    className="text-xs"
                  >
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground hidden sm:inline">
              / trang
            </span>
          </div>
        )}

        {/* Nav buttons */}
        <nav className="flex items-center gap-1" aria-label="Điều hướng trang">
          {/* First */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-border text-muted-foreground hover:text-foreground hover:bg-muted hidden sm:flex"
            onClick={() => goToPage(1)}
            disabled={page <= 1 || disabled}
            aria-label="Trang đầu"
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>

          {/* Prev */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1 || disabled}
            aria-label="Trang trước"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {pages.map((p, idx) =>
              p === DOTS ? (
                <span
                  key={`dots-${idx}`}
                  className="h-8 w-8 flex items-center justify-center text-muted-foreground text-sm select-none"
                >
                  ···
                </span>
              ) : (
                <PageButton key={p} value={p} active={p === page} />
              ),
            )}
          </div>

          {/* Next */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages || disabled}
            aria-label="Trang sau"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>

          {/* Last */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-border text-muted-foreground hover:text-foreground hover:bg-muted hidden sm:flex"
            onClick={() => goToPage(totalPages)}
            disabled={page >= totalPages || disabled}
            aria-label="Trang cuối"
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </nav>

        {/* Jumper */}
        {showJumper && (
          <JumpToPage
            currentPage={page}
            totalPages={totalPages}
            disabled={disabled}
            onJump={goToPage}
          />
        )}
      </div>
    </div>
  );
}

// ─── Jump to page ─────────────────────────────────────────────────────────────

function JumpToPage({
  currentPage,
  totalPages,
  disabled,
  onJump,
}: {
  currentPage: number;
  totalPages: number;
  disabled: boolean;
  onJump: (page: number) => void;
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    const val = Number((e.target as HTMLInputElement).value);
    if (!isNaN(val) && val >= 1 && val <= totalPages) {
      onJump(val);
      (e.target as HTMLInputElement).value = '';
    }
  };

  return (
    <div className="hidden lg:flex items-center gap-1.5 text-sm text-muted-foreground">
      <span className="whitespace-nowrap">Đến trang</span>
      <input
        type="number"
        min={1}
        max={totalPages}
        placeholder={String(currentPage)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          'h-8 w-14 rounded-md border border-border bg-background px-2 text-center text-xs',
          'text-foreground placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
        )}
      />
    </div>
  );
}
