import React, { useEffect, useState } from 'react';
import { LonzoLogo } from '../common/LonzoLogo';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 400);
          return 100;
        }
        return prev + 18;
      });
    }, 280);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-6 sm:p-10 bg-[#090611] overflow-hidden select-none">
      {/* Background silky glowing neon ribbon waves matching reference */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top ambient radial gradient */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#8B20FF]/25 via-[#F328D5]/20 to-transparent rounded-full blur-[120px]" />
        
        {/* Abstract neon swoosh lines matching screen #7 */}
        <svg
          className="absolute inset-0 w-full h-full opacity-60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="splashNeonSwoosh" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B20FF" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#F328D5" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path
            d="M-100,600 C300,200 800,800 1600,300"
            stroke="url(#splashNeonSwoosh)"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M-50,700 C400,300 900,900 1700,400"
            stroke="url(#splashNeonSwoosh)"
            strokeWidth="1.5"
            strokeDasharray="8 6"
            fill="none"
          />
        </svg>
      </div>

      {/* Top spacer with Skip Intro button */}
      <div className="w-full flex justify-end z-10">
        <button
          onClick={onComplete}
          className="text-xs text-[#B9AECF] hover:text-white bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10 transition-colors backdrop-blur-sm"
        >
          Skip Intro ›
        </button>
      </div>

      {/* Center Brand Identity with Crowned Play Icon matching screen #7 */}
      <div className="flex flex-col items-center z-10 animate-fade-in my-auto text-center space-y-4">
        <LonzoLogo size="xl" showTagline={true} />

        {/* Circular spinning ring from reference screen #7 */}
        <div className="pt-3 flex flex-col items-center">
          <div className="relative w-9 h-9 mb-2.5">
            <div className="w-full h-full rounded-full border-2 border-white/15 border-t-[#F328D5] border-r-[#8B20FF] animate-spin" />
            <div className="absolute inset-0 rounded-full blur-[6px] bg-[#F328D5]/25 animate-pulse pointer-events-none" />
          </div>
          <span className="text-xs font-semibold text-[#B9AECF] tracking-widest">
            Loading...
          </span>
        </div>
      </div>

      {/* Bottom Loading Progress Bar */}
      <div className="w-full max-w-xs flex flex-col items-center gap-3 z-10 pb-6">
        <div className="w-full h-1.5 bg-[#160C25] rounded-full overflow-hidden border border-white/10 p-[1px] relative shadow-lg">
          <div
            className="h-full bg-gradient-to-r from-[#8B20FF] via-[#F328D5] to-[#FFC84A] rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_#F328D5]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
