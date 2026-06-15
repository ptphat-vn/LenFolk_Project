import React from 'react';
import { Navbar } from '@/components/user/layout/Navbar';
import { Hero } from '@/components/user/home/Hero';
import { Stats } from '@/components/user/home/Stats';
import { Heritage } from '@/components/user/home/Heritage';
import { Features } from '@/components/user/home/Features';
import { AppShowcase } from '@/components/user/home/AppShowcase';
import { AppIntroQR } from '@/components/user/home/AppIntroQR';
import { Steps } from '@/components/user/home/Steps';
import { Testimonials } from '@/components/user/home/Testimonials';
import { Courses } from '@/components/user/courses/Courses';
import { FAQ } from '@/components/user/courses/FAQ';
import { News } from '@/components/user/news/News';
import { Contact } from '@/components/user/contact/Contact';
import { Footer } from '@/components/user/layout/Footer';
import CanvasCursor from '@/components/user/CanvasCursor';

export default function Home() {
  return (
    <div className="font-sans text-black antialiased bg-white selection:bg-sage-light/20 selection:text-black flex flex-col min-h-screen overflow-x-hidden">
      <CanvasCursor />
      <Navbar />
      <main className="flex-1 w-full">
        <Hero />
        <Stats />
        <Heritage />
        <Features />
        <AppShowcase />
        <Steps />
        <Testimonials />
        <AppIntroQR />
      </main>
      <Footer />
    </div>
  );
}
