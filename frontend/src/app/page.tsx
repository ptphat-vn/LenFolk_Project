'use client'
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a1912] text-white flex flex-col font-sans selection:bg-emerald-900 selection:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a1912]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative">
              <Image 
                src="/images/logo_notext.png" 
                alt="LenFolk Logo" 
                fill 
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              LenFolk<span className="text-emerald-500"> Music</span>
            </span>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <Link href="#" className="hover:text-emerald-400 transition-colors">Về chúng tôi</Link>
            <Link href="#" className="hover:text-emerald-400 transition-colors">Khóa học</Link>
            <Link href="#" className="hover:text-emerald-400 transition-colors">Bảng giá</Link>
            <Link href="#" className="hover:text-emerald-400 transition-colors">Hỗ trợ</Link>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="px-5 py-2.5 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
            >
              Đăng nhập
            </Link>
            
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center pt-20 px-6 relative overflow-hidden">
        {/* Abstract Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-900/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-900/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Nền tảng học nhạc trực tuyến hàng đầu
          </div>
          
          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.15]">
            Khơi dậy đam mê <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-200">
              âm nhạc trong bạn
            </span>
          </h1>
          
          {/* Description */}
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed">
            Khám phá phương pháp học tập độc quyền từ LenFolk. Kết nối với các chuyên gia, nâng cao kỹ năng và tự tin theo đuổi con đường âm nhạc chuyên nghiệp.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link 
              href="/register" 
              className="w-full sm:w-auto px-8 py-4 text-base font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-full transition-all shadow-[0_0_30px_rgba(5,150,105,0.4)] hover:shadow-[0_0_40px_rgba(5,150,105,0.6)] hover:-translate-y-1"
            >
              Bắt đầu hành trình
            </Link>
            <Link 
              href="#explore" 
              className="w-full sm:w-auto px-8 py-4 text-base font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full transition-all hover:-translate-y-1"
            >
              Tìm hiểu thêm
            </Link>
          </div>
        </div>
      </main>
    </div> 
  );
}
