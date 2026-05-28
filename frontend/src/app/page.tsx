'use client'
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#10120C] flex flex-col font-sans selection:bg-[#8E9E6E] selection:text-[#FFFFFF]">
      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#FFFFFF]/80 backdrop-blur-md border-b border-[#10120C]/5"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative">
              <Image 
                src="/images/logo_notext.png" 
                alt="LenFolk Logo" 
                fill 
                sizes="40px"
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#10120C]">
              LenFolk<span className="text-[#8E9E6E]"> Music</span>
            </span>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#10120C]/70">
            <Link href="#" className="hover:text-[#8E9E6E] transition-colors">Về chúng tôi</Link>
            <Link href="#" className="hover:text-[#8E9E6E] transition-colors">Khóa học</Link>
            <Link href="#" className="hover:text-[#8E9E6E] transition-colors">Bảng giá</Link>
            <Link href="#" className="hover:text-[#8E9E6E] transition-colors">Hỗ trợ</Link>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-4">
            <Button className='flex items-center cursor-pointer gap-2 
bg-linear-to-r from-[#1a3a2a] to-[#2f632c] 
hover:from-[#163024] hover:to-[#416e30] 
text-white font-medium py-2 px-2 
rounded-full transition-all duration-300 text-sm'>
              <Link 
              href="/login" 
              className="px-5 py-2.5 text-sm font-semibold transition-colors"
            >
              Đăng nhập
            </Link>
            </Button>
            
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center pt-20 px-6 relative overflow-hidden">
        {/* Abstract Background Effects */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D6DDC6]/50 rounded-full blur-[120px] pointer-events-none" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F4E0AC]/50 rounded-full blur-[100px] pointer-events-none" 
        />
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#8E9E6E]/20 rounded-full blur-[120px] pointer-events-none" 
        />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#8E9E6E]/10 border border-[#8E9E6E]/20 text-[#8E9E6E] text-sm font-medium mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8E9E6E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8E9E6E]"></span>
            </span>
            Nền tảng học nhạc trực tuyến hàng đầu
          </motion.div>
          
          {/* Main Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.15]"
          >
            Khơi dậy đam mê <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8E9E6E] to-[#10120C]">
              âm nhạc trong bạn
            </span>
          </motion.h1>
          
          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl text-[#10120C]/70 max-w-2xl mb-12 leading-relaxed"
          >
            Khám phá phương pháp học tập độc quyền từ LenFolk. Kết nối với các chuyên gia, nâng cao kỹ năng và tự tin theo đuổi con đường âm nhạc chuyên nghiệp.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Link 
              href="/register" 
              className="w-full sm:w-auto px-8 py-4 text-base font-bold bg-[#8E9E6E] hover:bg-[#8E9E6E]/90 text-[#FFFFFF] rounded-full transition-all shadow-[0_0_30px_rgba(142,158,110,0.3)] hover:shadow-[0_0_40px_rgba(142,158,110,0.5)] hover:-translate-y-1"
            >
              Bắt đầu hành trình
            </Link>
            <Link 
              href="#explore" 
              className="w-full sm:w-auto px-8 py-4 text-base font-bold bg-[#D6DDC6]/30 hover:bg-[#D6DDC6]/50 text-[#10120C] border border-[#8E9E6E]/20 rounded-full transition-all hover:-translate-y-1"
            >
              Tìm hiểu thêm
            </Link>
          </motion.div>
        </div>
      </main>
    </div> 
  );
}
