
import React, { useState, useEffect } from 'react';
import { Artwork } from './types';
import { INITIAL_ARTWORKS, HERO_IMAGE } from './constants';
import { ArtworkCard } from './components/ArtworkCard';
import { MuseumFrame } from './components/MuseumFrame';
import { EnquiryModal } from './components/EnquiryModal';
import { Dashboard } from './components/Dashboard';
import { AdminLogin } from './components/AdminLogin';

function App() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  
  const [showLogin, setShowLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync with Backend
  useEffect(() => {
    fetchArtworks();
    const auth = sessionStorage.getItem('gallery_auth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  const fetchArtworks = async () => {
    try {
      const response = await fetch('/api/artworks');
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setArtworks(data.length > 0 ? data : INITIAL_ARTWORKS);
    } catch (e) {
      console.error("Gallery API Error:", e);
      setArtworks(INITIAL_ARTWORKS);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
      if (window.scrollY > 100 && isMobileMenuOpen) setIsMobileMenuOpen(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileMenuOpen]);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addArtwork = async (formData: FormData) => {
    try {
      const res = await fetch('/api/artworks', { method: 'POST', body: formData });
      if (!res.ok) throw new Error("Failed to add artwork");
      const newArt = await res.json();
      setArtworks(prev => [newArt, ...prev]);
    } catch (e) {
      console.error("Add Artwork Error:", e);
      alert("Could not add artwork to archive.");
    }
  };

  const updateArtwork = async (id: string, formData: FormData) => {
    try {
      const res = await fetch(`/api/artworks/${id}`, { method: 'PUT', body: formData });
      if (!res.ok) throw new Error("Failed to update artwork");
      const updated = await res.json();
      setArtworks(prev => prev.map(art => art.id === id ? updated : art));
    } catch (e) {
      console.error("Update Artwork Error:", e);
      alert("Could not update artwork.");
    }
  };

  const deleteArtwork = async (id: string) => {
    try {
      const res = await fetch(`/api/artworks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete artwork");
      setArtworks(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      console.error("Delete Artwork Error:", e);
      alert("Could not remove artwork from archive.");
    }
  };

  const openCuratorPortal = () => {
    if (isAuthenticated) setShowDashboard(true);
    else setShowLogin(true);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="min-h-screen bg-bone selection:bg-gold/30">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-1000 px-4 sm:px-16 ${scrolled ? 'bg-bone/95 backdrop-blur-md py-4 lg:py-6 shadow-sm border-b border-softBlack/5' : 'py-6 lg:py-12'}`}>
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 border border-softBlack flex items-center justify-center mr-3 sm:mr-5 font-serif text-lg sm:text-2xl transition-all duration-700 group-hover:border-gold group-hover:rotate-[135deg] group-hover:bg-gold group-hover:text-white">
              <span className="transition-transform duration-700 group-hover:rotate-[-135deg]">M</span>
            </div>
            <h1 className="font-serif text-base sm:text-2xl uppercase tracking-[0.1em] sm:tracking-[0.25em] text-softBlack whitespace-nowrap">
              Mountain <span className="italic font-light text-[#999] group-hover:text-gold transition-all">Art Gallery</span>
            </h1>
          </div>

          {/* Desktop Links - Hidden on Mobile and Tablet (lg: breakpoint) */}
          <div className="hidden lg:flex gap-16 items-center">
            {['Explore', 'About Us'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="text-[9px] uppercase tracking-[0.4em] text-softBlack/50 hover:text-gold transition-all relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gold transition-all duration-500 group-hover:w-full" />
              </a>
            ))}
            <button onClick={openCuratorPortal} className="text-[9px] uppercase tracking-[0.4em] text-gold font-bold hover:text-gold/70 transition-all border border-gold/20 px-4 py-2 hover:bg-gold/5">
              {isAuthenticated ? 'Archive' : 'Curator Portal'}
            </button>
          </div>

          {/* Hamburger Button - Shown on Mobile and Tablet (lg: breakpoint) */}
          <button 
            onClick={toggleMobileMenu} 
            className="lg:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 z-[1100]"
            aria-label="Toggle Menu"
          >
            <span className={`w-6 h-[1px] bg-softBlack transition-all duration-500 ${isMobileMenuOpen ? 'rotate-45 translate-y-[3px]' : ''}`} />
            <span className={`w-6 h-[1px] bg-softBlack transition-all duration-500 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`w-6 h-[1px] bg-softBlack transition-all duration-500 ${isMobileMenuOpen ? '-rotate-45 -translate-y-[10px]' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile/Tablet Menu Overlay */}
      <div className={`fixed inset-0 z-[1050] bg-bone flex flex-col items-center justify-center transition-all duration-700 ease-in-out px-8 text-center ${isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
        <div className="flex flex-col gap-10">
          {['Explore', 'About Us'].map((item, idx) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-2xl lg:text-3xl uppercase tracking-[0.5em] text-softBlack font-serif italic transition-all duration-700 ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              {item}
            </a>
          ))}
          <button 
            onClick={openCuratorPortal} 
            className={`text-[10px] uppercase tracking-[0.4em] text-gold font-bold border border-gold/30 px-8 py-4 mt-4 transition-all duration-700 ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
            style={{ transitionDelay: `200ms` }}
          >
            {isAuthenticated ? 'Archive' : 'Curator Portal'}
          </button>
        </div>
      </div>

      <main>
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center relative pt-24 sm:pt-48 pb-16 sm:pb-32 bg-bone">
          <div className="absolute font-serif text-[25rem] sm:text-[50rem] italic opacity-[0.012] z-0 pointer-events-none select-none -translate-y-8 sm:-translate-y-20">M</div>
          
          <div className="w-full max-w-[1100px] px-4 sm:px-8 z-[1] animate-fade-in group mb-16 sm:mb-32">
            <MuseumFrame className="w-full">
               <div className="aspect-[4/3] sm:aspect-[16/7] overflow-hidden">
                 <img src={HERO_IMAGE} alt="Summit Vistas" className="w-full h-full object-cover transition-transform duration-[20s] group-hover:scale-105" />
               </div>
            </MuseumFrame>
          </div>

          <div className="text-center max-w-[1000px] z-[1] px-6">
            <div className="mb-10 sm:mb-20 animate-fade-up [animation-delay:300ms] opacity-0 fill-mode-forwards">
              <div className="flex flex-col items-center">
                <span className="font-sans text-[8px] sm:text-[11px] uppercase tracking-[0.6em] sm:tracking-[1.2em] font-medium text-softBlack/40 mb-5 sm:mb-10 translate-x-[0.3em] sm:translate-x-[0.6em]">
                  This is not a website
                </span>
                
                <div className="w-12 sm:w-24 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent mb-5 sm:mb-10 opacity-60" />
                
                <h2 className="font-serif text-3xl sm:text-7xl tracking-[0.1em] sm:tracking-[0.2em] text-softBlack uppercase flex flex-col items-center leading-none">
                  <span className="italic font-light text-lg sm:text-3xl mb-2 sm:mb-4 opacity-70 tracking-[0.2em] sm:tracking-[0.4em] normal-case">It is</span>
                  <span className="font-bold relative">
                    THE <span className="text-gold">GALLERY</span>
                    <div className="absolute -bottom-2 sm:-bottom-4 left-1/2 -translate-x-1/2 w-1/3 h-[1px] sm:h-[2px] bg-gold/30" />
                  </span>
                </h2>
              </div>
            </div>

            <div className="animate-fade-up [animation-delay:500ms] opacity-0 fill-mode-forwards mb-10 sm:mb-20">
              <h2 className="font-serif text-lg sm:text-4xl font-light italic leading-relaxed text-softBlack/60 max-w-2xl mx-auto px-4">
                "The vast silence of the high peaks, <br className="hidden lg:block" /> stretching beyond the horizon."
              </h2>
            </div>
            
            <div className="flex flex-col items-center animate-fade-up [animation-delay:700ms] opacity-0 fill-mode-forwards">
              <a href="#explore" className="inline-block px-8 sm:px-14 py-4 sm:py-6 border border-softBlack/10 text-softBlack relative transition-all group hover:border-gold hover:shadow-2xl bg-white overflow-hidden">
                <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.6em] font-bold relative z-10 transition-colors group-hover:text-white">Enter Exhibition</span>
                <div className="absolute inset-0 bg-softBlack translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
              </a>
              <div className="mt-12 sm:mt-24 flex flex-col items-center">
                <div className="w-[1px] h-10 sm:h-16 bg-softBlack/10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-gold animate-scroll-slide" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="explore" className="py-24 sm:py-64 px-4 sm:px-16">
          <div className="max-w-[1440px] mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-end mb-20 sm:mb-48 max-sm:items-start gap-8 sm:gap-10 border-b border-softBlack/5 pb-10 sm:pb-20">
              <div className="max-w-2xl">
                <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em] text-gold block mb-5 sm:mb-8 font-bold">Phase I: Collection</span>
                <h3 className="font-serif text-4xl sm:text-8xl font-normal leading-[1.1] text-softBlack tracking-tighter">Altitudes &<br/>Atmosphere</h3>
              </div>
              <div className="max-w-[400px]">
                <p className="text-sm sm:text-base text-[#666] font-light leading-relaxed mb-5 sm:mb-8 italic">"Carved by ice and wind. Our role is but to archive the sublime before the light shifts."</p>
                <div className="flex items-center gap-4 text-[7px] sm:text-[9px] uppercase tracking-[0.3em] sm:tracking-[0.4em] text-softBlack/40">
                  <div className="w-8 h-[1px] bg-softBlack/20" />
                  <span>Curated Works</span>
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
        <div className="max-w-[1400px] mx-auto flex flex-col items-center gap-10 sm:gap-16">
          <div className="flex flex-col items-center gap-6 sm:gap-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border border-softBlack/20 flex items-center justify-center font-serif text-xl sm:text-2xl text-softBlack/40"><span>M</span></div>
            <p className="font-serif text-2xl sm:text-3xl italic text-softBlack tracking-tight opacity-80">Mountain Art Gallery</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-12">
            {['Instagram', 'Artsy', 'Journal'].map(link => (
              <a key={link} href="#" className="text-[8px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.5em] text-softBlack/30 hover:text-gold transition-all">{link}</a>
            ))}
          </div>
          <div className="w-12 h-[1px] bg-softBlack/5" />
          <div className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] sm:tracking-[0.4em] text-softBlack/30 flex flex-col gap-4">
            <p>&copy; {new Date().getFullYear()} Mountain Art Gallery</p>
            <p className="opacity-50 tracking-[0.2em]">London &bull; Chamonix &bull; Zermatt</p>
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
