import { useState, useEffect, useCallback } from 'react';
import type { LeadContext } from '../types/lead';

const STORAGE_KEY = 'km-lead';

export function useLeadContext() {
  const [lead, setLeadState] = useState<LeadContext | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setLeadState(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error reading lead context', e);
    }
    setIsLoaded(true);
  }, []);

  const setLead = useCallback((updates: Partial<LeadContext>) => {
    setLeadState((prev) => {
      const next = prev ? { ...prev, ...updates } : (updates as LeadContext);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Error saving lead context', e);
      }
      return next;
    });
  }, []);

  const clearLead = useCallback(() => {
    setLeadState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing lead context', e);
    }
  }, []);

  return { lead, setLead, clearLead, hasLead: !!lead, isLoaded };
}
