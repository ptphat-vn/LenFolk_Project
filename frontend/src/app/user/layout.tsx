import React from 'react';
import { Navbar } from '@/components/user/layout/Navbar';
import { Footer } from '@/components/user/layout/Footer';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
