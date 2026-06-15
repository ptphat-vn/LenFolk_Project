import React from 'react';
import { Hero } from '@/components/user/home/Hero';
import { Stats } from '@/components/user/home/Stats';
import { Features } from '@/components/user/home/Features';
import { Heritage } from '@/components/user/home/Heritage';
import { AppShowcase } from '@/components/user/home/AppShowcase';
import { AppIntroQR } from '@/components/user/home/AppIntroQR';
import { Steps } from '@/components/user/home/Steps';
import { Testimonials } from '@/components/user/home/Testimonials';

export default function UserHomePage() {
  return (
    <div className="bg-white min-h-screen text-black font-sans selection:bg-sage-dark/20">
      <Hero />
      <Stats />
      <Heritage />
      <Features />
      <AppShowcase />
      <Steps />
      <Testimonials />
      <AppIntroQR />
    </div>
  );
}
