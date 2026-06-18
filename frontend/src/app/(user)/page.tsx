import React from 'react';
import { Hero } from '@/components/user/home/Hero';
import { Stats } from '@/components/user/home/Stats';
import { VisitorCounter } from '@/components/user/home/VisitorCounter';
import { Features } from '@/components/user/home/Features';
import { AppShowcase } from '@/components/user/home/AppShowcase';
import { AppIntroQR } from '@/components/user/home/AppIntroQR';
import { Steps } from '@/components/user/home/Steps';
import { Testimonials } from '@/components/user/home/Testimonials';
import { Courses } from '@/components/user/home/Courses';
import { FAQ } from '@/components/user/home/FAQ';
import { News } from '@/components/user/home/News';
import { Contact } from '@/components/user/home/Contact';

export default function UserHomePage() {
  return (
    <div className="bg-white min-h-screen text-black font-sans selection:bg-sage-dark/20">
      <Hero />
      <Stats />
      <VisitorCounter />
      <Features />
      <AppShowcase />
      <Steps />
      <Testimonials />
      <AppIntroQR />
    </div>
  );
}
