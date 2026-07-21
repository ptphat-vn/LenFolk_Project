'use client';

import { User } from '@/types/user.types';
import { useState } from 'react';
import {
  BarChart2,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Tag,
  Users,
  UserCheck,
  Wallet,
  Award,
  Bell,
  Shield,
  ScrollText,
  Music,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import axiosInstance from '@/lib/axios';

const NAV_GROUPS = [
  {
    label: 'Tổng quan',
    items: [
      {
        label: 'Bảng điều khiển',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: 'Người dùng',
    items: [
      {
        label: 'Quản lý người dùng',
        href: '/admin/users/user-management',
        icon: Users,
      },
      {
        label: 'Quản lý giảng viên',
        href: '/admin/users/instructor-management',
        icon: UserCheck,
      },
    ],
  },
  {
    label: 'Nội dung',
    items: [
      {
        label: 'Quản lý bài học',
        href: '/admin/content/lesson-management',
        icon: BookOpen,
      },
      {
        label: 'Quản lý khoá học',
        href: '/admin/content/course-management',
        icon: ClipboardCheck,
      },
      {
        label: 'Quản lý tiết mục',
        href: '/admin/content/repertoire-management',
        icon: Music,
      },
    ],
  },
  {
    label: 'Kinh doanh',
    items: [
      {
        label: 'Doanh thu & Báo cáo',
        href: '/admin/business/revenue-reports',
        icon: BarChart2,
      },
      {
        label: 'Giao dịch',
        href: '/admin/business/transactions',
        icon: CreditCard,
      },
      {
        label: 'Người dùng & Gói',
        href: '/admin/business/users-plans',
        icon: CreditCard,
      },
      {
        label: 'Yêu cầu rút tiền',
        href: '/admin/business/payouts',
        icon: Wallet,
      },
      {
        label: 'Mã giảm giá',
        href: '/admin/business/promotions',
        icon: Tag,
      },
    ],
  },
  {
    label: 'Tương tác',
    items: [
      {
        label: 'Huy hiệu',
        href: '/admin/interaction/badges',
        icon: Award,
      },
    ],
  },
  {
    label: 'Hỗ trợ',
    items: [
      {
        label: 'Hỗ trợ khách hàng',
        href: '/admin/support',
        icon: MessageSquare,
      },
      {
        label: 'Thông báo',
        href: '/admin/support/notifications',
        icon: Bell,
      },
    ],
  },
  {
    label: 'Hệ thống',
    items: [
      {
        label: 'Phân quyền & Vai trò',
        href: '/admin/system/permissions',
        icon: Shield,
      },
      {
        label: 'Nhật ký hệ thống',
        href: '/admin/system/logs',
        icon: ScrollText,
      },
    ],
  },
];

export default function AdminSidebar({
  user,
  isCollapsed = false,
  onToggle,
  isMobileOpen = false,
  onMobileClose,
}: {
  user: User;
  /** Thu gọn — chỉ có hiệu lực từ lg trở lên; mobile luôn hiện đầy đủ */
  isCollapsed?: boolean;
  onToggle?: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { refreshToken, clearToken } = useAuthStore();

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await axiosInstance.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearToken();
      router.push('/login');
    }
  };

  const avatarInitial = user.name?.[0]?.toUpperCase() ?? 'A';

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NAV_GROUPS.map((g) => [g.label, true])),
  );

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  // Trạng thái thu gọn chỉ áp dụng từ lg trở lên → dùng class `lg:` thay vì
  // ẩn/hiện bằng JS, để mobile luôn render sidebar đầy đủ.
  const hideWhenCollapsed = isCollapsed ? 'lg:hidden' : '';

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 bg-white border-r border-gray-200 flex flex-col z-50 w-64 transition-transform duration-300 ease-in-out lg:transition-all lg:translate-x-0 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isCollapsed ? 'lg:w-18' : 'lg:w-60'}`}
    >
      {/* Toggle thu gọn — chỉ desktop */}
      {onToggle && (
        <button
          onClick={onToggle}
          aria-label={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          className="absolute cursor-pointer -right-3 top-6 bg-white border border-gray-200 text-gray-500 hover:text-gray-900 rounded-full p-1 z-50 shadow-sm transition-colors hidden lg:block"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
      )}

      {/* Logo */}
      <div
        className={`flex items-center h-16 border-b border-gray-200 shrink-0 px-5 gap-2.5 ${
          isCollapsed ? 'lg:justify-center lg:px-0' : ''
        }`}
      >
        <div className="w-8 h-8 relative shrink-0">
          <Image
            src="/images/logo_notext.png"
            alt="LenFolk Logo"
            fill
            sizes="32px"
            className="object-contain"
            priority
          />
        </div>
        <span
          className={`text-[15px] font-bold text-gray-900 overflow-hidden whitespace-nowrap ${hideWhenCollapsed}`}
        >
          LenFolk
          <span className="text-[#2d6a4f]"> Admin</span>
        </span>

        {/* Đóng drawer — chỉ mobile */}
        <button
          onClick={onMobileClose}
          aria-label="Đóng menu"
          className="ml-auto -mr-1 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors lg:hidden"
        >
          <X className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 overflow-y-auto space-y-4 overflow-x-hidden custom-scrollbar">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <button
              type="button"
              onClick={() => toggleGroup(group.label)}
              className={`w-full flex items-center cursor-pointer justify-between px-2 mb-1 group/header ${hideWhenCollapsed}`}
            >
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-gray-400 whitespace-nowrap group-hover/header:text-gray-600 transition-colors">
                {group.label}
              </p>
              <ChevronDown
                className={`w-3 h-3 text-gray-300 group-hover/header:text-gray-500 transition-all duration-200 ${
                  openGroups[group.label] ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </button>
            {isCollapsed && (
              <div className="h-px bg-gray-100 my-2 mx-1 hidden lg:block" />
            )}

            <div
              className={`overflow-hidden transition-all duration-200 ${
                openGroups[group.label]
                  ? 'max-h-96 opacity-100'
                  : `max-h-0 opacity-0 ${isCollapsed ? 'lg:max-h-96 lg:opacity-100' : ''}`
              }`}
            >
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (pathname.startsWith(item.href + '/') &&
                    !group.items.some(
                      (other) =>
                        other.href !== item.href &&
                        pathname.startsWith(other.href),
                    ));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={[
                      'flex items-center py-2 rounded-lg text-[13px] font-medium mb-0.5 transition-all duration-150 cursor-pointer gap-2.5 px-3',
                      isCollapsed
                        ? 'lg:justify-center lg:px-0 lg:mx-auto lg:w-10'
                        : '',
                      isActive
                        ? 'bg-[#1a3a2a] text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                    ].join(' ')}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-white' : 'text-gray-400'
                      }`}
                    />
                    <span
                      className={`whitespace-nowrap overflow-hidden ${hideWhenCollapsed}`}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User profile + Logout */}
      <div className="border-t border-gray-100 shrink-0">
        {/* User info */}
        <div
          className={`flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 ${hideWhenCollapsed}`}
        >
          <div className="w-7 h-7 rounded-full bg-[#1a3a2a] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
            {avatarInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-gray-900 truncate">
              {user.name}
            </p>
            <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
          </div>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#1a3a2a]/10 text-[#1a3a2a] uppercase shrink-0">
            Admin
          </span>
        </div>
        {/* Logout */}
        <div className="p-2.5">
          <button
            onClick={handleLogout}
            type="button"
            title={isCollapsed ? 'Đăng xuất' : undefined}
            className={[
              'flex items-center py-2 rounded-lg text-[13px] font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 w-full gap-2.5 px-3',
              isCollapsed ? 'lg:justify-center lg:px-0' : '',
            ].join(' ')}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span
              className={`whitespace-nowrap overflow-hidden ${hideWhenCollapsed}`}
            >
              Đăng xuất
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
