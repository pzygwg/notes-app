import { useState, useCallback } from 'react';

export const useStatusMessage = () => {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  
  const showStatus = useCallback((message: string, duration = 2000) => {
    setStatusMessage(message);
    setTimeout(() => {
      setStatusMessage(null);
    }, duration);
  }, []);
  
  return { statusMessage, showStatus };
}; 