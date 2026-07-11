import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Timer, Brain, Flame, Target, X, ShieldAlert } from 'lucide-react';

export default function Diagnostics({ mockWrongCount, mockCorrectCount }: { mockWrongCount: number, mockCorrectCount: number }) {
  const [activeEngine, setActiveEngine] = useState<'menu' | 'time_attack' | 'nemesis'>('menu');
  
  // Time Attack State
  const [timeLeft, setTimeLeft] = useState(60); 
  const [isExamRunning, setIsExamRunning] = useState(false);
  
  // Zen Grow State
  const [zenTime, setZenTime] = useState(0);
  const [isZenActive, setIsZenActive] = useState(false);

  // Score Predictor Calculation
  const totalAnswers = mockWrongCount + mockCorrectCount;
  const accuracyRate = totalAnswers > 0 ? (mockCorrectCount / totalAnswers) : 0.75;
  const projectedEUEEScore = Math.round(accuracyRate * 100);

  // Time-Attack clock ticking loop
  useEffect(() => {
    if (!isExamRunning || timeLeft <= 0) { setIsExamRunning(false); return; }
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [isExamRunning, timeLeft]);

  // Focus Lock growth loop
  useEffect(() => {
    if (!isZenActive) return;
    const t = setInterval(() => setZenTime(p => p + 1), 1000);
    return () => clearInterval(t);
  }, [isZenActive]);

  return (
    <div className="space-y-6">
      {activeEngine === 'menu' && (
        <>
          {/* AI Score Predictor */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-[2rem] text-white space-y-4 shadow-xl relative overflow-hidden">
            <Brain className="w-32 h-32 absolute -right-6 -bottom-6 text-white/5 pointer-events-none" />
            <div className="relative z-10">
              <span className="text-[10px] font-black bg-indigo-500/30 text-indigo-300 border border-indigo-500/20 px-2 py-1 rounded-md uppercase tracking-wider">Predictive Score Engine</span>
              <h3 className="text-5xl font-black mt-3 tracking-tight">{projectedEUEEScore} <span className="text-base text-gray-400 font-bold">/ 100</span></h3>
              <p className="text-xs text-gray-400 mt-2 font-medium leading-relaxed pr-8">Estimated national scale projection built from offline analytical logs.</p>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden relative z-10">
              <div className="bg-indigo-500 h-full transition-all duration-1000 ease-out" style={{ width: `${projectedEUEEScore}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Time-Attack Trigger */}
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setActiveEngine('time_attack'); setTimeLeft(60); }} className="bg-white border border-gray-100 p-5 rounded-3xl text-left flex flex-col justify-between h-36 shadow-sm">
              <Timer className="w-6 h-6 text-red-500" />
              <div>
                <span className="block font-black text-lg text-gray-900 leading-tight">Time-Attack</span>
                <span className="text-[10px] text-gray-400 font-bold tracking-wider uppercase">EUEE Simulation</span>
              </div>
            </motion.button>

            {/* Nemesis Engine Trigger */}
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setActiveEngine('nemesis')} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl text-left flex flex-col justify-between h-36 shadow-lg">
              <Target className="w-6 h-6 text-amber-500" />
              <div>
                <span className="block font-black text-lg text-white leading-tight">Nemesis Exam</span>
                <span className="text-[10px] text-gray-400 font-bold tracking-wider uppercase">Blind-Spot Target</span>
              </div>
            </motion.button>

            {/* Zen Grow Trigger */}
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsZenActive(!isZenActive)} className={`col-span-2 p-6 rounded-3xl flex items-center justify-between border transition-all ${isZenActive ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/30' : 'bg-white border-gray-100 text-gray-900 shadow-sm'}`}>
              <div>
                <span className="block font-black text-xl leading-tight">{isZenActive ? `${zenTime}s Locked` : 'Zen Grow'}</span>
                <span className={`text-xs font-bold tracking-wider uppercase mt-1 block ${isZenActive ? 'text-emerald-200' : 'text-gray-400'}`}>Focus Locker</span>
              </div>
              <Flame className={`w-8 h-8 ${isZenActive ? 'text-white animate-pulse' : 'text-emerald-500'}`} />
            </motion.button>
          </div>
        </>
      )}

      {/* Nemesis Engine View */}
      {activeEngine === 'nemesis' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] space-y-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/20 blur-3xl rounded-full pointer-events-none" />
          <div className="flex justify-between items-center relative z-10">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white px-2.5 py-1 rounded-md shadow-sm">Blind-Spot Crawl Complete</span>
            <button onClick={() => setActiveEngine('menu')} className="p-2 bg-amber-200/50 rounded-full hover:bg-amber-200 transition-colors"><X className="w-5 h-5 text-amber-800"/></button>
          </div>
          <div className="space-y-3 relative z-10">
            <ShieldAlert className="w-12 h-12 text-amber-600" />
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">Thermodynamics</h3>
            <p className="text-[15px] font-semibold text-gray-700 leading-relaxed">Analytics show a 33% fail rate on this specific topic. The engine has generated a 10-question, high-intensity review exam targeting your exact weaknesses.</p>
          </div>
          <button className="w-full bg-amber-600 text-white py-4 rounded-xl font-black tracking-widest text-xs uppercase shadow-lg shadow-amber-600/20 active:scale-95 transition-transform relative z-10">Commence Nemesis Exam</button>
        </motion.div>
      )}

      {/* Time-Attack View */}
      {activeEngine === 'time_attack' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-950 p-6 rounded-[2rem] text-white space-y-6 border border-gray-900 shadow-2xl relative">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-md">Strict Exam Parameters Enabled</span>
            <button onClick={() => { setIsExamRunning(false); setActiveEngine('menu'); }} className="p-2 bg-gray-900 rounded-full hover:bg-gray-800 transition-colors"><X className="w-5 h-5 text-gray-400"/></button>
          </div>

          <div className="text-center space-y-2 py-8">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Time Remaining</p>
            <h4 className={`text-7xl font-mono font-black tracking-tighter ${timeLeft < 15 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </h4>
          </div>

          {!isExamRunning && timeLeft > 0 ? (
            <button onClick={() => setIsExamRunning(true)} className="w-full bg-red-600 py-4 rounded-xl font-black tracking-widest text-xs uppercase shadow-[0_0_20px_rgba(220,38,38,0.3)] active:scale-95 transition-transform">Commence Countdown</button>
          ) : (
            <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl text-center text-sm font-bold text-gray-400 flex flex-col items-center justify-center space-y-2">
              <span>{timeLeft === 0 ? '⏰ Terminal Limit Reached' : '🔒 Input Locks Applied.'}</span>
              {timeLeft > 0 && <span className="text-xs text-gray-500">Solve Linked Chapter Quizzes now.</span>}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}