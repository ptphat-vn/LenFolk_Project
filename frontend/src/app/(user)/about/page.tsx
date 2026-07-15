import React from 'react';
import { Mission } from '@/components/user/about/Mission';
import { AIQuality } from '@/components/user/about/AIQuality';
import { Partners } from '@/components/user/about/Partners';
import { CTA } from '@/components/user/about/CTA';

export default function AboutPage() {
  return (
    <div className="bg-white overflow-x-hidden">
      <Mission />
      <AIQuality />
      <Partners />
      <CTA />
    </div>
  );
}
