import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, BookOpen, GraduationCap, User, Zap } from 'lucide-react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden font-sans sm:max-w-md sm:mx-auto bg-gray-50">
      {/* VFX 1: Living Aurora Background */}
      <div className="fixed inset-0 z-0 opacity-40 mix-blend-color-burn pointer-events-none animate-aurora" 
           style={{ 
             backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(99, 102, 241, 0.4), transparent 50%), radial-gradient(circle at 85% 30%, rgba(168, 85, 247, 0.4), transparent 50%)',
             backgroundSize: '200% 200%' 
           }}>
      </div>
      
      {/* VFX 2: Noise Texture Overlay for realism */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

      {/* Cyber-Glass Header */}
      <header className="fixed top-0 w-full sm:max-w-md z-50 px-4 pt-3 pb-2 backdrop-blur-xl bg-white/60 border-b border-white/40 shadow-sm gpu-accel">
        <div className="flex justify-between items-center relative overflow-hidden">
          {/* VFX 3: Sweeping Shimmer light across header */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent w-1/2 animate-shimmer pointer-events-none z-20"></div>
          
          <div className="flex items-center space-x-2 relative z-10">
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.5)]">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-gray-900">EthioLearn</span>
          </div>
          
          <div className={`flex items-center px-3 py-1.5 rounded-md text-[10px] font-black tracking-widest relative z-10 ${isOnline ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-red-500/10 text-red-600'}`}>
            {isOnline ? <Wifi className="w-3 h-3 mr-1.5" /> : <WifiOff className="w-3 h-3 mr-1.5" />}
            {isOnline ? 'LIVE' : 'OFF'}
          </div>
        </div>
      </header>

      <main className="relative z-10 w-full pt-20 pb-32 px-4 overflow-x-hidden min-h-screen flex flex-col">
        {children}
      </main>

      {/* Floating Neumorphic Nav */}
      <nav className="fixed bottom-6 left-6 right-6 sm:max-w-md sm:mx-auto z-50 gpu-accel">
        <div className="bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_10px_40px_rgb(0,0,0,0.1)] rounded-3xl px-6 py-4 flex justify-between items-center relative overflow-hidden">
          <button className="flex flex-col items-center w-16 relative z-10">
            <BookOpen className="w-6 h-6 text-indigo-600 drop-shadow-md mb-1" />
            <span className="text-[9px] font-black text-indigo-700 tracking-widest">READ</span>
          </button>
          <button className="flex flex-col items-center w-16 relative z-10 opacity-50 active:opacity-100 transition-opacity">
            <GraduationCap className="w-6 h-6 text-gray-600 mb-1" />
            <span className="text-[9px] font-bold tracking-widest text-gray-600">EXAMS</span>
          </button>
          <button className="flex flex-col items-center w-16 relative z-10 opacity-50 active:opacity-100 transition-opacity">
            <User className="w-6 h-6 text-gray-600 mb-1" />
            <span className="text-[9px] font-bold tracking-widest text-gray-600">PROFILE</span>
          </button>
        </div>
      </nav>
    </div>
  );
}