
import React, { useState } from 'react';

interface AdminLoginProps {
  onLogin: (password: string) => boolean;
  onClose: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onClose }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(password);
    if (!success) {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6">
      <div 
        className="absolute inset-0 bg-softBlack/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="relative z-[10] bg-bone w-full max-w-md border border-frameEbony p-12 shadow-2xl animate-fade-up">
        <button 
          onClick={onClose}
          className="absolute top-6 right-8 text-2xl font-thin text-[#999] hover:text-gold"
        >
          &times;
        </button>

        <header className="text-center mb-10">
          <div className="w-12 h-12 border border-softBlack flex items-center justify-center mx-auto mb-6 font-serif text-2xl">
            <span>M</span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold block mb-2">Internal Access</span>
          <h2 className="font-serif text-3xl">Curator Login</h2>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[9px] uppercase tracking-[0.3em] text-[#aaa] mb-3">Access Credentials</label>
            <input 
              type="password" 
              autoFocus
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Enter curator passcode"
              className={`w-full bg-transparent border-b ${error ? 'border-red-400' : 'border-softBlack/10'} py-4 font-light text-center focus:outline-none focus:border-gold transition-colors`}
            />
            {error && (
              <p className="text-[9px] uppercase tracking-widest text-red-500 mt-4 text-center">Invalid credentials. Please try again.</p>
            )}
          </div>

          <button 
            type="submit"
            className="w-full bg-softBlack text-white py-5 text-[10px] uppercase tracking-[0.3em] font-medium transition-all hover:bg-gold"
          >
            Authenticate
          </button>
        </form>

        <p className="text-center text-[8px] uppercase tracking-[0.2em] text-[#ccc] mt-10 leading-relaxed">
          Access is restricted to authorized gallery personnel only. <br/>All attempts are logged.
        </p>
      </div>
    </div>
  );
};
