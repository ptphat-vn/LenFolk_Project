'use client';
import React, { useState } from 'react';
import { ArrowRight, X, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const News = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  return (
    <section id="news" className="py-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-5xl font-bold mb-4 text-black">Tin tức & Sự kiện</h2>
          <p className="text-xl text-gray-600">Cập nhật mới nhất về sáo trúc, nghệ thuật dân tộc và cộng đồng LENFOLK.</p>
        </div>

        {/* Featured Article */}
        <div className="w-full bg-white rounded-[32px] overflow-hidden shadow-xl mb-12 flex flex-col md:flex-row border border-gray-100 group">
          <div 
            onClick={() => setIsVideoOpen(true)}
            className="w-full md:w-1/2 bg-[url('https://img.youtube.com/vi/3MNDwy4jKtY/maxresdefault.jpg')] bg-cover bg-center min-h-[300px] flex items-center justify-center transition-transform duration-700 cursor-pointer relative overflow-hidden"
          >
             <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-0"></div>
             <div className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-black shadow-xl z-10 hover:scale-110 transition-transform group-hover:scale-110">
               <Play size={32} className="ml-2" />
             </div>
          </div>
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white z-10 relative">
            <span className="text-[#8e9e6e] font-medium mb-4 tracking-wider uppercase text-sm">Sự kiện nổi bật • 24 Thg 5, 2026</span>
            <h3 className="text-3xl font-bold mb-4 leading-tight group-hover:text-[#8e9e6e] transition-colors cursor-pointer" onClick={() => setIsDetailOpen(true)}>Thiên Âm — Dự án âm nhạc kết hợp công nghệ AI và sáo trúc cổ truyền</h3>
            <p className="text-gray-600 mb-8 leading-relaxed line-clamp-3">Sự kiện ra mắt dự án âm nhạc kết hợp độc đáo giữa âm thanh sáo trúc truyền thống và công nghệ trí tuệ nhân tạo, mở ra kỷ nguyên mới cho nghệ thuật dân tộc.</p>
            <div onClick={() => setIsDetailOpen(true)} className="flex items-center gap-2 text-black font-bold group-hover:text-[#8e9e6e] transition-colors cursor-pointer w-fit">
              Đọc thêm <ArrowRight size={16} />
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { tag: 'Youtube', title: 'Album Vươn mình đất nước', link: 'https://www.youtube.com/playlist?list=PLQxTFG0OSN6f_HtGWkMvfbmc7ThQQQwB8', image: 'https://i.ytimg.com/pl_c/PLQxTFG0OSN6f_HtGWkMvfbmc7ThQQQwB8/studio_square_thumbnail.jpg?sqp=CL-P69AG-oaymwEICNYGEOADSFqi85f_AwYIvNGV0AY=&rs=AOn4CLClgoeCFxw5Uqtb-pdigAEI04UXpg' },
            { tag: 'Báo chí', title: 'Lan tỏa tiếng sáo qua mạng xã hội', link: 'https://nhandan.vn/lan-toa-tieng-sao-qua-mang-xa-hoi-post834113.html', image: 'https://khodulieu.sohoa.tuyenquang.gov.vn/congthongtin/tuyenquang/uploads/post-images/2024/01/nhac-sy-nsut-duc-lien.jpeg' },
            { tag: 'Báo chí', title: 'Gen Z đưa sáo H,Mông vươn tầm quốc tế', link: 'https://nhandan.vn/gen-z-dua-sao-hmong-vuon-tam-quoc-te-post818022.html', image: 'https://cdn.nhandan.vn/images/1ef398c4e2fb4bf07980a2ded785b3ef1734e246fd575e1c937d359d6862d0615463caa9579d44c28437fd74948be607c2381094306107c33e4c998a37d06158/181-4411.jpg.avif' },
            { tag: 'Sự kiện', title: 'Tích Tịch Tình Tang', link: 'https://baodanang.vn/thang-hoa-cung-am-nhac-truyen-thong-91-hoc-sinh-sinh-vien-fpt-edu-trinh-dien-nhac-cu-truyen-thong-tai-dem-cong-dien-va-trao-giai-fpt-edu-tich-tich-tinh-tang-2024-3195361.html', image: 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=2,quality=75,width=800,height=800/editor-images/rq/836a2fca-abe6-4c70-9ed3-64d5acfb3b70' },
          ].map((article, i) => (
            <a key={i} href={article.link} target="_blank" rel="noopener noreferrer" className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer flex flex-col">
               <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url(${article.image})` }}></div>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
               </div>
               <div className="p-6 flex flex-col flex-1">
                 <div className="flex justify-between items-center mb-4">
                   <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-100">{article.tag}</span>
                   <span className="text-xs text-gray-400">Tin mới</span>
                 </div>
                 <h4 className="text-xl font-bold mb-4 group-hover:text-[#8e9e6e] transition-colors line-clamp-2">{article.title}</h4>
                 <div className="mt-auto flex items-center gap-2 text-sm font-bold text-gray-500 group-hover:text-[#8e9e6e] transition-colors opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                    Đọc thêm <ArrowRight size={14} />
                 </div>
               </div>
            </a>
          ))}
        </div>
      </div>

      {/* Video Popup */}
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setIsVideoOpen(false)}
          >
             <button className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors" onClick={() => setIsVideoOpen(false)}>
               <X size={36} />
             </button>
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               transition={{ type: "spring", damping: 25, stiffness: 300 }}
               className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
               onClick={e => e.stopPropagation()}
             >
               <iframe 
                 width="100%" 
                 height="100%" 
                 src="https://www.youtube.com/embed/3MNDwy4jKtY?autoplay=1&list=RD3MNDwy4jKtY" 
                 title="YouTube video player" 
                 frameBorder="0" 
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                 allowFullScreen
               ></iframe>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Popup */}
      <AnimatePresence>
        {isDetailOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 md:p-12 backdrop-blur-sm"
            onClick={() => setIsDetailOpen(false)}
          >
             <motion.div 
               initial={{ y: 50, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               exit={{ y: 50, opacity: 0 }}
               transition={{ type: "spring", damping: 25, stiffness: 300 }}
               className="w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl max-h-full flex flex-col"
               onClick={e => e.stopPropagation()}
             >
               <div className="relative h-64 md:h-80 bg-[url('https://img.youtube.com/vi/3MNDwy4jKtY/maxresdefault.jpg')] bg-cover bg-center">
                 <button className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors" onClick={() => setIsDetailOpen(false)}>
                   <X size={20} />
                 </button>
               </div>
               <div className="p-8 md:p-12 overflow-y-auto">
                 <span className="text-[#8e9e6e] font-medium mb-4 tracking-wider uppercase text-sm block">Sự kiện nổi bật • 24 Thg 5, 2026</span>
                 <h3 className="text-3xl md:text-4xl font-bold mb-6 leading-tight text-black">Thiên Âm — Dự án âm nhạc kết hợp công nghệ AI và sáo trúc cổ truyền</h3>
                 <div className="prose prose-lg text-gray-600 max-w-none">
                   <p className="mb-4 text-lg">Sự kiện ra mắt dự án âm nhạc kết hợp độc đáo giữa âm thanh sáo trúc truyền thống và công nghệ trí tuệ nhân tạo, mở ra kỷ nguyên mới cho nghệ thuật dân tộc.</p>
                   <p className="mb-4">Dự án <strong>Thiên Âm</strong> không chỉ là sự kết hợp giữa công nghệ và nghệ thuật, mà còn là nỗ lực của LENFOLK nhằm bảo tồn và phát huy những giá trị văn hóa cốt lõi của dân tộc trong kỷ nguyên số.</p>
                   <p className="mb-4">Với AI tiên tiến, giờ đây mỗi người học sáo đều có thể được phân tích kỹ thuật thổi, nhịp điệu và độ chuẩn xác của âm thanh theo thời gian thực. Điều này mang lại trải nghiệm học tập mang tính tương tác cao và cá nhân hóa chưa từng có.</p>
                   <p className="mb-4">Sự kiện cũng đánh dấu bước hợp tác chiến lược giữa LENFOLK và các nghệ nhân sáo trúc hàng đầu Việt Nam, nhằm số hóa hàng ngàn bản nhạc cổ và tạo ra một thư viện âm thanh đồ sộ, sẵn sàng phục vụ cho thế hệ trẻ.</p>
                   <div className="mt-8 pt-8 border-t border-gray-100 flex items-center gap-4">
                     <button onClick={() => { setIsDetailOpen(false); setTimeout(() => setIsVideoOpen(true), 300); }} className="px-6 py-3 bg-black text-white rounded-full font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors">
                       <Play size={18} /> Xem Video Sự Kiện
                     </button>
                   </div>
                 </div>
               </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
