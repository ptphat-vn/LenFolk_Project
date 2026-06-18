import React from 'react';
import { Hero } from '@/components/user/about/Hero';
import { Mission } from '@/components/user/about/Mission';
import { AIQuality } from '@/components/user/about/AIQuality';
import { Instructors } from '@/components/user/about/Instructors';
import { Partners } from '@/components/user/about/Partners';
import { CTA } from '@/components/user/about/CTA';

export default function AboutPage() {
  return (
    <div className="bg-white overflow-x-hidden">
      <Hero />
      <Mission />
      <AIQuality />
      <Instructors />
      <Partners />
      <CTA />
    </div>
  );
}
