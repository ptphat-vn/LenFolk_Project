'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { siteStatApi } from '@/lib/api/site-stat.api';

const SESSION_KEY = 'lenfolk_visit_tracked';

export const VisitorCounter = () => {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        // Mỗi phiên trình duyệt chỉ tính 1 lượt truy cập.
        const alreadyTracked = sessionStorage.getItem(SESSION_KEY);
        const res = alreadyTracked
          ? await siteStatApi.getStats()
          : await siteStatApi.trackVisit();

        if (!alreadyTracked) sessionStorage.setItem(SESSION_KEY, '1');
        if (active) setTotal(res.data?.totalVisits ?? 0);
      } catch {
        // Bỏ qua lỗi để không ảnh hưởng trải nghiệm trang chủ.
      }
    };

    run();
    return () => {
      active = false;
    };
  }, []);

  if (total === null) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="flex justify-center pb-10"
    >
      <div className="inline-flex items-center gap-2.5 rounded-full border border-gray-100 bg-gray-50/80 px-5 py-2.5 shadow-sm backdrop-blur-xl">
        <Eye className="h-4 w-4 text-sage-dark" />
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
          Lượt truy cập
        </span>
        <span className="font-serif text-lg font-light tracking-tight text-black">
          {total.toLocaleString('vi-VN')}
        </span>
      </div>
    </motion.div>
  );
};
