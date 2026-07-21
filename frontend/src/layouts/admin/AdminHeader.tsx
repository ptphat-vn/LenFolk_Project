'use client';

import { User } from '@/types/user.types';
import { ChevronRight, Menu, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { NotificationBell } from '@/components/admin/NotificationBell';

const BREADCRUMB_MAP: Record<string, string> = {
  admin: 'Quản trị viên',
  dashboard: 'Bảng điều khiển',
  users: 'Người dùng',
  'user-management': 'Quản lý người dùng',
  instructors: 'Quản lý Giảng viên',
  'instructor-management': 'Quản lý Giảng viên',
  content: 'Nội dung',
  business: 'Kinh doanh',
  support: 'Hỗ trợ khách hàng',
  leaderboard: 'Bảng xếp hạng',
  'lesson-management': 'Quản lý bài học',
  'learning-path': 'Lộ trình học',
  'course-management': 'Quản lý khóa học',
  'revenue-reports': 'Doanh thu & Báo cáo',
  subscriptions: 'Gói đăng ký',
  transactions: 'Giao dịch',
  promotions: 'Mã giảm giá',
  'users-plans': 'Người dùng & Gói',
};

export default function AdminHeader({
  user,
  onMenuClick,
}: {
  user: User;
  onMenuClick?: () => void;
}) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const avatarInitial = user.name?.[0]?.toUpperCase() ?? 'A';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between gap-2 px-4 sm:px-6 sticky top-0 z-40 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        {/* Mở drawer — chỉ mobile */}
        <button
          onClick={onMenuClick}
          aria-label="Mở menu"
          className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer lg:hidden shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb — mobile chỉ hiện mục cuối để không tràn */}
        <nav
          className="flex items-center gap-1 min-w-0"
          aria-label="Breadcrumb"
        >
          {segments.map((seg, i) => {
            const isLast = i === segments.length - 1;
            return (
              <span
                key={seg}
                className={`items-center gap-1 min-w-0 ${isLast ? 'flex' : 'hidden sm:flex'}`}
              >
                {i > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0 hidden sm:block" />
                )}
                <span
                  className={`text-[13px] truncate ${
                    isLast
                      ? 'text-gray-900 font-semibold'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {BREADCRUMB_MAP[seg] ?? seg}
                </span>
              </span>
            );
          })}
        </nav>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          className="hidden md:flex items-center gap-2 h-9 px-3 rounded-lg border border-gray-200 text-[13px] text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-all duration-150 bg-gray-50"
          aria-label="Tìm kiếm"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Tìm kiếm...</span>
          <kbd className="ml-1 text-[11px] bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-400">
            ⌘K
          </kbd>
        </button>

        <NotificationBell />

        <button
          title={`${user.name} (${user.email})`}
          className="w-9 h-9 rounded-full bg-[#1a3a2a] text-white font-bold text-sm flex items-center justify-center cursor-pointer sm:ml-1 shrink-0 hover:bg-[#2d6a4f] transition-colors"
        >
          {avatarInitial}
        </button>
      </div>
    </header>
  );
}
