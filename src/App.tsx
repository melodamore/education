import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from './components/MainLayout';
import TextbookReader from './components/TextbookReader';
import Diagnostics from './components/Diagnostics';
import StudyHub from './components/StudyHub';
import OverlayControls from './components/OverlayControls';
import physicsData from './data/physics_g12_c1.json';

const snapPhysics = { type: "spring", stiffness: 800, damping: 35, mass: 0.5 } as const;
const instantFade = { opacity: 0, scale: 0.96 };

export default function App() {
  const [screen, setScreen] = useState<'navigator' | 'reader' | 'diagnostics' | 'hub'>('navigator');

  return (
    <MainLayout>
      {/* Global Application Nav Bar */}
      <div className="flex bg-white/40 border border-white/50 p-1.5 rounded-2xl backdrop-blur-xl mb-6 shadow-xs relative z-10">
        <button onClick={() => setScreen('navigator')} className={`flex-1 py-2.5 text-xs font-black tracking-widest rounded-xl transition-all ${screen === 'navigator' ? 'bg-white text-indigo-600 shadow-xs' : 'text-gray-500'}`}>CORE</button>
        <button onClick={() => setScreen('hub')} className={`flex-1 py-2.5 text-xs font-black tracking-widest rounded-xl transition-all ${screen === 'hub' ? 'bg-white text-indigo-600 shadow-xs' : 'text-gray-500'}`}>TRAIN</button>
        <button onClick={() => setScreen('diagnostics')} className={`flex-1 py-2.5 text-xs font-black tracking-widest rounded-xl transition-all ${screen === 'diagnostics' ? 'bg-white text-indigo-600 shadow-xs' : 'text-gray-500'}`}>VITALS</button>
      </div>

      <AnimatePresence mode="wait">
        {screen === 'navigator' && (
          <motion.div key="nav" initial={instantFade} animate={{ opacity: 1, scale: 1 }} exit={instantFade} transition={snapPhysics} className="space-y-4">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Curriculum</h1>
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => setScreen('reader')} className="w-full bg-white border border-gray-100 p-6 rounded-[2rem] flex items-center justify-between shadow-xs">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-[0_0_15px_rgba(79,70,229,0.4)]">PH</div>
                <div className="text-left">
                  <span className="block font-black text-gray-900 text-lg">Grade 12 Physics</span>
                  <span className="block font-bold text-xs text-indigo-500 uppercase tracking-wider">Module 1: Thermodynamics</span>
                </div>
              </div>
            </motion.button>
          </motion.div>
        )}

        {screen === 'reader' && (
          <motion.div key="reader" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={instantFade} transition={snapPhysics}>
            <TextbookReader chapterData={physicsData} />
          </motion.div>
        )}

        {screen === 'hub' && (
          <motion.div key="hub" initial={instantFade} animate={{ opacity: 1, scale: 1 }} exit={instantFade} transition={snapPhysics}>
            <StudyHub />
          </motion.div>
        )}

        {screen === 'diagnostics' && (
          <motion.div key="diag" initial={instantFade} animate={{ opacity: 1, scale: 1 }} exit={instantFade} transition={snapPhysics}>
            <Diagnostics mockWrongCount={2} mockCorrectCount={6} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global floating utility controls injection point */}
      <OverlayControls onSearchSelect={() => setScreen('reader')} />
    </MainLayout>
  );
}