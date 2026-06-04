'use client';

import { User } from '@/types/user.types';
import { Bell, ChevronRight, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';

const BREADCRUMB_MAP: Record<string, string> = {
  instructor: 'Giảng viên',
  dashboard: 'Bảng điều khiển',
  performances: 'Tiết mục của tôi',
  create: 'Tạo mới',
  edit: 'Chỉnh sửa',
  students: 'Học viên',
  revenue: 'Doanh thu',
  messages: 'Tin nhắn',
  profile: 'Hồ sơ cá nhân',
};

export default function InstructorHeader({ user }: { user: User }) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const avatarInitial = user.name?.[0]?.toUpperCase() ?? 'I';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40 shrink-0">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1" aria-label="Breadcrumb">
        {segments.map((seg, i) => {
          const isLast = i === segments.length - 1;
          return (
            <span key={seg} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-300" />}
              <span
                className={`text-[13px] ${
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

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <button
          className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-lg border border-gray-200 text-[13px] text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-all duration-150 bg-gray-50"
          aria-label="Tìm kiếm"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Tìm kiếm...</span>
          <kbd className="ml-1 text-[11px] bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-400">
            ⌘K
          </kbd>
        </button>

        <button
          className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all duration-150"
          aria-label="Thông báo"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        <button
          title={`${user.name} (${user.email})`}
          className="w-9 h-9 rounded-full bg-blue-800 text-white font-bold text-sm flex items-center justify-center cursor-pointer ml-1 shrink-0 hover:bg-blue-700 transition-colors shadow-sm"
        >
          {avatarInitial}
        </button>
      </div>
    </header>
  );
}
