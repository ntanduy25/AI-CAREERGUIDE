import { useState, useEffect } from 'react';

/**
 * Centralized MOET Regulations Configuration
 * Single Source of Truth for Circulars (Thông tư) across AI CareerGuide.
 * When a new Circular file is uploaded or scanned via Admin Ingestion,
 * the system scans the text/name, extracts the new circular code,
 * and dynamically updates all occurrences across the frontend.
 */

export const DEFAULT_MOET_CIRCULAR = 'Thông tư 09/2022/TT-BGDĐT';
export const DEFAULT_MOET_SHORT = 'TT 09/2022';
const STORAGE_KEY = 'ai_careerguide_active_circular';

export const getActiveCircular = (): string => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem(STORAGE_KEY);
    if (custom && custom.trim()) {
      return custom.trim();
    }
  }
  return DEFAULT_MOET_CIRCULAR;
};

export const getActiveCircularShort = (): string => {
  const full = getActiveCircular();
  const match = full.match(/(\d+\/\d+)/);
  return match ? `TT ${match[1]}` : DEFAULT_MOET_SHORT;
};

export const setActiveCircular = (newCircular: string): void => {
  if (typeof window !== 'undefined' && newCircular && newCircular.trim()) {
    const clean = newCircular.trim();
    localStorage.setItem(STORAGE_KEY, clean);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('active_circular_change', { detail: clean }));
  }
};

/**
 * React hook to reactively receive the active circular number
 */
export const useActiveCircular = (): string => {
  const [circular, setCircular] = useState<string>(getActiveCircular());

  useEffect(() => {
    const sync = () => {
      setCircular(getActiveCircular());
    };
    window.addEventListener('storage', sync);
    window.addEventListener('active_circular_change', sync as EventListener);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('active_circular_change', sync as EventListener);
    };
  }, []);

  return circular;
};
