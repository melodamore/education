import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from './components/MainLayout';
import { ChevronLeft, ChevronRight, Hexagon } from 'lucide-react';
import TextbookReader from './components/TextbookReader';
import physicsData from './data/physics_g12_c1.json';

const ACADEMIC_DATA = {
  "Grade 11": [ { id: "g11-bio", name: "Biology", chapters: ["Chapter 1: Biochemical Molecules"] } ],
  "Grade 12": [
    { id: "g12-phys", name: "Physics", chapters: ["Chapter 1: Thermodynamics", "Chapter 2: Waves"] },
    { id: "g12-bio", name: "Biology", chapters: ["Chapter 1: Evolution"] }
  ]
};

type GradeKey = keyof typeof ACADEMIC_DATA;

// HYPER SNAPPY PHYSICS - Instant feedback, no sluggish floating
const snapPhysics = { type: "spring", stiffness: 800, damping: 35, mass: 0.5 } as const;
const instantFade = { opacity: 0, scale: 0.96 };

export default function App() {
  const [currentGrade, setCurrentGrade] = useState<GradeKey | null>(null);
  const [currentSubject, setCurrentSubject] = useState<any | null>(null);
  const [currentChapter, setCurrentChapter] = useState<string | null>(null);

  const handleBack = () => {
    if (currentChapter) setCurrentChapter(null);
    else if (currentSubject) setCurrentSubject(null);
    else if (currentGrade) setCurrentGrade(null);
  };

  return (
    <MainLayout>
      <div className={`transition-opacity duration-200 ${currentGrade ? 'opacity-100 mb-6' : 'opacity-0 hidden'}`}>
        <button onClick={handleBack} className="flex items-center space-x-1 text-indigo-600 bg-white/50 backdrop-blur-md px-4 py-2 rounded-xl active:bg-white/80 active:scale-95 transition-all font-bold text-sm shadow-sm border border-white">
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!currentGrade && (
          <motion.div key="grades" initial={instantFade} animate={{ opacity: 1, scale: 1 }} exit={instantFade} transition={snapPhysics}>
            <h1 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">Select Level</h1>
            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(ACADEMIC_DATA) as GradeKey[]).map((grade) => (
                <motion.button
                  key={grade} onClick={() => setCurrentGrade(grade)}
                  whileTap={{ scale: 0.94 }} transition={snapPhysics}
                  className="relative bg-white/70 backdrop-blur-lg p-6 rounded-[1.5rem] shadow-sm border border-white/60 overflow-hidden text-left"
                >
                  <Hexagon className="w-10 h-10 text-indigo-100 absolute -bottom-2 -right-2 fill-indigo-600 opacity-20 transform rotate-12" />
                  <span className="block text-3xl font-black text-indigo-600 mb-1">{grade.split(' ')[1]}</span>
                  <span className="block font-bold text-gray-500 text-sm tracking-widest uppercase">Grade</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {currentGrade && !currentSubject && (
          <motion.div key="subjects" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={snapPhysics}>
            <h1 className="text-3xl font-black text-gray-900 mb-6">{currentGrade}</h1>
            <div className="space-y-3">
              {ACADEMIC_DATA[currentGrade].map((subject) => (
                <motion.button
                  key={subject.id} onClick={() => setCurrentSubject(subject)}
                  whileTap={{ scale: 0.96 }} transition={snapPhysics}
                  className="w-full bg-white/70 backdrop-blur-lg p-5 rounded-[1.5rem] border border-white/60 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                      {subject.name.substring(0,2).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <span className="block font-black text-gray-900 text-lg">{subject.name}</span>
                      <span className="block font-bold text-xs text-indigo-500">{subject.chapters.length} MODULES</span>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-300" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {currentSubject && !currentChapter && (
          <motion.div key="chapters" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={snapPhysics}>
            <h1 className="text-3xl font-black text-gray-900 mb-6">{currentSubject.name}</h1>
            <div className="space-y-3">
              {currentSubject.chapters.map((chapter: string, i: number) => (
                <motion.button
                  key={i} onClick={() => setCurrentChapter(chapter)}
                  whileTap={{ scale: 0.96 }} transition={snapPhysics}
                  className="w-full bg-white/70 backdrop-blur-lg p-6 rounded-[1.5rem] border border-white text-left shadow-sm"
                >
                  <span className="text-[10px] font-black text-indigo-500 tracking-widest uppercase block mb-1">Module {i + 1}</span>
                  <span className="font-black text-gray-900 text-xl">{chapter.split(': ')[1] || chapter}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {currentChapter && (
          <motion.div key="reader" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={instantFade} transition={snapPhysics}>
            {currentSubject.id === "g12-phys" && currentChapter.includes("1") ? <TextbookReader chapterData={physicsData} /> : <div className="p-8 text-center text-gray-400 font-bold">Data pending.</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}