import AdminLayoutClient from '@/layouts/admin/AdminLayoutClient';
import { User } from '@/types/user.types';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard' };

const MOCK_ADMIN_USER: User = {
  id: '1',
  name: 'Nguyễn Admin',
  email: 'admin@test.com',
  role: 'admin',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = MOCK_ADMIN_USER;

  return (
    <AdminLayoutClient user={user}>
      {children}
    </AdminLayoutClient>
  );
}
