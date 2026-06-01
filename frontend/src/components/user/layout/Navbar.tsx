'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: 'Trang chủ', href: '/user' },
    { name: 'Giới thiệu', href: '/user/about' },
    { name: 'Khóa học', href: '/user/courses' },
    { name: 'Tin tức', href: '/user/news' },
    { name: 'Liên hệ', href: '/user/contact' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/85 backdrop-blur-md border-b border-gray-200 shadow-sm py-4' : 'bg-transparent py-6'
        }`}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link href="/user" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-lg">L</div>
            <span className="font-bold text-xl tracking-wider text-black">LENFOLK</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative transition-colors duration-300 group font-medium ${isActive ? 'text-[#1a3a2a]' : 'text-gray-600 hover:text-[#1a3a2a]'}`}
                >
                  {link.name}
                  <span className={`absolute -bottom-1 left-0 h-[1px] bg-[#1a3a2a] transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                </Link>
              );
            })}
          </div>

          <div className={`hidden md:flex items-center gap-4 ${pathname === '/user' ? 'visible' : 'invisible'}`}>
            <Link
              href="/user/courses"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#8e9e6e] to-[#e6d596] text-white hover:shadow-xl transition-all duration-300 font-medium hover:scale-105 active:scale-95 shadow-lg group"
            >
              Bắt đầu
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <button className="md:hidden text-black" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 z-[60] bg-white flex flex-col"
          >
            <div className="flex items-center justify-between p-6">
              <span className="font-bold text-xl tracking-wider text-black">LENFOLK</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-black">
                <X size={24} />
              </button>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-2xl font-semibold ${pathname === link.href ? 'text-[#1a3a2a]' : 'text-black'}`}
                >
                  {link.name}
                </Link>
              ))}
              {pathname === '/user' && (
                <div className="flex flex-col gap-4 mt-8 w-64">
                  <Link
                    href="/user/courses"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#8e9e6e] to-[#e6d596] text-white font-medium w-full shadow-lg group"
                  >
                    Bắt đầu
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
