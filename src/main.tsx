import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register the PWA service worker
registerSW({ immediate: true });

import { BatteryProvider } from './contexts/BatteryContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BatteryProvider>
      <App />
    </BatteryProvider>
  </React.StrictMode>,
);