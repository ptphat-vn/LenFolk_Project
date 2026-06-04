import InstructorLayoutClient from '@/layouts/instructor/InstructorLayoutClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'LenFolk Instructor' };

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <InstructorLayoutClient>{children}</InstructorLayoutClient>;
}
