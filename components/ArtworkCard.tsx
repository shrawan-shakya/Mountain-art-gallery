import React from 'react';
import { Artwork } from '../types';
import { MuseumFrame } from './MuseumFrame';

interface ArtworkCardProps {
  artwork: Artwork;
  onEnquire: (artwork: Artwork) => void;
}

export const ArtworkCard: React.FC<ArtworkCardProps> = ({ artwork, onEnquire }) => {
  return (
    <div className="artwork-item mb-24 sm:mb-32 group relative">
      <MuseumFrame className="w-full">
        <div className="overflow-hidden relative flex items-center justify-center bg-gray-100">
          <img 
            src={artwork.imageUrl} 
            alt={artwork.title} 
            className="w-full h-auto object-cover transition-transform duration-[5000ms] ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-softBlack/0 group-hover:bg-softBlack/5 transition-colors duration-1000 pointer-events-none" />
        </div>
      </MuseumFrame>

      {/* Metallic Informational Plaque */}
      <div className="plaque-metallic mt-8 sm:mt-12 mx-auto w-[88%] sm:w-[85%] max-w-[300px] p-5 sm:p-8 bg-gradient-to-br from-[#F8F8F8] via-[#FFFFFF] to-[#EBEBEB] border-[0.5px] border-[#d8d8d8] relative text-center shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-all duration-700 hover:scale-[1.03] hover:shadow-[0_25px_50px_rgba(0,0,0,0.12)] z-40">
        
        {/* Silver Mounting Hardware */}
        <div className="absolute top-2.5 left-2.5 w-1.5 h-1.5 rounded-full bg-silver shadow-inner" />
        <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-silver shadow-inner" />
        <div className="absolute bottom-2.5 left-2.5 w-1.5 h-1.5 rounded-full bg-silver shadow-inner" />
        <div className="absolute bottom-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-silver shadow-inner" />

        <div className="relative z-20">
          <span className="block text-[8px] sm:text-[9px] uppercase tracking-[0.35em] sm:tracking-[0.45em] text-[#999] mb-3 sm:mb-4 font-semibold">{artwork.artist}</span>
          <h4 className="font-serif text-lg sm:text-2xl font-bold italic mb-2 sm:mb-3 text-softBlack leading-tight">{artwork.title}</h4>
          
          <div className="flex flex-col items-center gap-1 sm:gap-1.5 mb-6 sm:mb-8">
            <p className="text-[8px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#777] font-light">{artwork.medium}</p>
            <div className="w-8 sm:w-10 h-[0.5px] bg-[#ccc] my-1" />
            <p className="text-[8px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#999]">{artwork.dimensions} &bull; {artwork.year}</p>
          </div>

          <button 
            onClick={() => onEnquire(artwork)}
            className="group/btn relative overflow-hidden bg-transparent border border-softBlack/10 px-6 sm:px-8 py-2.5 sm:py-3 text-[7px] sm:text-[8px] uppercase tracking-[0.3em] sm:tracking-[0.4em] cursor-pointer transition-all duration-500 hover:border-accent hover:text-accent"
          >
            <span className="relative z-10">Private Inquiry</span>
            <div className="absolute inset-0 bg-accent/5 scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-center duration-700" />
          </button>
        </div>
      </div>
    </div>
  );
};