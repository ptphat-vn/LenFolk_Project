'use client';
import React, { useEffect, useRef } from 'react';
import { motion, animate, useInView } from 'framer-motion';

const stats = [
  { value: 120, suffix: '+', label: 'Lượt theo dõi' },
  { value: 34, suffix: '+', label: 'Lượt đăng ký' },
  { value: 30, suffix: '+', label: 'Bài học' },
  { value: 2, padStart: 2, label: 'Chuyên gia ' },
];

const AnimatedCounter = ({ value, suffix = '', padStart = 0 }: { value: number, suffix?: string, padStart?: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (inView && ref.current) {
      const controls = animate(0, value, {
        duration: 0.5,
        ease: "easeOut",
        onUpdate(v) {
          if (ref.current) {
            let num = Math.round(v).toString();
            if (padStart > 0) {
              num = num.padStart(padStart, '0');
            }
            ref.current.textContent = num + suffix;
          }
        }
      });
      return () => controls.stop();
    }
  }, [inView, value, suffix, padStart]);

  return <span ref={ref}>{padStart > 0 ? '0'.padStart(padStart, '0') : '0'}{suffix}</span>;
};

export const Stats = () => {
  return (
    <div className="w-full relative z-30 -mt-32 pb-20">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="bg-white backdrop-blur-2xl border-[3px] border-[#EAF0DE] rounded-[40px] p-10 md:p-12 shadow-[0_30px_60px_-15px_rgba(142,158,110,0.4)] relative overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 md:gap-y-0 divide-x-0 md:divide-x divide-gray-200">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className={`flex flex-col items-center justify-center text-center px-4 ${index % 2 !== 0 ? 'border-l border-gray-200 md:border-l-0' : ''
                  }`}
              >
                <h3 className="text-4xl md:text-5xl font-light text-black mb-3 font-serif tracking-tight">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} padStart={stat.padStart} />
                </h3>
                <p className="text-gray-500 text-xs md:text-sm font-medium uppercase tracking-[0.2em]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
