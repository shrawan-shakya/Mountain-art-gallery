import React from 'react';

interface MuseumFrameProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A sophisticated multi-layered museum frame.
 * Features thickened golden fillets and reinforced corner joinery for a premium aesthetic.
 */
export const MuseumFrame: React.FC<MuseumFrameProps> = ({ children, className = "" }) => {
  return (
    <div className={`relative bg-white shadow-[0_45px_90px_-20px_rgba(0,0,0,0.45)] transition-all duration-1000 ${className}`}>
      {/* 1. Heavy Ebony Wood Outer Shell */}
      <div className="absolute inset-0 border-[24px] border-frameEbony z-10 pointer-events-none overflow-hidden">
        {/* Subtle wood texture/lighting */}
        <div className="absolute inset-0 opacity-[0.2] bg-gradient-to-tr from-black via-transparent to-white/10" />
        {/* Beveled edge detail */}
        <div className="absolute inset-0 border-[1px] border-white/5" />
      </div>

      {/* 2. Precision Gold Fillet (Inset within the wood) - THICKENED */}
      <div className="absolute inset-[22px] bottom-[22px] right-[22px] z-20 pointer-events-none border-[3px] border-gold/80 shadow-[0_0_15px_rgba(212,175,55,0.25)]">
      </div>

      {/* 3. Wide Museum Matting (The white space) */}
      <div className="p-[68px] max-sm:p-[36px] bg-[#FCFCFC] relative z-0">
        {/* Deep matting shadow */}
        <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.05)] pointer-events-none" />

        {/* 4. Inner Gold Fillet / Bevel (Against the artwork) - THICKENED */}
        <div className="relative w-full h-full border-[3px] border-gold/70 shadow-inner overflow-hidden bg-bone">
          {/* Internal shadow for artwork depth */}
          <div className="absolute inset-0 shadow-[inset_0_4px_20px_rgba(0,0,0,0.15)] pointer-events-none z-30" />
          
          {/* Glass atmospheric overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent z-[25] pointer-events-none opacity-40" />

          {/* THE ARTWORK CONTENT */}
          <div className="relative z-10 w-full h-full">
            {children}
          </div>
        </div>
      </div>

      {/* Corner Joinery Details - THICKENED & LARGER */}
      <div className="absolute top-0 left-0 w-10 h-10 border-l-2 border-t-2 border-gold/50 z-[30] translate-x-[24px] translate-y-[24px]" />
      <div className="absolute top-0 right-0 w-10 h-10 border-r-2 border-t-2 border-gold/50 z-[30] -translate-x-[24px] translate-y-[24px]" />
      <div className="absolute bottom-0 left-0 w-10 h-10 border-l-2 border-b-2 border-gold/50 z-[30] translate-x-[24px] -translate-y-[24px]" />
      <div className="absolute bottom-0 right-0 w-10 h-10 border-r-2 border-b-2 border-gold/50 z-[30] -translate-x-[24px] -translate-y-[24px]" />
    </div>
  );
};