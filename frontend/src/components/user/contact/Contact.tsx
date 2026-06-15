'use client';
import React, { useState } from 'react';
import { Check, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

export const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section id="contact" className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-20">

          {/* Left Column */}
          <div className="lg:w-2/5 flex flex-col justify-start pt-0">
            <h2 className="text-4xl md:text-5xl font-be-vietnam-pro mb-6 text-black tracking-tight leading-tight">
              Chúng tôi luôn<br />sẵn sàng lắng nghe
            </h2>
            <p className="text-lg text-gray-500 mb-12">
              Hãy để lại câu hỏi — đội ngũ LENFOLK sẽ<br /> phản hồi trong vòng 24 giờ.
            </p>

            <div className="space-y-8 mb-16">
              <div className="border-l-2 border-[#d6ddc6] pl-6">
                <div className="flex items-center gap-3 mb-1">
                  <Mail size={18} className="text-[#8e9e6e]" />
                  <span className="font-bold text-black">Email</span>
                </div>
                <p className="text-gray-500">crony1705@gmail.com</p>
              </div>

              <div className="border-l-2 border-[#d6ddc6] pl-6">
                <div className="flex items-center gap-3 mb-1">
                  <Phone size={18} className="text-[#8e9e6e]" />
                  <span className="font-bold text-black">Hotline</span>
                </div>
                <p className="text-black font-medium">0901 234 567</p>
                <p className="text-gray-500 text-sm">Thứ 2 – Thứ 6, 8:00 – 18:00</p>
              </div>

              <div className="border-l-2 border-[#d6ddc6] pl-6">
                <div className="flex items-center gap-3 mb-1">
                  <MapPin size={18} className="text-[#8e9e6e]" />
                  <span className="font-bold text-black">Văn phòng</span>
                </div>
                <p className="text-black font-medium">OfficeHaus</p>
                <p className="text-gray-500 leading-relaxed">165 Tân Thắng, Phường Sơn Kỳ<br />(Phường Sơn Kỳ, Quận Tân Phú), TP.HCM</p>
                <a href="#" className="inline-flex items-center gap-1 text-[#8e9e6e] text-sm font-bold mt-3 hover:underline">
                  Xem bản đồ <ArrowRight size={14} />
                </a>
              </div>
            </div>

            <div className="flex gap-6 text-sm font-bold text-black">
              <a href="https://www.facebook.com/profile.php?id=61590024181109" target="_blank" rel="noopener noreferrer" className="hover:text-[#8e9e6e] transition-colors">Facebook</a>
              <a href="https://www.tiktok.com/@lenfolk3?_r=1&_t=ZS-96k1lxAtcmL" target="_blank" rel="noopener noreferrer" className="hover:text-[#8e9e6e] transition-colors">TikTok</a>
            </div>
          </div>

          {/* Right Column (Form) */}
          <div className="lg:w-3/5">
            <div className="bg-[#e2e8d5] p-8 md:p-12 rounded-[32px] border border-gray-100/50 shadow-sm">
              {submitted ? (
                <div className="h-[400px] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
                  <div className="w-20 h-20 rounded-full bg-[#8e9e6e]/10 flex items-center justify-center text-[#8e9e6e] mb-6">
                    <Check size={40} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Cảm ơn bạn!</h3>
                  <p className="text-gray-600">Chúng tôi sẽ phản hồi sớm nhất có thể.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-black mb-8">Gửi câu hỏi cho chúng tôi</h3>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-black mb-2">Họ và tên *</label>
                        <input required type="text" className="w-full px-4 py-3 rounded-2xl bg-white border-none focus:ring-2 focus:ring-[#8e9e6e] transition-all outline-none shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-black mb-2">Email *</label>
                        <input required type="email" className="w-full px-4 py-3 rounded-2xl bg-white border-none focus:ring-2 focus:ring-[#8e9e6e] transition-all outline-none shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-black mb-2">Số điện thoại</label>
                        <input type="tel" className="w-full px-4 py-3 rounded-2xl bg-white border-none focus:ring-2 focus:ring-[#8e9e6e] transition-all outline-none shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-black mb-2">Bạn quan tâm đến</label>
                        <select className="w-full px-4 py-3 rounded-2xl bg-white border-none focus:ring-2 focus:ring-[#8e9e6e] transition-all outline-none appearance-none text-gray-700 shadow-sm">
                          <option>Khóa Free</option>
                          <option>Khóa Tech</option>
                          <option>Khóa Repertoire</option>
                          <option>Khác</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-black mb-2">Nội dung câu hỏi *</label>
                      <textarea required rows={4} className="w-full px-4 py-3 rounded-2xl bg-white border-none focus:ring-2 focus:ring-[#8e9e6e] transition-all outline-none resize-none shadow-sm"></textarea>
                    </div>

                    <button type="submit" className="w-full py-4 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-all flex items-center justify-center gap-2 mt-2">
                      Gửi câu hỏi <ArrowRight size={18} />
                    </button>

                    <p className="text-center text-xs text-gray-400 mt-4">
                      * Thông tin của bạn được bảo mật tuyệt đối.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
