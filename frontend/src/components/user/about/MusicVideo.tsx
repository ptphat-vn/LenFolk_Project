'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const SoundWave = ({ isLeft }: { isLeft: boolean }) => {
  const heights = [40, 60, 80, 110, 140, 180, 220]; // Tăng dần
  const finalHeights = isLeft ? heights : [...heights].reverse();

  return (
    <motion.div 
      initial={{ opacity: 0, x: isLeft ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="hidden lg:flex items-center gap-3 shrink-0"
    >
      {finalHeights.map((h, i) => (
        <motion.div
          key={i}
          animate={{ scaleY: [0.3, 1, 0.3] }}
          transition={{ 
            repeat: Infinity, 
            duration: 1.2, 
            delay: isLeft ? i * 0.15 : (finalHeights.length - i) * 0.15, 
            ease: "easeInOut" 
          }}
          className="w-3 bg-gray-900 rounded-full"
          style={{ height: `${h}px`, transformOrigin: "center" }}
        />
      ))}
    </motion.div>
  );
};

export const MusicVideo = () => {
  const playerRef = useRef<any>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [isScrolledMini, setIsScrolledMini] = useState(false);
  const [isYoutubeReady, setIsYoutubeReady] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isAllowedRoute = ['/about', '/news', '/courses'].includes(pathname);
  const forceMini = pathname === '/news' || pathname === '/courses';
  const isMini = isScrolledMini || forceMini;

  useEffect(() => {
    const handleScroll = () => {
      if (placeholderRef.current) {
        const rect = placeholderRef.current.getBoundingClientRect();
        // Trigger mini player when the bottom of the video placeholder is out of view
        if (rect.bottom < 100) {
          setIsScrolledMini(true);
        } else {
          setIsScrolledMini(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Only load iframe API if we are on an allowed route
    if (!isAllowedRoute) return;

    // Load YouTube API script if not already loaded
    if (!document.getElementById('youtube-iframe-api')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }

    const initPlayer = () => {
      if (playerRef.current) return;
      
      const targetElement = document.getElementById('yt-player-visible');
      if (!targetElement) return;

      playerRef.current = new window.YT.Player('yt-player-visible', {
        videoId: '3pQWPxVM1gg',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          showinfo: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          origin: window.location.origin,
          start: 4
        },
        events: {
          onReady: (event: any) => {
            const player = event.target;
            player.setVolume(0);
            player.playVideo();
            
            let vol = 0;
            const targetVol = 50;
            const fadeInterval = setInterval(() => {
              vol += 2;
              if (vol >= targetVol) {
                vol = targetVol;
                clearInterval(fadeInterval);
              }
              if (player && typeof player.setVolume === 'function') {
                player.setVolume(vol);
              }
            }, 200);
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              // Wait 2.5 seconds for YouTube's native UI to auto-hide, then reveal the video
              setTimeout(() => {
                setIsYoutubeReady(true);
              }, 2500);
            }
            if (event.data === window.YT.PlayerState.ENDED) {
              if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
                playerRef.current.playVideo();
              }
            }
          }
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    }

    return () => {
      // We DO NOT destroy the player if we navigate between allowed routes!
      // The dependency array is [], so it will only destroy when unmounted.
    };
  }, [isAllowedRoute]);

  useEffect(() => {
    // If not an allowed route, destroy the player to completely stop music
    if (!isAllowedRoute) {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
        playerRef.current = null;
        setIsYoutubeReady(false);
      }
    }
  }, [isAllowedRoute]);

  if (!isAllowedRoute) return null;

  return (
    <section className={forceMini ? "" : "pt-24 pb-16 bg-white relative flex flex-col items-center"}>
      <div className={forceMini ? "" : "container mx-auto px-6 max-w-[1200px] relative flex flex-col items-center"}>
        {!forceMini && (
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Lắng nghe âm điệu</h2>
            <p className="text-gray-500">Giai điệu sáo trúc truyền cảm hứng</p>
          </div>
        )}
        
        {/* Container flex để chứa sóng âm và video */}
        <div className={forceMini ? "" : "flex items-center justify-center w-full gap-8 xl:gap-16"}>
          
          <AnimatePresence>
            {!isMini && <SoundWave isLeft={true} />}
          </AnimatePresence>

          {/* Placeholder giữ vị trí và kích thước trên DOM */}
          <div 
            ref={placeholderRef} 
            className={forceMini ? "hidden" : "w-full max-w-[800px] aspect-video relative shrink-0"}
          >
            {/* Framer motion xử lý layout transition */}
            <motion.div
              layout
              initial={forceMini ? false : { opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={
                isMini
                  ? "fixed bottom-8 right-8 z-[9999] w-20 h-20 md:w-28 md:h-28 shadow-2xl border-4 border-white rounded-full overflow-hidden cursor-pointer bg-gray-900"
                  : "absolute inset-0 w-full h-full shadow-2xl bg-gray-900 rounded-3xl overflow-hidden"
              }
              onClick={() => {
                if (isMini) {
                  if (forceMini) {
                    router.push('/about');
                  } else {
                    window.scrollTo({ top: placeholderRef.current?.offsetTop! - 100, behavior: 'smooth' });
                  }
                }
              }}
            >
            {/* Lớp xoay đĩa than */}
            <div className={`w-full h-full relative ${isMini ? 'animate-[spin_8s_linear_infinite]' : ''}`}>
              
              {/* Iframe wrapper */}
              <div className={`relative w-full h-full pointer-events-none flex items-center justify-center ${isMini ? 'scale-[3.5]' : ''}`}>
                <div id="yt-player-visible" className="w-full h-full relative z-0"></div>
                
                {/* Thumbnail Overlay để che UI của YouTube lúc mới load */}
                <motion.div 
                  initial={{ opacity: 1 }}
                  animate={{ opacity: isYoutubeReady && !isMini ? 0 : 1 }}
                  transition={{ duration: 1 }}
                  className="absolute inset-0 z-10 bg-[url('https://img.youtube.com/vi/3pQWPxVM1gg/maxresdefault.jpg')] bg-cover bg-center pointer-events-none"
                />
              </div>
              
              {/* Tâm đĩa than */}
              <AnimatePresence>
                {isMini && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 bg-gray-100 rounded-full border-4 border-gray-300 z-10 shadow-inner"
                  />
                )}
              </AnimatePresence>
              
            </div>
            
            {/* Nốt nhạc bay bổng khi quay (tuỳ chọn thêm cho sinh động) */}
            <AnimatePresence>
              {isMini && (
                 <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="absolute -top-2 -right-2 w-4 h-4 text-gray-800"
                 >
                   ♪
                 </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <AnimatePresence>
          {!isMini && <SoundWave isLeft={false} />}
        </AnimatePresence>
        
        </div>
        
        {!forceMini && (
          <div className="mt-4 w-full max-w-[800px] flex justify-center text-center">
            <p className="text-sm text-gray-400 italic">Trích nguồn từ Kênh Youtube: Sáo trúc L.A</p>
          </div>
        )}
      </div>
    </section>
  );
};
