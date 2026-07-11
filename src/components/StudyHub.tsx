import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Sparkles, Check, X } from 'lucide-react';

interface Flashcard { id: number; front: string; back: string; box: number; }

export default function StudyHub() {
  const [view, setView] = useState<'menu' | 'stories' | 'leitner'>('menu');
  const [storyIndex, setStoryIndex] = useState(0);
  
  // FEATURE 1: Leitner Card Database tracking boxes (1 = daily review, 2 = every 3 days, etc.)
  const [cards, setCards] = useState<Flashcard[]>([
    { id: 1, front: "State the First Law of Thermodynamics", back: "ΔU = Q - W", box: 1 },
    { id: 2, front: "What is an Isobaric process?", back: "A thermodynamic process occurring at constant pressure.", box: 1 }
  ]);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // FEATURE 2: 30-Second Bite-Sized Edu-Stories Data
  const eduStories = [
    { title: "Energy Flow", text: "Heat naturally moves from hotter systems to colder systems until thermal equilibrium matches their speeds.", gradient: "from-amber-500 to-red-500" },
    { title: "Work Done", text: "When a gas expands, it does positive work ($+W$) on its surroundings, burning up its inner thermal banks.", gradient: "from-blue-500 to-indigo-600" }
  ];

  const handleLeitnerAnswer = (known: boolean) => {
    setCards(prev => prev.map((card, idx) => {
      if (idx !== currentCardIdx) return card;
      return { ...card, box: known ? card.box + 1 : 1 }; // Reset to Box 1 if wrong, promote if correct
    }));
    setIsFlipped(false);
    if (currentCardIdx < cards.length - 1) setCurrentCardIdx(p => p + 1);
    else setCurrentCardIdx(0);
  };

  return (
    <div className="space-y-4">
      {view === 'menu' && (
        <div className="grid grid-cols-2 gap-4">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setView('stories')} className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-5 rounded-3xl text-left relative overflow-hidden h-32 flex flex-col justify-between shadow-md">
            <Sparkles className="w-6 h-6 opacity-40 absolute top-4 right-4" />
            <span className="bg-white/20 text-[9px] font-black tracking-widest px-2 py-0.5 rounded-md uppercase">30s Review</span>
            <span className="font-black text-lg tracking-tight">Edu-Stories</span>
          </motion.button>

          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setView('leitner')} className="bg-white border border-gray-100 p-5 rounded-3xl text-left relative overflow-hidden h-32 flex flex-col justify-between shadow-sm">
            <Layers className="w-6 h-6 text-indigo-500 opacity-30 absolute top-4 right-4" />
            <span className="bg-indigo-50 text-indigo-600 text-[9px] font-black tracking-widest px-2 py-0.5 rounded-md uppercase">Spaced Repetition</span>
            <span className="font-black text-lg tracking-tight text-gray-900">Leitner Decks</span>
          </motion.button>
        </div>
      )}

      {/* FEATURE 2: Bite-Sized Stories Deck */}
      {view === 'stories' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative h-96 bg-slate-900 rounded-[2.5rem] overflow-hidden flex flex-col justify-between p-6 text-white shadow-2xl">
          <div className={`absolute inset-0 bg-gradient-to-br ${eduStories[storyIndex].gradient} opacity-20`} />
          <div className="flex justify-between items-center relative z-10">
            <span className="text-xs font-black tracking-wider uppercase bg-white/20 px-3 py-1 rounded-full">Story {storyIndex + 1}/{eduStories.length}</span>
            <button onClick={() => setView('menu')} className="p-1.5 bg-white/10 rounded-full"><X className="w-4 h-4"/></button>
          </div>
          <div className="relative z-10 space-y-3 my-auto">
            <h4 className="text-3xl font-black tracking-tight">{eduStories[storyIndex].title}</h4>
            <p className="text-base font-medium leading-relaxed opacity-90">{eduStories[storyIndex].text}</p>
          </div>
          <div className="flex space-x-2 relative z-10">
            <button disabled={storyIndex === 0} onClick={() => setStoryIndex(p => p - 1)} className="flex-1 py-3 bg-white/10 rounded-xl text-xs font-bold disabled:opacity-30">Previous</button>
            <button disabled={storyIndex === eduStories.length - 1} onClick={() => setStoryIndex(p => p + 1)} className="flex-1 py-3 bg-white text-gray-950 rounded-xl text-xs font-black">Next</button>
          </div>
        </motion.div>
      )}

      {/* FEATURE 1: Leitner Spaced Repetition Canvas */}
      {view === 'leitner' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex justify-between items-center"><span className="text-xs font-black tracking-wider text-gray-400 uppercase">Adaptive Leitner Deck</span><button onClick={() => setView('menu')} className="p-1.5 bg-gray-100 rounded-full"><X className="w-4 h-4 text-gray-600"/></button></div>
          
          <motion.div whileTap={{ scale: 0.98 }} onClick={() => setIsFlipped(!isFlipped)} className="h-56 bg-white border border-gray-200 rounded-[2rem] p-6 shadow-sm flex flex-col items-center justify-center text-center cursor-pointer relative overflow-hidden">
            <div className="absolute top-4 left-4 bg-indigo-50 text-indigo-600 text-[9px] font-black px-2 py-0.5 rounded">Box {cards[currentCardIdx].box}</div>
            <AnimatePresence mode="wait">
              <motion.p key={isFlipped ? 'back' : 'front'} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-lg font-extrabold text-gray-900 px-4">
                {isFlipped ? cards[currentCardIdx].back : cards[currentCardIdx].front}
              </motion.p>
            </AnimatePresence>
            <span className="text-[10px] text-gray-400 font-bold absolute bottom-4">Tap card to flip</span>
          </motion.div>

          {isFlipped && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex space-x-3">
              <button onClick={() => handleLeitnerAnswer(false)} className="flex-1 py-4 bg-red-500 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-1"><X className="w-4 h-4"/><span>Forgot</span></button>
              <button onClick={() => handleLeitnerAnswer(true)} className="flex-1 py-4 bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-1"><Check className="w-4 h-4"/><span>Knew It</span></button>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}