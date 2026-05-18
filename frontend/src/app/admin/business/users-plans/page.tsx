'use client';

import { useState } from 'react';
import { UsersPlansStats } from '@/components/admin/users-plans/UsersPlansStats';
import { UsersPlansFilter } from '@/components/admin/users-plans/UsersPlansFilter';
import { UsersPlansTable, UserPlanData } from '@/components/admin/users-plans/UsersPlansTable';
import { UserDetailDrawer } from '@/components/admin/users-plans/UserDetailDrawer';

export default function UsersPlansPage() {
  const [selectedUser, setSelectedUser] = useState<UserPlanData | null>(null);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto relative">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a] mb-2">
          Người Dùng & Gói
        </h1>
        <p className="text-gray-500 text-sm">
          Xem học viên đăng ký, gói đang sử dụng và tiến độ học tập
        </p>
      </div>

      <UsersPlansStats />
      
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <UsersPlansFilter />
        </div>
        <UsersPlansTable onViewUser={setSelectedUser} />
      </div>

      <UserDetailDrawer 
        user={selectedUser} 
        isOpen={!!selectedUser} 
        onClose={() => setSelectedUser(null)} 
      />
    </div>
  );
}
