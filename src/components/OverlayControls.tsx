import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Edit3, Sigma, X, Type, Paintbrush, Trash2, Camera, Box, ScanLine, Battery, BatteryWarning, Mic, Send } from 'lucide-react';
import { useBattery } from '../contexts/BatteryContext';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { performOCR } from '../services/ocrService';
import { transcribeAudio } from '../services/voiceService';
import { culturalAnalogies } from '../data/analogies';
import { ARDeskLab } from './ARDeskLab';
import { P2PSyncService } from '../services/p2pSync';

const snapPhysics = { type: "spring", stiffness: 800, damping: 35, mass: 0.5 } as const;

export default function OverlayControls({ onSearchSelect }: { onSearchSelect: (chapterId: string) => void }) {
  const [activeTool, setActiveTool] = useState<'search' | 'notepad' | 'hud' | 'ocr' | 'ar' | null>(null);
  const { isBatteryModeActive, toggleBatteryMode } = useBattery();
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [analogyResult, setAnalogyResult] = useState<{ topic: string; analogyEn: string; analogyAm: string } | null>(null);
  
  // Notepad State
  const [noteMode, setNoteMode] = useState<'keyboard' | 'draw'>('keyboard');
  const [noteText, setNoteText] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // OCR Scanner State
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'found'>('idle');
  const [scannedFormula, setScannedFormula] = useState('');

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

  const broadcastP2PNote = async () => {
    setIsBroadcasting(true);
    try {
      let notesData = '';
      if (noteMode === 'keyboard') {
        notesData = noteText;
      } else if (canvasRef.current) {
        notesData = canvasRef.current.toDataURL('image/png');
      }

      if (!notesData) {
        setIsBroadcasting(false);
        return;
      }

      const payload = await P2PSyncService.serializePayload('g12-phys-c1', notesData);
      await P2PSyncService.mockBroadcast(payload);
    } catch (error) {
      console.error('Failed to broadcast note', error);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          try {
            const transcript = await transcribeAudio(audioBlob);
            setSearchQuery(transcript.trim());

            const lowerTranscript = transcript.toLowerCase();
            let matchedAnalogy = null;
            for (const key of Object.keys(culturalAnalogies)) {
              if (lowerTranscript.includes(key)) {
                matchedAnalogy = culturalAnalogies[key];
                break;
              }
            }
            setAnalogyResult(matchedAnalogy || null);

          } catch (error) {
            console.error('Transcription failed', error);
          }

          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Microphone access denied', err);
      }
    }
  };

  // OCR Scan Action
  const runOCRScan = async () => {
    try {
      setScanStatus('scanning');
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });

      if (image.base64String) {
        const text = await performOCR(`data:image/${image.format};base64,${image.base64String}`);
        setScannedFormula(text.trim() || '$$ \\Delta U = Q - W $$');
        setScanStatus('found');
        setSearchQuery(text.trim());
      } else {
        setScanStatus('idle');
      }
    } catch (error) {
      console.error('Camera or OCR failed:', error);
      setScanStatus('idle');
    }
  };

  const closeTool = () => {
    setActiveTool(null);
    setScanStatus('idle');
  };

  return (
    <>
      <div className="fixed right-4 bottom-24 z-40 flex flex-col space-y-3 pointer-events-auto">
        <motion.button whileTap={{ scale: 0.9 }} onClick={toggleBatteryMode} className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border ${isBatteryModeActive ? 'bg-red-500 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-slate-900 text-amber-500 border-slate-800'}`}>{isBatteryModeActive ? <BatteryWarning className="w-5 h-5" /> : <Battery className="w-5 h-5" />}</motion.button>
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
                <div className="flex-1 flex flex-col perspective-[1000px] overflow-hidden">
                  {!isBatteryModeActive ? (
                    <ARDeskLab />
                  ) : (
                    <div className="flex-1 flex items-center justify-center p-6 text-center text-gray-500 font-bold border-2 border-dashed border-gray-200 rounded-2xl">
                      AR Desk Lab is disabled while Extreme Battery Mode is active.
                    </div>
                  )}
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
                      <p className="text-xl font-bold text-gray-900 font-serif break-words">{scannedFormula}</p>
                      <button onClick={() => { setActiveTool('search'); }} className="mt-4 w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm">Search Extracted Text</button>
                    </motion.div>
                  )}
                </div>
              )}

              {/* 3. Tri-Lingual Search */}
              {activeTool === 'search' && (
                <div className="flex-1 flex flex-col space-y-4">
                  <div className="relative flex items-center space-x-2">
                    <input type="text" placeholder="Search English, አማርኛ, Oromoo..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-gray-100 px-4 py-3.5 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-gray-900" />
                    <button onClick={toggleRecording} className={`p-3.5 rounded-xl transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-100 text-indigo-600'}`}>
                      <Mic className="w-5 h-5" />
                    </button>
                  </div>

                  {analogyResult && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-sm">
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Cultural Analogy: {analogyResult.topic}</p>
                      <p className="text-sm font-medium text-gray-800 mb-2">{analogyResult.analogyEn}</p>
                      <p className="text-sm font-medium text-gray-800 font-serif">{analogyResult.analogyAm}</p>
                    </div>
                  )}

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
                    {searchQuery && filteredResults.length === 0 && !analogyResult && (
                      <div className="text-center p-6 text-gray-400 font-bold text-sm">No results found in any language.</div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. Notepad Everywhere */}
              {activeTool === 'notepad' && (
                <div className="flex-1 flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex bg-gray-100 p-1 rounded-xl flex-1 mr-4">
                      <button onClick={() => setNoteMode('keyboard')} className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg flex items-center justify-center space-x-1 transition-all ${noteMode === 'keyboard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}><Type className="w-4 h-4"/><span>Type</span></button>
                      <button onClick={() => setNoteMode('draw')} className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg flex items-center justify-center space-x-1 transition-all ${noteMode === 'draw' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}><Paintbrush className="w-4 h-4"/><span>Sketch</span></button>
                    </div>
                    <button onClick={broadcastP2PNote} disabled={isBroadcasting} className={`p-3 rounded-xl transition-colors shadow-sm ${isBroadcasting ? 'bg-emerald-100 text-emerald-600 animate-pulse' : 'bg-emerald-600 text-white'}`}>
                      <Send className="w-5 h-5" />
                    </button>
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