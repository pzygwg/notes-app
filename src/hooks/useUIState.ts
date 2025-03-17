import { useState, useEffect } from 'react';
import { Note } from '../types';

export const useUIState = (activeNoteId?: string) => {
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [viewMode, setViewMode] = useState(false);

  // Toggle between edit and view modes for .cat files
  const toggleViewMode = () => {
    setViewMode(!viewMode);
  };

  // Reset view mode when changing notes
  useEffect(() => {
    setViewMode(false);
  }, [activeNoteId]);

  return {
    showShortcutHelp,
    setShowShortcutHelp,
    viewMode,
    setViewMode,
    toggleViewMode
  };
}; 