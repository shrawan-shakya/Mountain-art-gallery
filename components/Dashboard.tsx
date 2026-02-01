
import React, { useState, useRef } from 'react';
import { Artwork } from '../types';
import { generateArtworkMetadata } from '../services/geminiService';

interface DashboardProps {
  artworks: Artwork[];
  onAdd: (formData: FormData) => void;
  onUpdate: (id: string, formData: FormData) => void;
  onDelete: (id: string) => void;
  onLogout: () => void;
  onClose: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ artworks, onAdd, onUpdate, onDelete, onLogout, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    year: '',
    medium: '',
    dimensions: '',
    imageUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({ title: '', artist: '', year: '', medium: '', dimensions: '', imageUrl: '' });
    setSelectedFile(null);
    setPrompt('');
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      setFormData(prev => ({ ...prev, ...metadata }));
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const data = new FormData();
    // Fix: Cast entries to [string, string][] as we know all values in formData are strings
    (Object.entries(formData) as [string, string][]).forEach(([key, value]) => {
      data.append(key, value);
    });
    if (selectedFile) data.append('image', selectedFile);

    if (editingId) {
      onUpdate(editingId, data);
    } else {
      onAdd(data);
    }
    resetForm();
  };

  const startEdit = (art: Artwork) => {
    setEditingId(art.id);
    setFormData({
      title: art.title,
      artist: art.artist,
      year: art.year,
      medium: art.medium,
      dimensions: art.dimensions,
      imageUrl: art.imageUrl
    });
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
            <button onClick={onLogout} className="text-[10px] uppercase tracking-widest border border-red-200 px-8 py-3 hover:bg-red-50 text-red-800 transition-all font-medium">Sign Out</button>
            <button onClick={onClose} className="text-[10px] uppercase tracking-widest bg-softBlack text-white border border-softBlack px-8 py-3 hover:bg-gold hover:border-gold transition-all font-medium">Exit Portal</button>
          </div>
        </header>

        <section className="grid lg:grid-cols-12 gap-16">
          <div id="archive-form" className="lg:col-span-5 space-y-10">
            <div className="bg-white p-10 border border-softBlack/5 shadow-sm relative">
              {editingId && <div className="absolute top-0 left-0 w-full h-1 bg-gold"></div>}
              <h3 className="font-serif text-3xl mb-8">{editingId ? 'Modify Entry' : 'Archive New Work'}</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2">Upload Artwork Image</label>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-[10px] file:uppercase file:tracking-widest file:bg-bone file:text-softBlack hover:file:bg-gold hover:file:text-white transition-all cursor-pointer"
                  />
                  {!editingId && !selectedFile && (
                    <div className="mt-4">
                      <label className="block text-[8px] uppercase tracking-widest text-gray-300 mb-2">OR provide remote URL</label>
                      <input 
                        name="imageUrl"
                        type="url" 
                        value={formData.imageUrl}
                        onChange={handleManualInput}
                        className="w-full border-b border-softBlack/10 py-2 focus:outline-none focus:border-gold bg-transparent text-xs font-light"
                        placeholder="https://..."
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2">Title</label>
                    <input name="title" required value={formData.title} onChange={handleManualInput} className="w-full border-b border-softBlack/10 py-3 focus:outline-none focus:border-gold bg-transparent text-sm font-light italic" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2">Artist</label>
                    <input name="artist" required value={formData.artist} onChange={handleManualInput} className="w-full border-b border-softBlack/10 py-3 focus:outline-none focus:border-gold bg-transparent text-sm font-light" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2">Medium</label>
                    <input name="medium" required value={formData.medium} onChange={handleManualInput} className="w-full border-b border-softBlack/10 py-3 focus:outline-none focus:border-gold bg-transparent text-sm font-light" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2">Dimensions</label>
                    <input name="dimensions" required value={formData.dimensions} onChange={handleManualInput} className="w-full border-b border-softBlack/10 py-3 focus:outline-none focus:border-gold bg-transparent text-sm font-light" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2">Acquisition Year</label>
                  <input name="year" required value={formData.year} onChange={handleManualInput} className="w-full border-b border-softBlack/10 py-3 focus:outline-none focus:border-gold bg-transparent text-sm font-light" />
                </div>

                {!editingId && (
                  <div className="pt-4 border-t border-softBlack/5 mt-8">
                    <label className="block text-[10px] uppercase tracking-widest text-gold mb-3 font-bold">AI Curator Assistance</label>
                    <div className="flex gap-2">
                      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="flex-1 border border-softBlack/10 p-4 h-24 focus:outline-none focus:border-gold bg-transparent text-xs font-light resize-none leading-relaxed" placeholder="Describe style for AI metadata..." />
                      <button type="button" onClick={handleGeminiFetch} disabled={loading || !prompt} className="bg-gold/10 text-gold border border-gold/20 px-4 text-[9px] uppercase tracking-widest hover:bg-gold hover:text-white transition-all disabled:opacity-30">
                        {loading ? '...' : 'Gen'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-6">
                  <button type="submit" className="flex-1 bg-softBlack text-white py-5 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-gold transition-all">
                    {editingId ? "Apply Changes" : "Commit to Archive"}
                  </button>
                  {editingId && <button type="button" onClick={resetForm} className="px-6 border border-softBlack/10 text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-800 transition-all">Cancel</button>}
                </div>
              </form>
            </div>
          </div>

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
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">{art.artist} &bull; {art.medium} &bull; {art.year}</p>
                      <p className="text-[9px] uppercase tracking-[0.3em] text-gold mt-2 font-bold">{art.dimensions}</p>
                    </div>
                    <div className="flex sm:flex-col gap-3 w-full sm:w-auto">
                      <button onClick={() => startEdit(art)} className="flex-1 sm:flex-none border border-softBlack/10 text-softBlack px-5 py-2 text-[9px] uppercase tracking-widest hover:bg-softBlack hover:text-white transition-all font-bold">Edit</button>
                      <button onClick={() => onDelete(art.id)} className="flex-1 sm:flex-none border border-red-100 text-red-800 px-5 py-2 text-[9px] uppercase tracking-widest hover:bg-red-800 hover:text-white transition-all font-bold">Delete</button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </section>
      </div>
    </div>
  );
};
