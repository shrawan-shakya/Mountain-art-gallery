import React from 'react';

interface MuseumFrameProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A sophisticated multi-layered museum frame.
 * Refined proportions with Silver/Platinum accents for a cool luxury aesthetic.
 */
export const MuseumFrame: React.FC<MuseumFrameProps> = ({ children, className = "" }) => {
  return (
    <div className={`relative bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)] sm:shadow-[0_45px_90px_-20px_rgba(0,0,0,0.45)] transition-all duration-1000 ${className}`}>
      {/* 1. Heavy Ebony Wood Outer Shell */}
      <div className="absolute inset-0 border-[11px] sm:border-[19px] border-frameEbony z-10 pointer-events-none overflow-hidden">
        {/* Subtle wood texture/lighting */}
        <div className="absolute inset-0 opacity-[0.2] bg-gradient-to-tr from-black via-transparent to-white/10" />
        {/* Beveled edge detail */}
        <div className="absolute inset-0 border-[0.5px] border-white/5" />
      </div>

      {/* 2. Precision Silver Fillet (Inset within the wood) */}
      <div className="absolute inset-[10px] sm:inset-[17px] z-20 pointer-events-none border-[1px] sm:border-[2px] border-silver/50 shadow-[0_0_8px_rgba(192,192,192,0.15)]" />

      {/* 3. Wide Museum Matting */}
      <div className="p-[22px] sm:p-[43px] bg-[#FCFCFC] relative z-0">
        <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.03)] sm:shadow-[inset_0_0_50px_rgba(0,0,0,0.05)] pointer-events-none" />

        {/* 4. Inner Silver Fillet / Bevel (Against the artwork) */}
        <div className="relative w-full h-full border-[1.5px] sm:border-[2.5px] border-silver/40 shadow-inner overflow-hidden bg-bone">
          <div className="absolute inset-0 shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] sm:shadow-[inset_0_4px_20px_rgba(0,0,0,0.15)] pointer-events-none z-30" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent z-[25] pointer-events-none opacity-40" />

          {/* THE ARTWORK CONTENT */}
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            {children}
          </div>
        </div>
      </div>

      {/* Corner Joinery Details - Silver */}
      <div className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-l-[1px] border-t-[1px] border-silver/30 z-[30] translate-x-[11px] sm:translate-x-[19px] translate-y-[11px] sm:translate-y-[19px]" />
      <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-r-[1px] border-t-[1px] border-silver/30 z-[30] -translate-x-[11px] sm:-translate-x-[19px] translate-y-[11px] sm:translate-y-[19px]" />
      <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-l-[1px] border-b-[1px] border-silver/30 z-[30] translate-x-[11px] sm:translate-x-[19px] -translate-y-[11px] sm:-translate-y-[19px]" />
      <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-r-[1px] border-b-[1px] border-silver/30 z-[30] -translate-x-[11px] sm:-translate-x-[19px] -translate-y-[11px] sm:-translate-y-[19px]" />
    </div>
  );
};