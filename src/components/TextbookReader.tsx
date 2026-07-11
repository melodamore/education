import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle2, XCircle, ArrowLeftRight, X, Globe2, BookHeart, MessageSquare, ChevronDown } from 'lucide-react';
import { logAnswerResult } from '../utils/analytics';
import { culturalAnalogies } from '../data/analogies';

interface Keyword { word: string; translations: { [key: string]: string; }; definitions: { [key: string]: string; }; }
interface EUEEQuestion { year: string; question: string; options: string[]; correctAnswer: string; explanation: string; }
interface Section { id: string; title: string; content: string; localization: { [key: string]: { title: string; content: string } }; keywords: Keyword[]; eueeQuestions: EUEEQuestion[]; }
interface TextbookReaderProps { chapterData: { subject: string; grade: number; chapterNumber: number; title: string; sections: Section[]; }; }
type Locale = 'en' | 'am' | 'om';

const snapPhysics = { type: "spring", stiffness: 800, damping: 35, mass: 0.5 } as const;

// VFX: Particle Spark Explosion
const ParticleBurst = () => {
  const sparks = Array.from({ length: 12 });
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
      {sparks.map((_, i) => (
        <motion.div
          key={i} initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{ x: (Math.random() - 0.5) * 200, y: (Math.random() - 0.5) * 200, scale: [0, 1.5, 0], opacity: [1, 1, 0] }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]"
        />
      ))}
    </div>
  );
};

export default function TextbookReader({ chapterData }: TextbookReaderProps) {
  // Original States
  const [locale, setLocale] = useState<Locale>('en');
  const [vernacular, setVernacular] = useState<'am' | 'om'>('am'); 
  const [activeKeyword, setActiveKeyword] = useState<Keyword | null>(null);
  const [showExamMode, setShowExamMode] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);

  // New States
  const [showPeerNotes, setShowPeerNotes] = useState(false);
  const [derivationStep, setDerivationStep] = useState(0);
  const totalDerivationSteps = 3;

  useEffect(() => {
    document.body.style.overflow = activeKeyword ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [activeKeyword]);

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    if (newLocale === 'am' || newLocale === 'om') setVernacular(newLocale);
  };

  const renderHighlightedContent = (section: Section) => {
    const text = locale === 'en' ? section.content : section.localization[locale]?.content || section.content;
    if (locale !== 'en') return <span>{text}</span>;

    let elements: React.ReactNode[] = [text];
    section.keywords.forEach((keyword) => {
      const regex = new RegExp(`(${keyword.word})`, 'gi');
      const newElements: React.ReactNode[] = [];
      elements.forEach((el) => {
        if (typeof el === 'string') {
          const parts = el.split(regex);
          parts.forEach((part, index) => {
            if (part.toLowerCase() === keyword.word.toLowerCase()) {
              newElements.push(
                <motion.span
                  key={`${keyword.word}-${index}`} whileTap={{ scale: 0.9 }}
                  onClick={() => { setActiveKeyword(keyword); setSliderPos(50); }}
                  className="bg-indigo-600 text-white px-2 py-0.5 rounded-md cursor-pointer font-black shadow-[0_0_12px_rgba(79,70,229,0.5)] animate-pulse-glow inline-block mx-1"
                >
                  {part}
                </motion.span>
              );
            } else if (part) newElements.push(part);
          });
        } else newElements.push(el);
      });
      elements = newElements;
    });
    return <>{elements}</>;
  };

  return (
    <div className="relative pb-24 space-y-6">
      {/* 1. Language Controls */}
      <div className="flex bg-white/50 backdrop-blur-xl p-1.5 rounded-[1rem] w-full shadow-inner border border-white/60">
        {(['en', 'am', 'om'] as Locale[]).map((lang) => (
          <button key={lang} onClick={() => handleLocaleChange(lang)} className={`flex-1 py-2 text-[11px] font-black tracking-widest rounded-lg transition-all ${locale === lang ? 'bg-white text-indigo-600 shadow-sm scale-[1.02]' : 'text-gray-500 active:bg-white/30'}`}>
            {lang === 'en' ? 'ENG' : lang === 'am' ? 'አማርኛ' : 'ORO'}
          </button>
        ))}
      </div>

      {/* 2. Peer Review Toggle */}
      <div className="flex justify-between items-center bg-white/40 border border-white/50 p-3 rounded-2xl backdrop-blur-md">
        <span className="text-xs font-black text-gray-500 tracking-wider uppercase">Interactive Canvas Options</span>
        <button onClick={() => setShowPeerNotes(!showPeerNotes)} className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${showPeerNotes ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm' : 'bg-transparent border-gray-200 text-gray-600'}`}>
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Peer Overlays</span>
        </button>
      </div>

      {chapterData.sections.map((section) => (
        <div key={section.id} className="space-y-6 relative">
          
          {/* Peer Comment Float Pill */}
          <AnimatePresence>
            {showPeerNotes && (
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 5 }} className="absolute -top-2 right-2 z-20 bg-amber-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-full shadow-md flex items-center space-x-1 border border-amber-400">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                <span>Abebe: 'Highly tested equation in 2015 E.C!'</span>
              </motion.div>
            )}
          </AnimatePresence>

          <h3 className="text-4xl font-black text-gray-900 leading-[1.1] tracking-tight">
            {locale === 'en' ? section.title : section.localization[locale]?.title || section.title}
          </h3>
          
          <div className="bg-white/80 backdrop-blur-2xl p-6 rounded-[2rem] shadow-sm border border-white">
            <p className="text-gray-900 leading-relaxed text-lg font-medium tracking-wide">
              {renderHighlightedContent(section)}
            </p>
          </div>

          {/* Interactive Step-Derivation Matrix */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-[2rem] text-white space-y-4 shadow-lg">
            <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase block">Step-Derivation Matrix</span>
            <div className="space-y-2 border-l-2 border-indigo-500/30 pl-4">
              <div className="text-sm font-mono text-gray-300">Step 1: Write down definition of Work: $$ W = P \cdot \Delta V $$</div>
              {derivationStep >= 1 && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-sm font-mono text-gray-300 pt-2">Step 2: Substitute into Internal Energy: $$ \Delta U = Q - (P \cdot \Delta V) $$</motion.div>
              )}
              {derivationStep >= 2 && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-sm font-mono text-indigo-400 font-bold pt-2">Result: Energy balanced across boundary limits.</motion.div>
              )}
            </div>
            {derivationStep < totalDerivationSteps - 1 && (
              <button onClick={() => setDerivationStep(p => p + 1)} className="w-full bg-gray-800 border border-gray-700 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-1 hover:bg-gray-700 transition">
                <span>Reveal Next Derivation Step</span> <ChevronDown className="w-4 h-4"/>
              </button>
            )}
          </div>

          {/* EUEE Challenge Mode */}
          {section.eueeQuestions.length > 0 && (
            <motion.button whileTap={{ scale: 0.96 }} transition={snapPhysics} onClick={() => { setShowExamMode(showExamMode === section.id ? null : section.id); setSelectedAnswer(null); setIsAnswerSubmitted(false); }} className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white font-black py-4 rounded-[1.5rem] shadow-[0_8px_20px_rgba(79,70,229,0.3)] border border-indigo-500">
              <Zap className="w-5 h-5 fill-white" />
              <span>{showExamMode === section.id ? 'CLOSE EXAM' : 'EUEE CHALLENGE'}</span>
            </motion.button>
          )}

          <AnimatePresence>
            {showExamMode === section.id && (
              <motion.div initial={{ opacity: 0, height: 0, scale: 0.95 }} animate={{ opacity: 1, height: 'auto', scale: 1 }} exit={{ opacity: 0, height: 0, scale: 0.95 }} transition={snapPhysics} className="overflow-hidden">
                <div className="p-6 bg-gray-900 border border-gray-800 rounded-[2rem] shadow-2xl relative mt-4">
                  {section.eueeQuestions.map((q, qIdx) => (
                    <div key={qIdx} className="relative">
                      {isAnswerSubmitted && selectedAnswer === q.correctAnswer && <ParticleBurst />}
                      <div className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-black px-3 py-1.5 rounded-lg inline-block mb-4 uppercase tracking-widest">EUEE {q.year}</div>
                      <p className="font-bold text-white text-xl mb-6 leading-tight">{q.question}</p>
                      
                      <div className="space-y-3">
                        {q.options.map((option) => {
                          const optLetter = option.substring(0, 1);
                          const isSelected = selectedAnswer === optLetter;
                          return (
                            <motion.button key={option} whileTap={{ scale: 0.97 }} transition={snapPhysics} disabled={isAnswerSubmitted} onClick={() => setSelectedAnswer(optLetter)} className={`w-full text-left p-4 rounded-[1rem] border-2 font-bold transition-all ${isSelected ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'}`}>
                              {option}
                            </motion.button>
                          );
                        })}
                      </div>
                      
                      {selectedAnswer && (
                        <div className="mt-6">
                          {!isAnswerSubmitted ? (
                            <motion.button whileTap={{ scale: 0.96 }} onClick={() => { setIsAnswerSubmitted(true); logAnswerResult(chapterData.title, selectedAnswer === q.correctAnswer); }} className="w-full bg-white text-gray-900 font-black py-4 rounded-[1rem] uppercase tracking-widest">Submit</motion.button>
                          ) : (
                            <div className={`p-5 rounded-[1rem] border-2 ${selectedAnswer === q.correctAnswer ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-red-500/10 border-red-500 text-red-400'}`}>
                              <p className="font-black flex items-center text-lg uppercase tracking-wide">
                                {selectedAnswer === q.correctAnswer ? <CheckCircle2 className="w-6 h-6 mr-2" /> : <XCircle className="w-6 h-6 mr-2" />}
                                {selectedAnswer === q.correctAnswer ? 'System Verified' : 'Error Detected'}
                              </p>
                              <p className="text-sm mt-2 font-semibold text-gray-300">{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* Cyber Dictionary Bottom Sheet */}
      <AnimatePresence>
        {activeKeyword && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end pointer-events-none">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/60 backdrop-blur-md pointer-events-auto" onClick={() => setActiveKeyword(null)} />
            
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={snapPhysics} drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.1} onDragEnd={(_, info) => { if (info.offset.y > 100) setActiveKeyword(null); }} className="relative bg-white w-full rounded-t-[2.5rem] shadow-[0_-20px_40px_rgba(0,0,0,0.3)] pb-safe pt-2 px-6 h-[85vh] flex flex-col pointer-events-auto sm:max-w-md sm:mx-auto">
              <div className="w-16 h-2 bg-gray-200 rounded-full mx-auto my-4" />
              
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-black text-2xl text-gray-900 uppercase tracking-tighter flex items-center"><Globe2 className="w-6 h-6 mr-2 text-indigo-600" /> Dictionary</h4>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setActiveKeyword(null)} className="p-2 bg-gray-100 rounded-full text-gray-900"><X className="w-6 h-6" /></motion.button>
              </div>

              <div className="flex-1 overflow-y-auto pb-8 space-y-6 no-scrollbar">
                {/* Vernacular Toggle */}
                <div className="flex space-x-2 w-full">
                  <button onClick={() => setVernacular('am')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all border-2 ${vernacular === 'am' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-gray-100 text-gray-400 bg-transparent'}`}>Amharic</button>
                  <button onClick={() => setVernacular('om')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all border-2 ${vernacular === 'om' ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50' : 'border-gray-100 text-gray-400 bg-transparent'}`}>Oromoo</button>
                </div>

                <div className="py-2">
                  <h5 className="text-4xl font-black text-gray-900 capitalize mb-1 tracking-tight">{activeKeyword.word}</h5>
                  <p className={`text-2xl font-black tracking-tight ${vernacular === 'am' ? 'text-indigo-600' : 'text-emerald-600'}`}>{activeKeyword.translations[vernacular]}</p>
                </div>

                {/* Localized Ethiopian Analogy Engine */}
                {culturalAnalogies[activeKeyword.word.toLowerCase()] && (
                  <div className="mt-2 p-5 bg-amber-50 border border-amber-200 rounded-[1.5rem] shadow-sm">
                    <h6 className="font-black text-xs text-amber-800 uppercase tracking-widest mb-2 flex items-center"><BookHeart className="w-4 h-4 mr-1.5" /> Ethiopian Context</h6>
                    <p className="text-[15px] font-semibold text-amber-900 leading-relaxed">
                      {vernacular === 'am' ? culturalAnalogies[activeKeyword.word.toLowerCase()].analogyAm : culturalAnalogies[activeKeyword.word.toLowerCase()].analogyEn}
                    </p>
                  </div>
                )}

                {/* Glass Slider Definition Compare */}
                <div>
                  <div className="relative w-full h-64 bg-gray-900 rounded-[2rem] overflow-hidden shadow-[inset_0_2px_15px_rgba(0,0,0,0.5)] border border-gray-800 mt-2">
                    <div className="absolute inset-0 p-6 flex items-center justify-center text-center bg-gray-900 text-indigo-300">
                      <p className="text-[17px] font-bold leading-relaxed">{activeKeyword.definitions[vernacular]}</p>
                    </div>
                    <div className="absolute inset-0 p-6 bg-white/10 backdrop-blur-2xl text-white flex items-center justify-center text-center border-r-[4px] border-indigo-500 shadow-[5px_0_20px_rgba(79,70,229,0.4)]" style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}>
                      <p className="text-[17px] font-bold leading-relaxed">{activeKeyword.definitions.en}</p>
                    </div>
                    <input type="range" min="0" max="100" value={sliderPos} onChange={(e) => setSliderPos(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 z-10" />
                    <div className="absolute top-1/2 -translate-y-1/2 pointer-events-none z-20" style={{ left: `${sliderPos}%`, transform: `translate(-50%, -50%)` }}>
                      <div className="w-14 h-14 bg-indigo-600 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.8)] border-4 border-gray-900 flex items-center justify-center text-white">
                        <ArrowLeftRight className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4 text-center">Drag to compare language concepts</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}