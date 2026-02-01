
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

  // Sync with Backend
  useEffect(() => {
    fetchArtworks();
    const auth = sessionStorage.getItem('gallery_auth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  const fetchArtworks = async () => {
    try {
      const response = await fetch('/api/artworks');
      const data = await response.json();
      setArtworks(data.length > 0 ? data : INITIAL_ARTWORKS);
    } catch (e) {
      console.error("API error, falling back to initial data");
      setArtworks(INITIAL_ARTWORKS);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    const res = await fetch('/api/artworks', { method: 'POST', body: formData });
    const newArt = await res.json();
    setArtworks(prev => [newArt, ...prev]);
  };

  const updateArtwork = async (id: string, formData: FormData) => {
    const res = await fetch(`/api/artworks/${id}`, { method: 'PUT', body: formData });
    const updated = await res.json();
    setArtworks(prev => prev.map(art => art.id === id ? updated : art));
  };

  const deleteArtwork = async (id: string) => {
    await fetch(`/api/artworks/${id}`, { method: 'DELETE' });
    setArtworks(prev => prev.filter(a => a.id !== id));
  };

  const openCuratorPortal = () => {
    if (isAuthenticated) setShowDashboard(true);
    else setShowLogin(true);
  };

  return (
    <div className="min-h-screen bg-bone selection:bg-gold/30">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-1000 px-8 sm:px-16 ${scrolled ? 'bg-bone/95 backdrop-blur-md py-6 shadow-sm border-b border-softBlack/5' : 'py-12'}`}>
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 border border-softBlack flex items-center justify-center mr-5 font-serif text-2xl transition-all duration-700 group-hover:border-gold group-hover:rotate-[135deg] group-hover:bg-gold group-hover:text-white">
              <span className="transition-transform duration-700 group-hover:rotate-[-135deg]">M</span>
            </div>
            <h1 className="font-serif text-2xl uppercase tracking-[0.25em] text-softBlack">
              Mountain <span className="italic font-light text-[#999] group-hover:text-gold transition-all">Art Gallery</span>
            </h1>
          </div>

          <div className="hidden md:flex gap-16 items-center">
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
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center relative pt-48 pb-32 bg-bone">
          <div className="absolute font-serif text-[50rem] italic opacity-[0.012] z-0 pointer-events-none select-none -translate-y-20">M</div>
          
          <div className="w-full max-w-[1100px] px-8 z-[1] animate-fade-in group mb-24">
            <MuseumFrame className="w-full">
               <div className="aspect-[16/7] max-sm:aspect-[1/1] overflow-hidden">
                 <img src={HERO_IMAGE} alt="Summit Vistas" className="w-full h-full object-cover transition-transform duration-[20s] group-hover:scale-105" />
               </div>
            </MuseumFrame>
          </div>

          <div className="text-center max-w-[900px] z-[1] px-8">
            <div className="mb-12 animate-fade-up [animation-delay:300ms] opacity-0 fill-mode-forwards">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10">
                <span className="font-sans text-[10px] uppercase tracking-[0.5em] font-light text-softBlack/30">this is not a website</span>
                <div className="hidden sm:block w-[1px] h-4 bg-gold/40" />
                <span className="font-serif text-xl sm:text-2xl uppercase tracking-[0.8em] font-medium text-softBlack">
                  this is <span className="text-gold">THE GALLERY</span>
                </span>
              </div>
            </div>

            <div className="animate-fade-up [animation-delay:500ms] opacity-0 fill-mode-forwards mb-16">
              <h2 className="font-serif text-4xl sm:text-6xl font-light italic leading-tight text-softBlack/80">
                "The vast silence of the high peaks, <br className="hidden lg:block" /> stretching beyond the horizon."
              </h2>
            </div>
            
            <div className="flex flex-col items-center animate-fade-up [animation-delay:700ms] opacity-0 fill-mode-forwards">
              <a href="#explore" className="inline-block px-12 py-5 border border-softBlack/10 text-softBlack relative transition-all group hover:border-gold hover:shadow-lg bg-white overflow-hidden">
                <span className="text-[10px] uppercase tracking-[0.5em] font-semibold relative z-10">Enter Exhibition</span>
                <div className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 text-[10px] uppercase tracking-[0.5em] font-semibold">Enter Exhibition</span>
              </a>
              <div className="mt-20 flex flex-col items-center">
                <div className="w-[1px] h-12 bg-softBlack/10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-gold animate-scroll-slide" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="explore" className="py-64 px-8 sm:px-16">
          <div className="max-w-[1440px] mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-end mb-48 max-sm:items-start gap-12 border-b border-softBlack/5 pb-20">
              <div className="max-w-2xl">
                <span className="text-[10px] uppercase tracking-[0.4em] text-gold block mb-8 font-bold">Phase I: Collection</span>
                <h3 className="font-serif text-6xl sm:text-8xl font-normal leading-[1.1] text-softBlack tracking-tighter">Altitudes &<br/>Atmosphere</h3>
              </div>
              <div className="max-w-[400px]">
                <p className="text-base text-[#666] font-light leading-relaxed mb-8 italic">"Carved by ice and wind. Our role is but to archive the sublime before the light shifts."</p>
                <div className="flex items-center gap-4 text-[9px] uppercase tracking-[0.4em] text-softBlack/40">
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

      <footer className="py-40 px-8 sm:px-16 bg-bone border-t border-softBlack/5 text-center">
        <div className="max-w-[1400px] mx-auto flex flex-col items-center gap-16">
          <div className="flex flex-col items-center gap-8">
            <div className="w-12 h-12 border border-softBlack/20 flex items-center justify-center font-serif text-2xl text-softBlack/40"><span>M</span></div>
            <p className="font-serif text-3xl italic text-softBlack tracking-tight opacity-80">Mountain Art Gallery</p>
          </div>
          <div className="flex flex-wrap justify-center gap-12">
            {['Instagram', 'Artsy', 'Journal'].map(link => (
              <a key={link} href="#" className="text-[10px] uppercase tracking-[0.5em] text-softBlack/30 hover:text-gold transition-all">{link}</a>
            ))}
          </div>
          <div className="w-16 h-[1px] bg-softBlack/5" />
          <div className="text-[9px] uppercase tracking-[0.4em] text-softBlack/30 flex flex-col gap-4">
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
