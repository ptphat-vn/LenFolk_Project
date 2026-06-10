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
  Zap,
  UserCheck,
  Wallet,
  Award,
  Bell,
  Shield,
  ScrollText,
  Music,
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
        label: 'Cấu hình thanh toán',
        href: '/admin/business/subscriptions',
        icon: Zap,
      },
      {
        label: 'Giao dịch',
        href: '/admin/business/transactions',
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
}: {
  user: User;
  isCollapsed?: boolean;
  onToggle?: () => void;
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

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 bg-white border-r border-gray-200 flex flex-col z-50 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-18' : 'w-60'
      }`}
    >
      {/* Toggle button */}
      {onToggle && (
        <button
          onClick={onToggle}
          className="absolute cursor-pointer -right-3 top-6 bg-white border border-gray-200 text-gray-500 hover:text-gray-900 rounded-full p-1 z-50 shadow-sm transition-colors"
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
        className={`flex items-center h-16 border-b border-gray-200 shrink-0 ${
          isCollapsed ? 'justify-center px-0' : 'px-5 gap-2.5'
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
        {!isCollapsed && (
          <span className="text-[15px] font-bold text-gray-900 overflow-hidden whitespace-nowrap">
            LenFolk
            <span className="text-[#2d6a4f]"> Admin</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 overflow-y-auto space-y-4 overflow-x-hidden custom-scrollbar">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!isCollapsed ? (
              <button
                type="button"
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center cursor-pointer  justify-between px-2 mb-1 group/header"
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
            ) : (
              <div className="h-px bg-gray-100 my-2 mx-1" />
            )}

            <div
              className={`overflow-hidden transition-all duration-200 ${
                isCollapsed || openGroups[group.label]
                  ? 'max-h-96 opacity-100'
                  : 'max-h-0 opacity-0'
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
                      'flex items-center py-2 rounded-lg text-[13px] font-medium mb-0.5 transition-all duration-150 cursor-pointer',
                      isCollapsed
                        ? 'justify-center px-0 mx-auto w-10'
                        : 'gap-2.5 px-3',
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
                    {!isCollapsed && (
                      <span className="whitespace-nowrap overflow-hidden">
                        {item.label}
                      </span>
                    )}
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
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
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
        )}
        {/* Logout */}
        <div className="p-2.5">
          <button
            onClick={handleLogout}
            type="button"
            title={isCollapsed ? 'Đăng xuất' : undefined}
            className={[
              'flex items-center py-2 rounded-lg text-[13px] font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 w-full',
              isCollapsed ? 'justify-center px-0' : 'gap-2.5 px-3',
            ].join(' ')}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && (
              <span className="whitespace-nowrap overflow-hidden">
                Đăng xuất
              </span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
