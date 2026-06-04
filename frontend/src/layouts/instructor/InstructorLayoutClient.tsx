'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import InstructorHeader from '@/layouts/instructor/InstructorHeader';
import InstructorSidebar from '@/layouts/instructor/InstructorSidebar';
import { useAuthStore } from '@/stores/authStore';

interface InstructorLayoutClientProps {
  children: React.ReactNode;
}

export default function InstructorLayoutClient({
  children,
}: InstructorLayoutClientProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('instructor-sidebar-collapsed') === 'true';
  });

  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (isMounted && (!token || !user)) {
      router.push('/login');
    }
    // Could also add a role check here if needed:
    // if (isMounted && user && user.role !== 'INSTRUCTOR') router.push('/');
  }, [isMounted, token, user, router]);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('instructor-sidebar-collapsed', String(next));
      return next;
    });
  };

  if (!isMounted || !token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-800 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <InstructorSidebar
        user={user}
        isCollapsed={isCollapsed}
        onToggle={toggleSidebar}
      />
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isCollapsed ? 'ml-20' : 'ml-60'
        }`}
      >
        <InstructorHeader user={user} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
