import Image from 'next/image';

export function BrandPanel() {
  return (
    <section
      className="hidden lg:flex w-[60%] relative flex-col justify-center items-center border-r border-[#D6DDC6] overflow-hidden"
      style={{ minHeight: '100vh' }}
    >
      <style>{`
        @keyframes brandFadeIn {
          from { opacity: 0; transform: translateX(-28px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes brandFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .brand-logo   { animation: brandFadeIn 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both; }
        .brand-title  { animation: brandFadeIn 0.7s cubic-bezier(0.22,1,0.36,1) 0.28s both; }
        .brand-tag    { animation: brandFadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.44s both; }
        .brand-divider{ animation: brandFadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.58s both; }
        .brand-bg     { animation: brandFadeUp 1s ease-out 0s both; }
      `}</style>

      {/* Background image */}
      <Image
        src="/images/background.png"
        alt="LenFolk background"
        fill
        sizes="(max-width: 1024px) 100vw, 60vw"
        className="object-cover object-center brand-bg"
        priority
      />

      <div className="absolute inset-0 bg-[#fcfbf8]/10" />

      <div className="relative z-10 flex flex-col items-center max-w-md text-center p-12">
        <div className="w-64 h-64 mb-8 relative brand-logo">
          <Image
            src="/images/logo_green.png"
            alt="LenFolk Logo"
            fill
            sizes="256px"
            className="object-contain"
            priority
          />
        </div>

        <h1 className="brand-title text-[48px] font-bold tracking-[-0.02em] text-[#28350f] mb-6 leading-tight">
          Empower Learning,
          <br />
          Manage Smarter
        </h1>
        <p className="brand-tag text-[16px] leading-6 text-[#3e4b24] opacity-90 tracking-widest uppercase">
          LenFolk Admin Console
        </p>

        <div className="brand-divider w-24 h-px bg-[#404e26] opacity-30 mt-12 shadow-[0_0_8px_rgba(64,78,38,0.5)]" />
      </div>
    </section>
  );
}
