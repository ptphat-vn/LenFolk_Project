'use client';

import { User } from '@/types/user.types';
import {
  BarChart2,
  BookOpen,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Map,
  MessageSquare,
  Tag,
  Trophy,
  Users,
  ChevronLeft,
  ChevronRight,
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
    label: 'Nội dung',
    items: [
      {
        label: 'Quản lý bài học',
        href: '/admin/content/lesson-management',
        icon: BookOpen,
      },
      {
        label: 'Lộ trình học',
        href: '/admin/content/learning-path',
        icon: Map,
      },
      {
        label: 'Duyệt tiết mục',
        href: '/admin/content/content-approval',
        icon: ClipboardCheck,
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
        label: 'Người dùng & Gói',
        href: '/admin/business/users-plans',
        icon: Users,
      },
      { label: 'Khuyến mãi', href: '/admin/business/promotions', icon: Tag },
    ],
  },
  {
    label: 'Tương tác',
    items: [
      {
        label: 'Bảng xếp hạng',
        href: '/admin/leaderboard',
        icon: Trophy,
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
    ],
  },
];

export default function AdminSidebar({ 
  isCollapsed = false, 
  onToggle 
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

  return (
    <aside 
      className={`fixed top-0 left-0 cursor-pointer bottom-0 bg-white border-r border-gray-200 flex flex-col z-50 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-[80px]' : 'w-60'
      }`}
    >
      {onToggle && (
        <button
          onClick={onToggle}
          className="absolute cursor-pointer -right-3 top-6 bg-white border border-gray-200 text-gray-500 hover:text-gray-900 rounded-full p-1 z-50 shadow-sm transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      )}
      {/* Logo */}
      <div className={`flex items-center h-16 border-b border-gray-200 shrink-0 ${isCollapsed ? 'justify-center px-0' : 'px-5 gap-2.5'}`}>
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
            LenFolk<span className="text-[#2d6a4f]"> Admin</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4 overflow-x-hidden custom-scrollbar">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!isCollapsed ? (
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 px-3 mb-1 whitespace-nowrap">
                {group.label}
              </p>
            ) : (
              <div className="h-4" /> // spacing when collapsed
            )}
            
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin/dashboard'
                  ? pathname === '/admin/dashboard'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={[
                    'flex items-center py-2 rounded-lg text-[13px] font-medium mb-0.5 transition-all duration-150',
                    isCollapsed ? 'justify-center px-0 mx-auto w-10' : 'gap-3 px-3',
                    isActive
                      ? 'bg-[#1a3a2a] text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  ].join(' ')}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`}
                  />
                  {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-100 shrink-0">
        <button
          onClick={handleLogout}
          type="button"
          title={isCollapsed ? "Đăng xuất" : undefined}
          className={[
            "flex items-center py-2.5 rounded-lg text-[13px] font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 w-full",
            isCollapsed ? "justify-center px-0" : "gap-3 px-3"
          ].join(' ')}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
}
