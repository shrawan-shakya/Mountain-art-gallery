
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Artwork } from './types';
import { INITIAL_ARTWORKS, BENTO_HERO_IMAGES } from './constants';
import { ArtworkCard } from './components/ArtworkCard';
import { MuseumFrame } from './components/MuseumFrame';
import { EnquiryModal } from './components/EnquiryModal';
import { Dashboard } from './components/Dashboard';
import { AdminLogin } from './components/AdminLogin';

function App() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  
  // Smooth scroll interpolation refs
  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    fetchArtworks();
    const auth = sessionStorage.getItem('gallery_auth');
    if (auth === 'true') setIsAuthenticated(true);

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchArtworks = async () => {
    try {
      const response = await fetch('/api/artworks');
      if (!response.ok) throw new Error("Server error");
      const data = await response.json();
      setArtworks(data.length > 0 ? data : INITIAL_ARTWORKS);
    } catch (e) {
      setArtworks(INITIAL_ARTWORKS);
    }
  };

  const addArtwork = async (formData: FormData) => {
    try {
      const response = await fetch('/api/artworks', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error("Failed to add artwork");
      const newArt = await response.json();
      setArtworks(prev => [newArt, ...prev]);
    } catch (e) {
      console.error("Add Artwork Error:", e);
    }
  };

  const updateArtwork = async (id: string, formData: FormData) => {
    try {
      const response = await fetch(`/api/artworks/${id}`, {
        method: 'PUT',
        body: formData
      });
      if (!response.ok) throw new Error("Failed to update artwork");
      const updatedArt = await response.json();
      setArtworks(prev => prev.map(art => art.id === id ? updatedArt : art));
    } catch (e) {
      console.error("Update Artwork Error:", e);
    }
  };

  const deleteArtwork = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this piece from the archive?")) return;
    try {
      const response = await fetch(`/api/artworks/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error("Failed to delete artwork");
      setArtworks(prev => prev.filter(art => art.id !== id));
    } catch (e) {
      console.error("Delete Artwork Error:", e);
    }
  };

  // Smoothing loop
  useEffect(() => {
    const update = () => {
      // Linear interpolation (lerp) for buttery smooth motion
      const lerpAmount = 0.085; 
      const diff = targetProgress.current - currentProgress.current;
      
      if (Math.abs(diff) > 0.0001) {
        currentProgress.current += diff * lerpAmount;
        setScrollProgress(currentProgress.current);
      }
      
      rafId.current = requestAnimationFrame(update);
    };
    
    rafId.current = requestAnimationFrame(update);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      setScrolled(currentScrollY > 80);

      if (currentScrollY > lastScrollY.current && currentScrollY > 150) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
      
      lastScrollY.current = currentScrollY;

      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const totalHeight = heroRef.current.offsetHeight - window.innerHeight;
        // Update the target, the RAF loop handles the smoothing
        const progress = Math.min(Math.max(-rect.top / totalHeight, 0), 1);
        targetProgress.current = progress;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const bentoConfig = useMemo(() => {
    const isMobile = windowSize.width < 768;
    const w = windowSize.width;
    const h = windowSize.height;

    return [
      { 
        final: { x: 0, y: 0, scale: isMobile ? 0.75 : 1.1 },
        start: { x: 0, y: 0, scale: isMobile ? 2.5 : 4.0, rotate: 0 }
      },
      { 
        final: { x: -w * (isMobile ? 0.30 : 0.32), y: -h * (isMobile ? 0.30 : 0.28), scale: isMobile ? 0.35 : 0.6 },
        start: { x: -w * 1.5, y: -h * 1.2, scale: 0.4, rotate: -25 }
      },
      { 
        final: { x: w * (isMobile ? 0.30 : 0.32), y: -h * (isMobile ? 0.30 : 0.28), scale: isMobile ? 0.35 : 0.6 },
        start: { x: w * 1.5, y: -h * 1.2, scale: 0.4, rotate: 25 }
      },
      { 
        final: { x: -w * (isMobile ? 0.30 : 0.32), y: h * (isMobile ? 0.30 : 0.28), scale: isMobile ? 0.35 : 0.6 },
        start: { x: -w * 1.5, y: h * 1.2, scale: 0.4, rotate: -25 }
      },
      { 
        final: { x: w * (isMobile ? 0.30 : 0.32), y: h * (isMobile ? 0.30 : 0.28), scale: isMobile ? 0.35 : 0.6 },
        start: { x: w * 1.5, y: h * 1.2, scale: 0.4, rotate: 25 }
      }
    ];
  }, [windowSize]);

  const handleLogin = (pass: string) => {
    if (pass === '1234' || pass === 'admin') {
      setIsAuthenticated(true);
      setShowLogin(false);
      setShowDashboard(true);
      sessionStorage.setItem('gallery_auth', 'true');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowDashboard(false);
    sessionStorage.removeItem('gallery_auth');
  };

  return (
    <div className="min-h-screen bg-bone selection:bg-gold/30">
      {/* Navigation - With slide-up and fade-out functionality */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] px-4 sm:px-16 
          ${scrolled ? 'bg-bone/95 backdrop-blur-md py-4 lg:py-6 shadow-sm border-b border-softBlack/5' : 'py-6 lg:py-12'}
          ${isNavVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
        `}
      >
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 border border-softBlack flex items-center justify-center mr-3 sm:mr-5 font-serif text-lg sm:text-2xl transition-all duration-700 group-hover:border-gold group-hover:rotate-[135deg] group-hover:bg-gold group-hover:text-white">
              <span className="transition-transform duration-700 group-hover:rotate-[-135deg]">M</span>
            </div>
            <h1 className="font-serif text-base sm:text-2xl uppercase tracking-[0.1em] sm:tracking-[0.25em] text-softBlack whitespace-nowrap">
              Mountain <span className="italic font-light text-[#999] group-hover:text-gold transition-all">Art Gallery</span>
            </h1>
          </div>

          <div className="hidden lg:flex gap-16 items-center">
            {['Explore', 'About Us'].map(item => (
              <a key={item} href={`#explore`} className="text-[9px] uppercase tracking-[0.4em] text-softBlack/50 hover:text-gold transition-all relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gold transition-all duration-500 group-hover:w-full" />
              </a>
            ))}
            <button onClick={() => { if (isAuthenticated) setShowDashboard(true); else setShowLogin(true); }} className="text-[9px] uppercase tracking-[0.4em] text-gold font-bold hover:text-gold/70 transition-all border border-gold/20 px-4 py-2 hover:bg-gold/5">
              {isAuthenticated ? 'Archive' : 'Curator Portal'}
            </button>
          </div>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 z-[1100]">
            <span className={`w-6 h-[1px] bg-softBlack transition-all duration-500 ${isMobileMenuOpen ? 'rotate-45 translate-y-[3px]' : ''}`} />
            <span className={`w-6 h-[1px] bg-softBlack transition-all duration-500 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`w-6 h-[1px] bg-softBlack transition-all duration-500 ${isMobileMenuOpen ? '-rotate-45 -translate-y-[4px]' : ''}`} />
          </button>
        </div>
      </nav>

      <main>
        {/* CINEMATIC BENTO SCROLL HERO (400vh Track) */}
        <section ref={heroRef} className="relative h-[400vh] bg-bone">
          <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
            
            {/* Background Texture/Emblem */}
            <div className="absolute font-serif text-[30rem] md:text-[50rem] italic opacity-[0.015] z-0 pointer-events-none select-none"
                 style={{ 
                   transform: `scale(${1 + scrollProgress * 0.3}) rotate(${scrollProgress * 4}deg)`,
                 }}>M</div>

            {/* BENTO GRID ASSEMBLY SYSTEM - Smoothly Interpolated */}
            <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
              {BENTO_HERO_IMAGES.map((img, i) => {
                const config = bentoConfig[i];
                if (!config) return null;

                const curX = config.start.x + (config.final.x - config.start.x) * scrollProgress;
                const curY = config.start.y + (config.final.y - config.start.y) * scrollProgress;
                const curScale = config.start.scale + (config.final.scale - config.start.scale) * scrollProgress;
                const curRotate = (config.start.rotate || 0) * (1 - scrollProgress);

                return (
                  <div 
                    key={i} 
                    className="absolute left-1/2 top-1/2 will-change-transform"
                    style={{
                      transform: `translate3d(calc(-50% + ${curX}px), calc(-50% + ${curY}px), 0) scale(${curScale}) rotate(${curRotate}deg)`,
                      zIndex: i === 0 ? 5 : 4,
                      opacity: Math.min(scrollProgress * 2.5, 1)
                    }}
                  >
                    <MuseumFrame className="w-56 md:w-80 lg:w-[32rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]">
                      <div className="aspect-[4/3] bg-bone overflow-hidden flex items-center justify-center">
                        <img src={img} className="w-full h-full object-cover" alt="Hero Artwork" />
                      </div>
                    </MuseumFrame>
                  </div>
                );
              })}
            </div>

            {/* TUNNELING HEADER */}
            <div className="relative z-20 text-center px-6 pointer-events-none transition-all duration-300" 
                 style={{ 
                   opacity: Math.max(1 - scrollProgress * 5, 0),
                   transform: `scale(${1 - scrollProgress * 0.4}) translateY(${scrollProgress * -100}px)` 
                 }}>
              <span className="font-sans text-[8px] sm:text-[10px] uppercase tracking-[1em] sm:tracking-[1.8em] font-medium text-softBlack/40 mb-6 block translate-x-[0.5em] sm:translate-x-[0.9em]">
                Unveiling the archive
              </span>
              <h2 className="font-serif text-3xl sm:text-6xl lg:text-9xl tracking-[0.1em] text-softBlack uppercase leading-none mb-10">
                <span className="italic font-light text-xl sm:text-3xl block mb-4 opacity-60 tracking-[0.3em] normal-case">Behold</span>
                <span className="font-bold relative">
                  THE <span className="text-gold">GALLERY</span>
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-1/4 h-[1px] bg-gold/30" />
                </span>
              </h2>
            </div>

            {/* Scroll Progress Indicator */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 transition-all duration-500"
                 style={{ opacity: 1 - scrollProgress * 15 }}>
              <span className="text-[7px] uppercase tracking-[0.6em] text-softBlack/20 italic">Descent into the sublime</span>
              <div className="w-[1px] h-16 bg-softBlack/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gold animate-scroll-slide" />
              </div>
            </div>
          </div>
        </section>

        {/* Explore Section */}
        <section id="explore" className="py-24 sm:py-64 px-4 sm:px-16 bg-bone">
          <div className="max-w-[1440px] mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-end mb-24 sm:mb-48 max-sm:items-start gap-12 border-b border-softBlack/5 pb-16 sm:pb-24">
              <div className="max-w-2xl">
                <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.4em] text-gold block mb-8 font-bold">Curated Archives</span>
                <h3 className="font-serif text-4xl sm:text-7xl lg:text-9xl font-normal leading-[1] text-softBlack tracking-tighter">Peaks &<br/>Presence</h3>
              </div>
              <div className="max-w-[420px]">
                <p className="text-sm sm:text-base text-[#666] font-light leading-relaxed mb-8 italic">"Moments of high-altitude stillness, curated for the modern collector of the sublime."</p>
                <div className="flex items-center gap-4 text-[7px] sm:text-[9px] uppercase tracking-[0.3em] text-softBlack/40">
                  <div className="w-10 h-[1px] bg-softBlack/20" />
                  <span>Permanent Exhibition</span>
                </div>
              </div>
            </header>
            
            <div className="gallery-grid-columns">
              {artworks.map(art => (
                <ArtworkCard key={art.id} artwork={art} onEnquire={setSelectedArtwork} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 sm:py-40 px-4 sm:px-16 bg-bone border-t border-softBlack/5 text-center">
        <div className="max-w-[1400px] mx-auto flex flex-col items-center gap-12 text-softBlack/30">
          <div className="flex flex-col items-center gap-6">
            <div className="w-10 h-10 border border-softBlack/20 flex items-center justify-center font-serif text-xl"><span>M</span></div>
            <p className="font-serif text-2xl italic tracking-tight opacity-80">Mountain Art Gallery</p>
          </div>
          <div className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] flex flex-col gap-4">
            <p>&copy; {new Date().getFullYear()} Mountain Art Gallery</p>
            <p className="opacity-50">London &bull; Chamonix &bull; Zermatt</p>
          </div>
        </div>
      </footer>

      <EnquiryModal artwork={selectedArtwork} onClose={() => setSelectedArtwork(null)} />
      {showLogin && <AdminLogin onLogin={handleLogin} onClose={() => setShowLogin(false)} />}
      {showDashboard && (
        <Dashboard 
          artworks={artworks} 
          onAdd={addArtwork} 
          onUpdate={updateArtwork}
          onDelete={deleteArtwork} 
          onLogout={handleLogout}
          onClose={() => setShowDashboard(false)} 
        />
      )}
    </div>
  );
}

export default App;
