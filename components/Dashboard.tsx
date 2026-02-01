
import React, { useState } from 'react';
import { Artwork } from '../types';
import { generateArtworkMetadata } from '../services/geminiService';

interface DashboardProps {
  artworks: Artwork[];
  onAdd: (artwork: Artwork) => void;
  onUpdate: (artwork: Artwork) => void;
  onDelete: (id: string) => void;
  onLogout: () => void;
  onClose: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ artworks, onAdd, onUpdate, onDelete, onLogout, onClose }) => {
  // Form state
  const [formData, setFormData] = useState({
    imageUrl: '',
    title: '',
    artist: '',
    year: '',
    medium: '',
    dimensions: ''
  });
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      imageUrl: '',
      title: '',
      artist: '',
      year: '',
      medium: '',
      dimensions: ''
    });
    setPrompt('');
    setEditingId(null);
  };

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGeminiFetch = async () => {
    if (!prompt) return;
    setLoading(true);
    const metadata = await generateArtworkMetadata(prompt);
    if (metadata) {
      setFormData(prev => ({
        ...prev,
        title: metadata.title || prev.title,
        artist: metadata.artist || prev.artist,
        year: metadata.year || prev.year,
        medium: metadata.medium || prev.medium,
        dimensions: metadata.dimensions || prev.dimensions
      }));
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl || !formData.title) return;

    const artworkData: Artwork = {
      id: editingId || Date.now().toString(),
      ...formData
    };

    if (editingId) {
      onUpdate(artworkData);
    } else {
      onAdd(artworkData);
    }
    resetForm();
  };

  const startEdit = (art: Artwork) => {
    setEditingId(art.id);
    setFormData({
      imageUrl: art.imageUrl,
      title: art.title,
      artist: art.artist,
      year: art.year,
      medium: art.medium,
      dimensions: art.dimensions
    });
    // Scroll to form
    const formElement = document.getElementById('archive-form');
    formElement?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 z-[2500] bg-bone overflow-y-auto">
      <div className="max-w-7xl mx-auto p-8 sm:p-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 border-b border-softBlack/10 pb-8 gap-6">
          <div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold mb-2 block font-bold">Internal Curator Portal</span>
            <h1 className="font-serif text-5xl">Archive Management</h1>
          </div>
          <div className="flex gap-4">
             <button 
              onClick={onLogout} 
              className="text-[10px] uppercase tracking-widest border border-red-200 px-8 py-3 hover:bg-red-50 text-red-800 transition-all font-medium"
            >
              Sign Out
            </button>
            <button onClick={onClose} className="text-[10px] uppercase tracking-widest bg-softBlack text-white border border-softBlack px-8 py-3 hover:bg-gold hover:border-gold transition-all font-medium">
              Exit Portal
            </button>
          </div>
        </header>

        <section className="grid lg:grid-cols-12 gap-16">
          {/* ARCHIVE / EDIT FORM */}
          <div id="archive-form" className="lg:col-span-5 space-y-10">
            <div className="bg-white p-10 border border-softBlack/5 shadow-sm relative">
              {editingId && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gold"></div>
              )}
              <h3 className="font-serif text-3xl mb-8">{editingId ? 'Modify Entry' : 'Archive New Work'}</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2">Primary Asset (Image URL)</label>
                  <input 
                    name="imageUrl"
                    type="url" 
                    required 
                    value={formData.imageUrl}
                    onChange={handleManualInput}
                    className="w-full border-b border-softBlack/10 py-3 focus:outline-none focus:border-gold bg-transparent text-sm font-light"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2">Title of Piece</label>
                    <input 
                      name="title"
                      type="text" 
                      required 
                      value={formData.title}
                      onChange={handleManualInput}
                      className="w-full border-b border-softBlack/10 py-3 focus:outline-none focus:border-gold bg-transparent text-sm font-light italic"
                      placeholder="e.g. Whispering Peak"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2">Artist / Creator</label>
                    <input 
                      name="artist"
                      type="text" 
                      required 
                      value={formData.artist}
                      onChange={handleManualInput}
                      className="w-full border-b border-softBlack/10 py-3 focus:outline-none focus:border-gold bg-transparent text-sm font-light"
                      placeholder="e.g. Elias Thorne"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2">Medium</label>
                    <input 
                      name="medium"
                      type="text" 
                      required 
                      value={formData.medium}
                      onChange={handleManualInput}
                      className="w-full border-b border-softBlack/10 py-3 focus:outline-none focus:border-gold bg-transparent text-sm font-light"
                      placeholder="e.g. Oil on Canvas"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2">Dimensions</label>
                    <input 
                      name="dimensions"
                      type="text" 
                      required 
                      value={formData.dimensions}
                      onChange={handleManualInput}
                      className="w-full border-b border-softBlack/10 py-3 focus:outline-none focus:border-gold bg-transparent text-sm font-light"
                      placeholder="e.g. 40 x 60 in"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2">Acquisition Year</label>
                  <input 
                    name="year"
                    type="text" 
                    required 
                    value={formData.year}
                    onChange={handleManualInput}
                    className="w-full border-b border-softBlack/10 py-3 focus:outline-none focus:border-gold bg-transparent text-sm font-light"
                    placeholder="e.g. 2024"
                  />
                </div>

                {!editingId && (
                  <div className="pt-4 border-t border-softBlack/5 mt-8">
                    <label className="block text-[10px] uppercase tracking-widest text-gold mb-3 font-bold">AI Curator Assistance</label>
                    <div className="flex gap-2">
                      <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="flex-1 border border-softBlack/10 p-4 h-24 focus:outline-none focus:border-gold bg-transparent text-xs font-light resize-none leading-relaxed"
                        placeholder="Describe style/subject for AI generated metadata..."
                      />
                      <button 
                        type="button"
                        onClick={handleGeminiFetch}
                        disabled={loading || !prompt}
                        className="bg-gold/10 text-gold border border-gold/20 px-4 text-[9px] uppercase tracking-widest hover:bg-gold hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
                      >
                        {loading ? '...' : 'Gen'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-6">
                  <button 
                    type="submit" 
                    className="flex-1 bg-softBlack text-white py-5 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-gold transition-all"
                  >
                    {editingId ? "Apply Changes" : "Commit to Archive"}
                  </button>
                  {editingId && (
                    <button 
                      type="button" 
                      onClick={resetForm}
                      className="px-6 border border-softBlack/10 text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-800 transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* INVENTORY LIST */}
          <div className="lg:col-span-7">
             <div className="flex justify-between items-end mb-10">
               <h3 className="font-serif text-3xl">Archived Collection</h3>
               <p className="text-[10px] uppercase tracking-widest text-gray-400">{artworks.length} Items Indexed</p>
             </div>
             
             <div className="space-y-6">
                {artworks.map(art => (
                  <div key={art.id} className="flex flex-col sm:flex-row gap-6 items-start sm:items-center bg-white p-6 border border-softBlack/5 group transition-all hover:border-gold/30 hover:shadow-md">
                    <div className="w-24 h-24 flex-shrink-0 border border-softBlack/10 overflow-hidden">
                      <img src={art.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-serif text-xl italic text-softBlack">{art.title}</h4>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">
                        {art.artist} &bull; {art.medium} &bull; {art.year}
                      </p>
                      <p className="text-[9px] uppercase tracking-[0.3em] text-gold mt-2 font-bold">{art.dimensions}</p>
                    </div>
                    <div className="flex sm:flex-col gap-3 w-full sm:w-auto">
                      <button 
                        onClick={() => startEdit(art)}
                        className="flex-1 sm:flex-none border border-softBlack/10 text-softBlack px-5 py-2 text-[9px] uppercase tracking-widest hover:bg-softBlack hover:text-white transition-all font-bold"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => onDelete(art.id)}
                        className="flex-1 sm:flex-none border border-red-100 text-red-800 px-5 py-2 text-[9px] uppercase tracking-widest hover:bg-red-800 hover:text-white transition-all font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {artworks.length === 0 && (
                  <div className="text-center py-20 border-2 border-dashed border-softBlack/5 rounded-lg">
                    <p className="text-[10px] uppercase tracking-[0.5em] text-gray-300">Archive is currently empty</p>
                  </div>
                )}
             </div>
          </div>
        </section>
      </div>
    </div>
  );
};
