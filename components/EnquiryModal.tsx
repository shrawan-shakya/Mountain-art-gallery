
import React, { useState } from 'react';
import { Artwork } from '../types';

interface EnquiryModalProps {
  artwork: Artwork | null;
  onClose: () => void;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({ artwork, onClose }) => {
  const [submitting, setSubmitting] = useState(false);

  if (!artwork) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      alert("Inquiry sent successfully. A curator will contact you shortly.");
      setSubmitting(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
      <div 
        className="absolute inset-0 bg-softBlack/40 backdrop-blur-[4px]" 
        onClick={onClose}
      />
      <div className="relative z-[2] bg-bone w-full max-w-4xl border border-frameEbony shadow-2xl animate-fade-up overflow-hidden flex flex-col md:flex-row">
        <button 
          onClick={onClose}
          className="absolute top-6 right-8 text-3xl font-thin text-[#999] hover:text-gold z-10"
        >
          &times;
        </button>

        {/* Sidebar */}
        <div className="hidden md:flex md:w-1/3 bg-frameEbony p-10 flex-col justify-end border-r border-bone">
          <div className="mb-6 border-4 border-bone shadow-2xl">
            <img src={artwork.imageUrl} alt={artwork.title} className="w-full" />
          </div>
          <p className="text-bone/60 font-serif text-lg italic mb-1">{artwork.title}</p>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#999]">{artwork.artist}</p>
        </div>

        {/* Form Area */}
        <div className="flex-1 p-8 md:p-14">
          <header className="mb-10">
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold block mb-2">Acquisition Inquiry</span>
            <h3 className="font-serif text-3xl text-softBlack">Private Enquiry</h3>
          </header>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-[10px] uppercase tracking-[0.25em] text-[#aaa] mb-2">Your Name</label>
              <input type="text" required placeholder="Enter full name" className="w-full bg-transparent border-b border-softBlack/10 py-3 font-light text-sm focus:outline-none focus:border-gold" />
            </div>
            <div className="mb-6">
              <label className="block text-[10px] uppercase tracking-[0.25em] text-[#aaa] mb-2">Email Address</label>
              <input type="email" required placeholder="email@example.com" className="w-full bg-transparent border-b border-softBlack/10 py-3 font-light text-sm focus:outline-none focus:border-gold" />
            </div>
            <div className="mb-10">
              <label className="block text-[10px] uppercase tracking-[0.25em] text-[#aaa] mb-2">Message</label>
              <textarea rows={3} defaultValue={`I am interested in the piece titled "${artwork.title}" by ${artwork.artist}. Could you please provide more information regarding acquisition?`} className="w-full bg-transparent border-b border-softBlack/10 py-3 font-light text-sm focus:outline-none focus:border-gold resize-none" />
            </div>
            <button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-softBlack text-white py-5 text-[10px] uppercase tracking-[0.25em] font-medium transition-all hover:bg-gold disabled:opacity-50"
            >
              {submitting ? "Sending..." : "Submit Inquiry"}
            </button>
          </form>
          <p className="text-center text-[9px] uppercase tracking-[0.2em] text-[#aaa] mt-6 leading-relaxed">
            Our curators typically respond within 24 to 48 business hours.
          </p>
        </div>
      </div>
    </div>
  );
};
