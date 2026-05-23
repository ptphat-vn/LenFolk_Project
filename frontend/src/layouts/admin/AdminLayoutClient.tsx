'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/layouts/admin/AdminHeader';
import AdminSidebar from '@/layouts/admin/AdminSidebar';
import { User } from '@/types/user.types';
import { useAuthStore } from '@/stores/authStore';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  user: User;
}

export default function AdminLayoutClient({ children, user }: AdminLayoutClientProps) {
 const [isMounted, setIsMounted] = useState(false);
const [isCollapsed, setIsCollapsed] = useState(() => {
  
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('admin-sidebar-collapsed') === 'true';
});
  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !token) {
      router.push('/login');
    }
  }, [isMounted, token, router]);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('admin-sidebar-collapsed', String(next));
      return next;
    });
  };

  if (!isMounted || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-[#2d6a4f] border-t-transparent rounded-full animate-spin"></div>
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
          isCollapsed ? 'ml-[80px]' : 'ml-60'
        }`}
      >
        <AdminHeader user={user} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
