import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Edit3, Sigma, X, Type, Paintbrush, Trash2, Camera, Box, ScanLine } from 'lucide-react';

const snapPhysics = { type: "spring", stiffness: 800, damping: 35, mass: 0.5 } as const;

export default function OverlayControls({ onSearchSelect }: { onSearchSelect: (chapterId: string) => void }) {
  const [activeTool, setActiveTool] = useState<'search' | 'notepad' | 'hud' | 'ocr' | 'ar' | null>(null);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  
  // Notepad State
  const [noteMode, setNoteMode] = useState<'keyboard' | 'draw'>('keyboard');
  const [noteText, setNoteText] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  // OCR Scanner State
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'found'>('idle');

  // AR Lab State
  const [arTilt, setArTilt] = useState({ x: 0, y: 0 });

  // Cross-indexed mock data
  const mockSearchIndex = [
    { id: "g12-phys-c1", term: "Thermal Equilibrium", am: "የሙቀት አማካኝ ሚዛን", om: "Madaallii Ho'aa", category: "Physics G12" },
    { id: "g12-phys-c1", term: "Thermodynamics", am: "ቴርሞዳይናሚክስ", om: "Tiermoodaayinamiksii", category: "Physics G12" }
  ];

  const filteredResults = searchQuery ? mockSearchIndex.filter(item => 
    item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.am.includes(searchQuery) ||
    item.om.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  // AR Lab Gyroscope Listener
  useEffect(() => {
    if (activeTool !== 'ar') return;
    const handleTilt = (e: DeviceOrientationEvent) => {
      setArTilt({ x: e.beta || 0, y: e.gamma || 0 });
    };
    window.addEventListener('deviceorientation', handleTilt);
    return () => window.removeEventListener('deviceorientation', handleTilt);
  }, [activeTool]);

  // Notepad Drawing Logic
  useEffect(() => {
    if (activeTool !== 'notepad' || noteMode !== 'draw' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
  }, [activeTool, noteMode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    draw(e);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    if (canvasRef.current) canvasRef.current.getContext('2d')?.beginPath();
  };

  // OCR Scan Action
  const runOCRScan = () => {
    setScanStatus('scanning');
    setTimeout(() => setScanStatus('found'), 2500);
  };

  const closeTool = () => {
    setActiveTool(null);
    setScanStatus('idle');
  };

  return (
    <>
      <div className="fixed right-4 bottom-24 z-40 flex flex-col space-y-3 pointer-events-auto">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setActiveTool('ar')} className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)] border border-indigo-400"><Box className="w-5 h-5" /></motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setActiveTool('ocr')} className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg border border-slate-800"><Camera className="w-5 h-5" /></motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setActiveTool('search')} className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg border border-slate-800"><Search className="w-5 h-5" /></motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setActiveTool('notepad')} className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg border border-slate-800"><Edit3 className="w-5 h-5" /></motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setActiveTool('hud')} className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg border border-slate-800"><Sigma className="w-5 h-5" /></motion.button>
      </div>

      <AnimatePresence>
        {activeTool && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={closeTool} />
            
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={snapPhysics} className="relative bg-white w-full rounded-t-[2.5rem] p-6 h-[75vh] flex flex-col sm:max-w-md sm:mx-auto">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />
              
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black capitalize tracking-tight text-gray-900">{activeTool} Module</h3>
                <button onClick={closeTool} className="p-2 bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-700" /></button>
              </div>

              {/* 1. AR Desk Lab */}
              {activeTool === 'ar' && (
                <div className="flex-1 flex flex-col items-center justify-center perspective-[1000px] overflow-hidden">
                  <p className="text-xs font-black tracking-widest uppercase text-gray-400 mb-12">Tilt phone to inspect 3D Model</p>
                  <motion.div className="w-48 h-48 relative preserve-3d transition-transform duration-75" style={{ transform: `rotateX(${-arTilt.x}deg) rotateY(${arTilt.y}deg)` }}>
                    <div className="absolute inset-0 border-4 border-indigo-500 bg-indigo-500/20 backdrop-blur-sm transform translate-z-24 flex items-center justify-center"><span className="font-black text-indigo-700 text-2xl">H₂O</span></div>
                    <div className="absolute inset-0 border-4 border-indigo-500 bg-indigo-500/20 backdrop-blur-sm transform -translate-z-24 flex items-center justify-center text-white font-black opacity-30">BACK</div>
                    <div className="absolute inset-0 border-4 border-indigo-500 bg-indigo-500/20 backdrop-blur-sm transform rotate-y-90 translate-z-24" />
                    <div className="absolute inset-0 border-4 border-indigo-500 bg-indigo-500/20 backdrop-blur-sm transform -rotate-y-90 translate-z-24" />
                    <div className="absolute inset-0 border-4 border-indigo-500 bg-indigo-500/20 backdrop-blur-sm transform rotate-x-90 translate-z-24" />
                    <div className="absolute inset-0 border-4 border-indigo-500 bg-indigo-500/20 backdrop-blur-sm transform -rotate-x-90 translate-z-24" />
                  </motion.div>
                </div>
              )}

              {/* 2. OCR Scanner */}
              {activeTool === 'ocr' && (
                <div className="flex-1 flex flex-col space-y-4">
                  <div className="relative w-full h-64 bg-gray-900 rounded-[2rem] overflow-hidden flex items-center justify-center border-4 border-gray-800">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
                    <ScanLine className={`w-16 h-16 text-emerald-400 ${scanStatus === 'scanning' ? 'animate-ping' : ''}`} />
                    {scanStatus === 'scanning' && <div className="absolute top-0 w-full h-1 bg-emerald-400 shadow-[0_0_20px_#34d399] animate-[scan_2s_ease-in-out_infinite]" />}
                  </div>
                  
                  {scanStatus === 'idle' && (
                    <button onClick={runOCRScan} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black tracking-widest uppercase">Scan Hand-written Math</button>
                  )}
                  {scanStatus === 'found' && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-center">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Extraction Match Found</p>
                      <p className="text-2xl font-bold text-gray-900 font-serif">$$ \Delta U = Q - W $$</p>
                      <button onClick={() => { onSearchSelect('g12-phys-c1'); closeTool(); }} className="mt-4 w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm">Jump to Thermodynamics Concept</button>
                    </motion.div>
                  )}
                </div>
              )}

              {/* 3. Tri-Lingual Search */}
              {activeTool === 'search' && (
                <div className="flex-1 flex flex-col space-y-4">
                  <div className="relative">
                    <input type="text" placeholder="Search English, አማርኛ, Oromoo..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-100 px-4 py-3.5 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-gray-900" />
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2">
                    {filteredResults.map((res, idx) => (
                      <button key={idx} onClick={() => { onSearchSelect(res.id); closeTool(); }} className="w-full text-left p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center active:bg-indigo-50 transition-colors">
                        <div>
                          <span className="block font-black text-gray-900 text-base">{res.term}</span>
                          <span className="block text-xs text-gray-400 font-bold mt-0.5">{res.am} • {res.om}</span>
                        </div>
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 font-black px-2 py-1 rounded-md uppercase">{res.category}</span>
                      </button>
                    ))}
                    {searchQuery && filteredResults.length === 0 && (
                      <div className="text-center p-6 text-gray-400 font-bold text-sm">No results found in any language.</div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. Notepad Everywhere */}
              {activeTool === 'notepad' && (
                <div className="flex-1 flex flex-col space-y-4">
                  <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button onClick={() => setNoteMode('keyboard')} className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg flex items-center justify-center space-x-1 transition-all ${noteMode === 'keyboard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}><Type className="w-4 h-4"/><span>Type</span></button>
                    <button onClick={() => setNoteMode('draw')} className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg flex items-center justify-center space-x-1 transition-all ${noteMode === 'draw' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}><Paintbrush className="w-4 h-4"/><span>Sketch</span></button>
                  </div>
                  {noteMode === 'keyboard' ? (
                    <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Jot down notes, derivations, formulas..." className="flex-1 w-full bg-gray-50 p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 font-medium text-gray-900 resize-none outline-none" />
                  ) : (
                    <div className="flex-1 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl relative overflow-hidden">
                      <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} className="absolute inset-0 w-full h-full cursor-crosshair touch-none" width={400} height={400} />
                      <button onClick={() => { if(canvasRef.current) canvasRef.current.getContext('2d')?.clearRect(0,0,400,400); }} className="absolute bottom-3 right-3 p-3 bg-red-500 text-white rounded-full shadow-md"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  )}
                </div>
              )}

              {/* 5. Formula HUD */}
              {activeTool === 'hud' && (
                <div className="flex-1 overflow-y-auto space-y-3">
                  <span className="text-[10px] font-black tracking-widest text-indigo-500 uppercase block mb-1">Quick Reference Matrix</span>
                  <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-1">
                    <p className="text-[10px] text-indigo-400 font-sans font-bold uppercase tracking-widest">Thermodynamics Laws</p>
                    <p className="text-2xl font-bold font-serif pt-1">$$ \Delta U = Q - W $$</p>
                    <span className="text-xs font-sans text-gray-400 block pt-2 leading-relaxed">First Law: Internal energy change equals heat added minus work done.</span>
                  </div>
                  <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-1">
                    <p className="text-[10px] text-indigo-400 font-sans font-bold uppercase tracking-widest">Ideal Gas Equation</p>
                    <p className="text-2xl font-bold font-serif pt-1">$$ PV = nRT $$</p>
                    <span className="text-xs font-sans text-gray-400 block pt-2 leading-relaxed">State equation of a hypothetical ideal gas.</span>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}