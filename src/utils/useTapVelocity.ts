import { useEffect, useRef, useState, useCallback } from 'react';

const INTERACTIVE_ELEMENTS = ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT'];

export const useTapVelocity = () => {
  const [isPanicking, setIsPanicking] = useState(false);
  const clickBuffer = useRef<number[]>([]);

  const resetPanicState = useCallback(() => {
    setIsPanicking(false);
    clickBuffer.current = [];
  }, []);

  useEffect(() => {
    const handleTap = (e: MouseEvent | TouchEvent) => {
      // Don't track if we are already panicking
      if (isPanicking) return;

      const target = e.target as HTMLElement;

      // Ignore if it's an actionable element
      if (
        target &&
        (INTERACTIVE_ELEMENTS.includes(target.tagName) ||
          target.closest('button') ||
          target.closest('a') ||
          target.getAttribute('role') === 'button' ||
          target.closest('[role="button"]'))
      ) {
        return; // Ignore actionable elements
      }

      const now = Date.now();

      // Add current timestamp to buffer
      clickBuffer.current.push(now);

      // Remove timestamps older than 2 seconds (2000 ms)
      clickBuffer.current = clickBuffer.current.filter((timestamp) => now - timestamp <= 2000);

      // If length > 5 (i.e. 6th tap within 2 seconds), trigger panic
      if (clickBuffer.current.length > 5) {
        setIsPanicking(true);
      }
    };

    // Attach to window to catch everything globally
    window.addEventListener('click', handleTap, true);
    window.addEventListener('touchstart', handleTap, { capture: true, passive: true });

    return () => {
      window.removeEventListener('click', handleTap, true);
      window.removeEventListener('touchstart', handleTap, { capture: true } as any);
    };
  }, [isPanicking]);

  return { isPanicking, resetPanicState };
};
