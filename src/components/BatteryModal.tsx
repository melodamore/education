import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBattery } from '../contexts/BatteryContext';

export const BatteryModal: React.FC = () => {
  const { showBatteryPrompt, dismissPrompt, acceptPrompt } = useBattery();

  return (
    <AnimatePresence>
      {showBatteryPrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center pointer-events-auto"
        >
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight">
              Low Battery Detected
            </h2>

            <p className="text-gray-400 text-sm">
              Your battery is dropping below 15%. Would you like to enable Extreme Battery Mode to conserve power? This will disable animations, AR, and set the UI to grayscale.
            </p>

            <div className="flex flex-col space-y-3 mt-6">
              <button
                onClick={acceptPrompt}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors shadow-lg"
              >
                Enable Extreme Mode
              </button>
              <button
                onClick={dismissPrompt}
                className="w-full py-3 bg-transparent text-gray-500 hover:text-white rounded-xl font-bold transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
