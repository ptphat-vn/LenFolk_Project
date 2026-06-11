'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/layouts/admin/AdminHeader';
import AdminSidebar from '@/layouts/admin/AdminSidebar';
import { useAuthStore } from '@/stores/authStore';

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

export default function AdminLayoutClient({
  children,
}: AdminLayoutClientProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('admin-sidebar-collapsed') === 'true';
  });

  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const router = useRouter();

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

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('admin-sidebar-collapsed', String(next));
      return next;
    });
  };

  if (!hasHydrated || !token || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#2d6a4f] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar
        user={user}
        isCollapsed={isCollapsed}
        onToggle={toggleSidebar}
      />
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isCollapsed ? 'ml-20' : 'ml-60'
        }`}
      >
        <AdminHeader user={user} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
