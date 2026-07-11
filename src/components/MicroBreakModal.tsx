import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTapVelocity } from '../utils/useTapVelocity';

export const MicroBreakModal: React.FC = () => {
  const { isPanicking, resetPanicState } = useTapVelocity();
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    let timer: number;
    if (isPanicking) {
      setTimeLeft(60);
      timer = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            resetPanicState();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPanicking, resetPanicState]);

  return (
    <AnimatePresence>
      {isPanicking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-indigo-900/95 backdrop-blur-xl flex flex-col items-center justify-center pointer-events-auto"
        >
          <div className="text-center space-y-12">
            <h2 className="text-3xl font-black text-white tracking-tight">
              Take a breath.
            </h2>

            {/* Breathing Animation */}
            <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.5, 1] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-indigo-500/20 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2,
                }}
                className="absolute inset-4 bg-indigo-400/30 rounded-full"
              />
              <div className="relative z-10 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                <span className="text-4xl font-black text-indigo-600">
                  {timeLeft}
                </span>
              </div>
            </div>

            <p className="text-indigo-100 text-lg max-w-sm mx-auto px-6 opacity-80">
              We detected some fast tapping. Relax for a moment, let your mind settle.
            </p>

            <button
              onClick={resetPanicState}
              className="mt-8 px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-colors border border-white/20 backdrop-blur-md"
            >
              Resume Study
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
