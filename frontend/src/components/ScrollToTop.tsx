'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Mỗi khi đổi route (pathname thay đổi) → tự cuộn cửa sổ lên đầu trang.
 * Đặt trong root layout để áp dụng cho toàn bộ ứng dụng.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
