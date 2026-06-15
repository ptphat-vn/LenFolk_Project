import React from 'react';
import { Navbar } from '@/components/user/layout/Navbar';
import { Footer } from '@/components/user/layout/Footer';
import CanvasCursor from '@/components/user/CanvasCursor';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <CanvasCursor />
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
