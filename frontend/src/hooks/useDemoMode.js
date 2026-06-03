import { useState, useCallback } from 'react';
import { DEMO_DETECTION } from '../data/demoData';

/**
 * Demo mode hook for the AI detection feature.
 * Loads pre-computed detection results for hackathon demo.
 */
export function useDemoMode() {
  const [isDemoMode, setIsDemoMode] = useState(false);

  const triggerDemo = useCallback(() => {
    setIsDemoMode(true);
    return new Promise((resolve) => {
      // Simulate AI processing delay for realistic demo
      setTimeout(() => {
        resolve(DEMO_DETECTION);
      }, 2500);
    });
  }, []);

  const resetDemo = useCallback(() => {
    setIsDemoMode(false);
  }, []);

  return { isDemoMode, triggerDemo, resetDemo };
}
