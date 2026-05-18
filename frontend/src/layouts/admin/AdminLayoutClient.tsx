'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/layouts/admin/AdminHeader';
import AdminSidebar from '@/layouts/admin/AdminSidebar';
import { User } from '@/types/user.types';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  user: User;
}

export default function AdminLayoutClient({ children, user }: AdminLayoutClientProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setIsMounted(true);
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    if (saved === 'true') {
      // eslint-disable-next-line
      setIsCollapsed(true);
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('admin-sidebar-collapsed', String(next));
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar 
        user={user} 
        isCollapsed={isMounted ? isCollapsed : false} 
        onToggle={toggleSidebar} 
      />
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isMounted && isCollapsed ? 'ml-[80px]' : 'ml-60'
        }`}
      >
        <AdminHeader user={user} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
