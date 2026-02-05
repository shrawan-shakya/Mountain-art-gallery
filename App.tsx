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
  
  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    fetchArtworks();
    const auth = sessionStorage.getItem('gallery_auth');
    if (auth === 'true') setIsAuthenticated(true);

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
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

  useEffect(() => {
    const update = () => {
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

      if (!isMobileMenuOpen) {
        if (currentScrollY > lastScrollY.current && currentScrollY > 150) {
          setIsNavVisible(false);
        } else {
          setIsNavVisible(true);
        }
      }
      
      lastScrollY.current = currentScrollY;
      
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const totalHeight = heroRef.current.offsetHeight - window.innerHeight;
        const progress = Math.min(Math.max(-rect.top / totalHeight, 0), 1);
        targetProgress.current = progress;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsNavVisible(true);
  };

  const bentoConfig = useMemo(() => {
    const isMobile = windowSize.width < 768;
    const w = windowSize.width;
    const h = windowSize.height;
    return [
      { final: { x: 0, y: 0, scale: isMobile ? 0.75 : 1.1 }, start: { x: 0, y: 0, scale: isMobile ? 2.5 : 4.0, rotate: 0 } },
      { final: { x: -w * (isMobile ? 0.30 : 0.32), y: -h * (isMobile ? 0.30 : 0.28), scale: isMobile ? 0.35 : 0.6 }, start: { x: -w * 1.5, y: -h * 1.2, scale: 0.4, rotate: -25 } },
      { final: { x: w * (isMobile ? 0.30 : 0.32), y: -h * (isMobile ? 0.30 : 0.28), scale: isMobile ? 0.35 : 0.6 }, start: { x: w * 1.5, y: h * -1.2, scale: 0.4, rotate: 25 } },
      { final: { x: -w * (isMobile ? 0.30 : 0.32), y: h * (isMobile ? 0.30 : 0.28), scale: isMobile ? 0.35 : 0.6 }, start: { x: -w * 1.5, y: h * 1.2, scale: 0.4, rotate: -25 } },
      { final: { x: w * (isMobile ? 0.30 : 0.32), y: h * (isMobile ? 0.30 : 0.28), scale: isMobile ? 0.35 : 0.6 }, start: { x: w * 1.5, y: h * 1.2, scale: 0.4, rotate: 25 } }
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
    <div className={`min-h-screen bg-bone selection:bg-accent/20 ${isMobileMenuOpen ? 'overflow-hidden' : ''}`}>
      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-[1050] bg-accent transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden flex flex-col items-center justify-center
          ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}
        `}
      >
        <div className="flex flex-col gap-12 text-center px-8">
          {['Explore', 'Our Heritage', 'Curator Portal'].map((item) => (
            <a 
              key={item} 
              href={item === 'Curator Portal' ? '#' : `#${item.toLowerCase().replace(' ', '-')}`}
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (item === 'Curator Portal') {
                  if (isAuthenticated) setShowDashboard(true);
                  else setShowLogin(true);
                }
              }}
              className="font-serif text-4xl text-bone brand-shakya italic hover:text-silver transition-all"
            >
              {item === 'Curator Portal' ? (isAuthenticated ? 'Archive' : item) : item}
            </a>
          ))}
        </div>
        <p className="absolute bottom-12 text-[8px] uppercase tracking-[0.5em] text-bone/30 italic">Est. 2006 — Nepal</p>
      </div>

      <nav 
        className={`fixed top-0 left-0 right-0 z-[1100] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] px-4 sm:px-16 
          ${scrolled && !isMobileMenuOpen ? 'bg-bone/95 backdrop-blur-md py-4 lg:py-6 shadow-sm border-b border-softBlack/5' : 'py-6 lg:py-12'}
          ${isNavVisible || isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
        `}
      >
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center cursor-pointer group" onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <h1 className={`font-serif text-xl sm:text-2xl brand-shakya transition-colors duration-500
              ${isMobileMenuOpen ? 'text-bone' : 'text-softBlack'}
            `}>
              SHAKYA
            </h1>
          </div>

          <div className="hidden lg:flex gap-16 items-center">
            {['Explore', 'Our Heritage'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-[9px] uppercase tracking-[0.4em] text-softBlack/50 hover:text-accent transition-all relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-accent transition-all duration-500 group-hover:w-full" />
              </a>
            ))}
            <button onClick={() => { if (isAuthenticated) setShowDashboard(true); else setShowLogin(true); }} className="text-[9px] uppercase tracking-[0.4em] text-accent font-bold hover:text-accent/70 transition-all border border-accent/20 px-4 py-2 hover:bg-accent/5">
              {isAuthenticated ? 'Archive' : 'Curator Portal'}
            </button>
          </div>

          <button onClick={toggleMobileMenu} className="lg:hidden flex flex-col justify-center items-center w-12 h-12 gap-1.5 z-[1200] relative">
            <span className={`w-6 h-[1.5px] transition-all duration-500 transform ${isMobileMenuOpen ? 'bg-bone rotate-45 translate-y-[3.5px]' : 'bg-softBlack'}`} />
            <span className={`w-6 h-[1.5px] transition-all duration-500 ${isMobileMenuOpen ? 'bg-bone opacity-0' : 'bg-softBlack opacity-100'}`} />
            <span className={`w-6 h-[1.5px] transition-all duration-500 transform ${isMobileMenuOpen ? 'bg-bone -rotate-45 -translate-y-[3.5px]' : 'bg-softBlack'}`} />
          </button>
        </div>
      </nav>

      <main>
        <section ref={heroRef} className="relative h-[400vh] bg-bone">
          <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
            <div className="absolute font-serif text-[30rem] md:text-[50rem] italic opacity-[0.015] z-0 pointer-events-none select-none"
                 style={{ transform: `scale(${1 + scrollProgress * 0.3}) rotate(${scrollProgress * 4}deg)` }}>S</div>

            <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
              {BENTO_HERO_IMAGES.map((img, i) => {
                const config = bentoConfig[i];
                if (!config) return null;
                const curX = config.start.x + (config.final.x - config.start.x) * scrollProgress;
                const curY = config.start.y + (config.final.y - config.start.y) * scrollProgress;
                const curScale = config.start.scale + (config.final.scale - config.start.scale) * scrollProgress;
                const curRotate = (config.start.rotate || 0) * (1 - scrollProgress);
                return (
                  <div key={i} className="absolute left-1/2 top-1/2 will-change-transform"
                    style={{
                      transform: `translate3d(calc(-50% + ${curX}px), calc(-50% + ${curY}px), 0) scale(${curScale}) rotate(${curRotate}deg)`,
                      zIndex: i === 0 ? 5 : 4,
                      opacity: Math.min(scrollProgress * 2.5, 1)
                    }}>
                    <MuseumFrame className="w-56 md:w-80 lg:w-[32rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]">
                      <div className="aspect-[4/3] bg-bone overflow-hidden flex items-center justify-center">
                        <img src={img} className="w-full h-full object-cover" alt="Hero" />
                      </div>
                    </MuseumFrame>
                  </div>
                );
              })}
            </div>

            <div className="relative z-20 text-center px-6 pointer-events-none transition-all duration-300" 
                 style={{ opacity: Math.max(1 - scrollProgress * 5, 0), transform: `scale(${1 - scrollProgress * 0.4}) translateY(${scrollProgress * -100}px)` }}>
              <span className="font-sans text-[8px] sm:text-[11px] uppercase tracking-[1.2em] sm:tracking-[1.6em] font-light text-softBlack/40 mb-6 block translate-x-[0.6em] sm:translate-x-[0.8em]">
                est. 2006
              </span>
              <div className="flex flex-col items-center">
                <h2 className="font-serif text-4xl sm:text-7xl lg:text-[10rem] tracking-[0.1em] text-softBlack uppercase leading-none">
                  <span className="font-bold block brand-shakya mb-2">
                    SHAKYA
                  </span>
                </h2>
                <div className="brand-shakya text-[10px] sm:text-base lg:text-xl text-accent/80 tracking-[0.6em] sm:tracking-[1.2em] font-light mt-2 sm:mt-4">
                  THE GALLERY
                </div>
                <div className="w-16 h-[1px] bg-accent/30 mt-8" />
              </div>
            </div>

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 transition-all duration-500"
                 style={{ opacity: 1 - scrollProgress * 15 }}>
              <span className="text-[8px] uppercase tracking-[0.6em] text-softBlack/70 font-medium italic">Scroll to Explore</span>
              <div className="w-[1.5px] h-16 bg-softBlack/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-accent animate-scroll-slide" />
              </div>
            </div>
          </div>
        </section>

        {/* LEGACY SECTION: Our Heritage */}
        <section id="our-heritage" className="py-32 sm:py-64 px-4 sm:px-16 bg-bone">
          <div className="max-w-4xl mx-auto border-y border-softBlack/10 py-24 sm:py-32 text-center animate-fade-up">
            <span className="text-[10px] uppercase tracking-[0.5em] text-accent block mb-8 font-bold">Our Heritage</span>
            <h2 className="font-serif text-4xl sm:text-6xl mb-12 brand-shakya font-light">The Legacy of SHAKYA</h2>
            <div className="max-w-2xl mx-auto space-y-8">
              <p className="text-lg sm:text-xl text-softBlack/80 font-serif font-light leading-relaxed italic">
                "Evolving twenty years of local expertise into a global legacy, SHAKYA is the singular home for authenticated Nepalese art."
              </p>
              <p className="text-xs sm:text-sm text-softBlack/60 font-light tracking-wide leading-loose">
                Established in 2006 as the Mountain Art Gallery, our transition to the Shakya digital platform marks a significant new era. 
                We have dedicated twenty years to the curation of Nepalese artistry, moving from a local physical shop in Kathmandu to an 
                international stage. Today, SHAKYA continues to represent the profound masters of Nepalese art, ensuring their legacy 
                is preserved and recognized by collectors worldwide.
              </p>
            </div>
          </div>
        </section>

        <section id="explore" className="py-24 sm:py-64 px-4 sm:px-16 bg-bone">
          <div className="max-w-[1440px] mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-end mb-24 sm:mb-48 max-sm:items-start gap-12 border-b border-softBlack/5 pb-16 sm:pb-24">
              <div className="max-w-2xl">
                <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.4em] text-accent block mb-8 font-bold">The Archive</span>
                <h3 className="font-serif text-4xl sm:text-7xl lg:text-9xl font-normal leading-[1] text-softBlack tracking-tighter">Peaks &<br/>Presence</h3>
              </div>
              <div className="max-w-[420px]">
                <p className="text-sm sm:text-base text-[#666] font-light leading-relaxed mb-8 italic">"Moments of high-altitude stillness, curated for the modern collector of the sublime."</p>
                <div className="flex items-center gap-4 text-[7px] sm:text-[9px] uppercase tracking-[0.3em] text-softBlack/40">
                  <div className="w-10 h-[1px] bg-softBlack/20" />
                  <span>Curated by SHAKYA</span>
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

      {/* REFINED HIGH-CONTRAST FOOTER */}
      <footer className="py-24 sm:py-48 px-4 sm:px-16 bg-softBlack text-bone text-center relative overflow-hidden">
        {/* Subtle texture for the footer */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#FAF9F6_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="max-w-[1400px] mx-auto flex flex-col items-center gap-16 relative z-10">
          <div className="flex flex-col items-center gap-8">
            <div className="flex flex-col items-center">
              <p className="font-serif text-5xl sm:text-7xl brand-shakya mb-2">SHAKYA</p>
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.8em] font-light text-bone/40 translate-x-[0.4em]">The Gallery</p>
            </div>
            
            <div className="w-24 h-[1px] bg-bone/10" />
            
            <p className="text-[9px] sm:text-[11px] uppercase tracking-[0.3em] font-medium text-bone/60 max-w-md leading-loose">
              The Digital Evolution of Mountain Art Gallery <br className="hidden sm:block"/>
              Preserving Nepalese Mastery since 2006
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 w-full border-t border-bone/5 pt-12 gap-8 items-center text-[8px] sm:text-[10px] uppercase tracking-[0.4em] text-bone/30">
            <div className="text-left hidden sm:block">Archive ID: SK-2006-25</div>
            <div className="text-center font-medium text-bone/50">
              &copy; {new Date().getFullYear()} SHAKYA ARCHIVE
            </div>
            <div className="text-right flex justify-end gap-4 opacity-50 sm:opacity-100">
              <span>KTM</span>
              <span>&bull;</span>
              <span>LDN</span>
              <span>&bull;</span>
              <span>ZMT</span>
            </div>
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