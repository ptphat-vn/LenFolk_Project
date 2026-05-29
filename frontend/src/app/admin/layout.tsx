import AdminLayoutClient from '@/layouts/admin/AdminLayoutClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'LenFolk Admin' };

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
