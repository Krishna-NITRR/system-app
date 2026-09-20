import { useState, useEffect } from 'react';

export function useTimezone() {
  const [timezone, setTimezone] = useState<string>('UTC');
  
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(tz || 'UTC');
    } catch (e) {
      console.error('Failed to get timezone', e);
      setTimezone('UTC');
    }
  }, []);

  return { timezone, setTimezone };
}
