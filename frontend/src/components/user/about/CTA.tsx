import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const CTA = () => {
  return (
    <section className="py-24 bg-gradient-to-r from-[#d6ddc6] to-[#f4e0ac] text-center px-6">
      <h2 className="text-4xl md:text-5xl font-be-vietnam-pro text-black mb-10">
        Sẵn sàng bắt đầu hành trình?
      </h2>
      <Link href="/courses" className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-black text-white font-medium text-lg hover:bg-gray-800 transition-all hover:scale-105 shadow-xl shadow-black/20">
        Xem các khóa học <ArrowRight size={20} />
      </Link>
    </section>
  );
};
