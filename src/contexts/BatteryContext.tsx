import React, { createContext, useContext, useEffect, useState } from 'react';
import { Device } from '@capacitor/device';

interface BatteryContextType {
  isBatteryModeActive: boolean;
  toggleBatteryMode: () => void;
  showBatteryPrompt: boolean;
  dismissPrompt: () => void;
  acceptPrompt: () => void;
}

const BatteryContext = createContext<BatteryContextType | undefined>(undefined);

export const BatteryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBatteryModeActive, setIsBatteryModeActive] = useState(false);
  const [showBatteryPrompt, setShowBatteryPrompt] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);

  useEffect(() => {
    let interval: number;
    const checkBattery = async () => {
      try {
        const info = await Device.getBatteryInfo();
        if (info.batteryLevel !== undefined && info.batteryLevel < 0.15 && !hasPrompted) {
          setShowBatteryPrompt(true);
          setHasPrompted(true);
        }
      } catch (e) {
        console.warn('Battery info not available', e);
      }
    };
    checkBattery();
    interval = window.setInterval(checkBattery, 60000);
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hasPrompted]);

  useEffect(() => {
    if (isBatteryModeActive) {
      document.documentElement.classList.add('extreme-battery-mode');
    } else {
      document.documentElement.classList.remove('extreme-battery-mode');
    }
  }, [isBatteryModeActive]);

  const toggleBatteryMode = () => setIsBatteryModeActive((prev) => !prev);
  const dismissPrompt = () => setShowBatteryPrompt(false);
  const acceptPrompt = () => {
    setIsBatteryModeActive(true);
    setShowBatteryPrompt(false);
  };

  return (
    <BatteryContext.Provider value={{ isBatteryModeActive, toggleBatteryMode, showBatteryPrompt, dismissPrompt, acceptPrompt }}>
      {children}
    </BatteryContext.Provider>
  );
};

export const useBattery = () => {
  const context = useContext(BatteryContext);
  if (context === undefined) {
    throw new Error('useBattery must be used within a BatteryProvider');
  }
  return context;
};
