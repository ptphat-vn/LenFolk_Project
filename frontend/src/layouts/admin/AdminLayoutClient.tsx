'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminHeader from '@/layouts/admin/AdminHeader';
import AdminSidebar from '@/layouts/admin/AdminSidebar';
import { useAuthStore } from '@/stores/authStore';

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

export default function AdminLayoutClient({
  children,
}: AdminLayoutClientProps) {
  // Thu gọn sidebar — chỉ áp dụng từ breakpoint lg trở lên
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('admin-sidebar-collapsed') === 'true';
  });
  // Drawer sidebar trên mobile/tablet (< lg)
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const router = useRouter();
  const pathname = usePathname();

  // Chỉ điều hướng SAU khi persist khôi phục xong (tránh văng ra /login do race)
  useEffect(() => {
    if (!hasHydrated) return;
    if (!token || !user) {
      router.replace('/login');
    } else if (user.role !== 'admin') {
      // Sai vai trò → đưa về khu vực phù hợp
      router.replace(user.role === 'instructor' ? '/instructor/dashboard' : '/');
    }
  }, [hasHydrated, token, user, router]);

  // Đổi trang → đóng drawer
  useEffect(() => setIsMobileOpen(false), [pathname]);

  // Khoá scroll nền khi drawer đang mở
  useEffect(() => {
    if (!isMobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMobileOpen]);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('admin-sidebar-collapsed', String(next));
      return next;
    });
  };

  if (!hasHydrated || !token || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#2d6a4f] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Backdrop cho drawer trên mobile */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
          aria-hidden="true"
        />
      )}

      <AdminSidebar
        user={user}
        isCollapsed={isCollapsed}
        onToggle={toggleSidebar}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      <div
        className={`flex-1 flex flex-col min-h-screen min-w-0 transition-[margin] duration-300 ease-in-out ${
          isCollapsed ? 'lg:ml-18' : 'lg:ml-60'
        }`}
      >
        <AdminHeader user={user} onMenuClick={() => setIsMobileOpen(true)} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
