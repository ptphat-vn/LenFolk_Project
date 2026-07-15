'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Hero } from '@/components/user/about/Hero';
import { MusicVideo } from '@/components/user/about/MusicVideo';

export const GlobalMusicWrapper = () => {
  const pathname = usePathname();
  const isAbout = pathname === '/about';

  // We render Hero only on the about page
  return (
    <>
      {isAbout && <Hero />}
      <MusicVideo />
    </>
  );
};
