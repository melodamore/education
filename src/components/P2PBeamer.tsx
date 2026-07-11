import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Share2, CheckCircle, QrCode, Scan, Settings2, Smartphone, Wifi, UploadCloud, DownloadCloud } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const snapPhysics = { type: "spring", stiffness: 800, damping: 35, mass: 0.5 } as const;
const instantFade = { opacity: 0, scale: 0.96 };

export default function P2PBeamer() {
  const [mode, setMode] = useState<'idle' | 'config_send' | 'show_qr' | 'receive' | 'transferring' | 'success'>('idle');
  const [scope, setScope] = useState<'chapter' | 'subject' | 'grade'>('chapter');
  
  // Payload Toggles
  const [toggles, setToggles] = useState({
    languages: true,
    media: false,
    euee: true,
    labs: true
  });

  const handleToggle = (key: keyof typeof toggles) => setToggles(p => ({ ...p, [key]: !p[key] }));

  const startTransfer = () => {
    setMode('transferring');
    setTimeout(() => setMode('success'), 3500);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-[2rem] shadow-2xl space-y-6 text-white relative overflow-hidden">
      {/* Background VFX */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 blur-3xl rounded-full pointer-events-none" />
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
            <Share2 className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h4 className="font-black text-lg tracking-tight">Offline Hub</h4>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
              <Wifi className="w-3 h-3 mr-1" /> Wi-Fi Direct / Hotspot
            </p>
          </div>
        </div>
        {mode !== 'idle' && (
          <button onClick={() => setMode('idle')} className="text-xs font-bold text-gray-400 bg-gray-800 px-3 py-1.5 rounded-lg active:scale-95">Cancel</button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {mode === 'idle' && (
          <motion.div key="idle" initial={instantFade} animate={{ opacity: 1, scale: 1 }} exit={instantFade} transition={snapPhysics} className="grid grid-cols-2 gap-3">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setMode('config_send')} className="bg-indigo-600 border border-indigo-500 p-5 rounded-2xl flex flex-col items-center justify-center space-y-2 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
              <UploadCloud className="w-8 h-8 text-white" />
              <span className="font-black tracking-widest text-xs uppercase">Send</span>
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setMode('receive')} className="bg-emerald-600/20 border border-emerald-500/30 p-5 rounded-2xl flex flex-col items-center justify-center space-y-2 text-emerald-400">
              <DownloadCloud className="w-8 h-8" />
              <span className="font-black tracking-widest text-xs uppercase">Receive</span>
            </motion.button>
          </motion.div>
        )}

        {mode === 'config_send' && (
          <motion.div key="config" initial={instantFade} animate={{ opacity: 1, scale: 1 }} exit={instantFade} transition={snapPhysics} className="space-y-5">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">1. Transfer Scope</span>
              <div className="flex bg-gray-800 p-1 rounded-xl">
                {(['chapter', 'subject', 'grade'] as const).map(s => (
                  <button key={s} onClick={() => setScope(s)} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${scope === s ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center"><Settings2 className="w-3 h-3 mr-1"/> 2. Payload Contents</span>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(toggles).map(([key, value]) => (
                  <button key={key} onClick={() => handleToggle(key as keyof typeof toggles)} className={`p-3 rounded-xl border flex items-center justify-between transition-all ${value ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300' : 'bg-gray-800 border-gray-700 text-gray-500'}`}>
                    <span className="text-xs font-bold uppercase">{key}</span>
                    <div className={`w-3 h-3 rounded-full ${value ? 'bg-indigo-500 shadow-[0_0_8px_#6366f1]' : 'bg-gray-600'}`} />
                  </button>
                ))}
              </div>
            </div>

            <motion.button whileTap={{ scale: 0.96 }} onClick={() => setMode('show_qr')} className="w-full bg-white text-gray-900 font-black py-4 rounded-xl text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              Generate Link QR
            </motion.button>
          </motion.div>
        )}

        {mode === 'show_qr' && (
          <motion.div key="qr" initial={instantFade} animate={{ opacity: 1, scale: 1 }} exit={instantFade} transition={snapPhysics} className="flex flex-col items-center justify-center space-y-6 py-4">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 animate-pulse" />
              <div className="bg-white p-4 rounded-2xl relative z-10 shadow-2xl">
                <QRCodeSVG value={`ethiolearn://transfer?scope=${scope}&media=${toggles.media}`} size={180} fgColor="#111827" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="font-black text-lg tracking-tight">Ready to Transmit</p>
              <p className="text-xs text-gray-400 font-medium">Ask receiver to scan this code.</p>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={startTransfer} className="w-full bg-indigo-600 py-4 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center">
              <Radio className="w-4 h-4 mr-2 animate-pulse" /> Force Start Transfer
            </motion.button>
          </motion.div>
        )}

        {mode === 'receive' && (
          <motion.div key="receive" initial={instantFade} animate={{ opacity: 1, scale: 1 }} exit={instantFade} transition={snapPhysics} className="flex flex-col items-center justify-center space-y-6 py-4">
            <div className="w-full h-48 bg-gray-800 border-2 border-dashed border-gray-600 rounded-2xl flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
              <Scan className="w-10 h-10 text-emerald-500" />
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Camera Active</span>
            </div>
            <div className="w-full flex items-center justify-between bg-gray-800 p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-6 h-6 text-gray-400" />
                <div>
                  <p className="text-xs font-black text-white">Your Device ID</p>
                  <p className="text-[10px] font-mono text-gray-400">ETHIO-9X2P</p>
                </div>
              </div>
              <QrCode className="w-8 h-8 text-white p-1.5 bg-gray-700 rounded-lg" />
            </div>
          </motion.div>
        )}

        {mode === 'transferring' && (
          <motion.div key="transferring" initial={instantFade} animate={{ opacity: 1, scale: 1 }} exit={instantFade} transition={snapPhysics} className="py-6 space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Transferring Payload</p>
                <p className="text-2xl font-black">{scope === 'chapter' ? 'Module 1' : 'Full Archive'}</p>
              </div>
              <span className="text-xl font-mono font-bold text-gray-400">74%</span>
            </div>
            <div className="w-full bg-gray-800 h-4 rounded-full overflow-hidden p-0.5 border border-gray-700">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-500 h-full w-[74%] rounded-full shadow-[0_0_10px_#6366f1] relative">
                 <div className="absolute inset-0 bg-white/20 animate-shimmer" />
              </div>
            </div>
          </motion.div>
        )}

        {mode === 'success' && (
          <motion.div key="success" initial={instantFade} animate={{ opacity: 1, scale: 1 }} exit={instantFade} transition={snapPhysics} className="py-6 flex flex-col items-center text-center space-y-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={snapPhysics} className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </motion.div>
            <div>
              <p className="text-xl font-black text-white">Transfer Complete</p>
              <p className="text-xs font-semibold text-emerald-400 mt-1">Payload decrypted and saved locally.</p>
            </div>
            <button onClick={() => setMode('idle')} className="mt-4 w-full bg-gray-800 py-3 rounded-xl font-bold text-sm">Return to Hub</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}