'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export interface UsePaginationOptions {
  /** Query param cho trang (mặc định: "page") */
  pageParam?: string;
  /** Query param cho page size (mặc định: "pageSize") */
  pageSizeParam?: string;
  /** Page size mặc định */
  defaultPageSize?: number;
  /** Scroll về đầu trang khi chuyển trang */
  scrollToTop?: boolean;
}

export interface UsePaginationReturn {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  reset: () => void;
}

/**
 * Hook đọc/ghi pagination state qua URL search params.
 *
 * @example
 * const { page, pageSize, setPage, setPageSize } = usePagination();
 * const { data } = useQuery({ queryKey: ['users', page, pageSize], ... });
 */
export function usePagination({
  pageParam = 'page',
  pageSizeParam = 'pageSize',
  defaultPageSize = 10,
  scrollToTop = true,
}: UsePaginationOptions = {}): UsePaginationReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = useMemo(() => {
    const raw = searchParams.get(pageParam);
    const parsed = Number(raw);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
  }, [searchParams, pageParam]);

  const pageSize = useMemo(() => {
    const raw = searchParams.get(pageSizeParam);
    const parsed = Number(raw);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : defaultPageSize;
  }, [searchParams, pageSizeParam, defaultPageSize]);

  const buildUrl = useCallback(
    (newPage: number, newPageSize: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(pageParam, String(newPage));
      params.set(pageSizeParam, String(newPageSize));
      return `${pathname}?${params.toString()}`;
    },
    [pathname, searchParams, pageParam, pageSizeParam],
  );

  const navigate = useCallback(
    (url: string) => {
      router.push(url);
      if (scrollToTop) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [router, scrollToTop],
  );

  const setPage = useCallback(
    (newPage: number) => {
      navigate(buildUrl(newPage, pageSize));
    },
    [buildUrl, pageSize, navigate],
  );

  const setPageSize = useCallback(
    (newSize: number) => {
      navigate(buildUrl(1, newSize));
    },
    [buildUrl, navigate],
  );

  const reset = useCallback(() => {
    navigate(buildUrl(1, defaultPageSize));
  }, [buildUrl, defaultPageSize, navigate]);

  return { page, pageSize, setPage, setPageSize, reset };
}
