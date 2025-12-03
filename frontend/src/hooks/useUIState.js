import { useState, useCallback, useEffect } from 'react';

export const useUIState = (setSelectedElement) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showDragMessage, setShowDragMessage] = useState(false);
  const [forceRightToolbarTab, setForceRightToolbarTab] = useState(null);
  const [currentRightToolbarTab, setCurrentRightToolbarTab] = useState('Insert');

  const handleToggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  // Apply/remove dark mode class on body
  useEffect(() => {
    const body = document.body;
    if (isDarkMode) {
      body.classList.add('dark');
    } else {
      body.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Smart deselection handler
  const handleSmartDeselection = useCallback((e) => {
    // Check if click is on RightToolbar, ToolbarBottom, or ToolbarTop
    const rightToolbar = document.querySelector('.right-toolbar');
    const toolbarBottom = document.querySelector('.toolbar-bottom');
    const toolbarTop = document.querySelector('.toolbar-top');
    const canvas = document.querySelector('.canvas');
    
    // If clicking on RightToolbar, ToolbarBottom, or ToolbarTop, don't deselect
    if (rightToolbar && rightToolbar.contains(e.target)) {
      return; // Don't deselect
    }
    
    if (toolbarBottom && toolbarBottom.contains(e.target)) {
      return; // Don't deselect
    }
    
    if (toolbarTop && toolbarTop.contains(e.target)) {
      return; // Don't deselect
    }
    
    // If clicking outside canvas, deselect both selection and editing
    if (canvas && !canvas.contains(e.target)) {
      setSelectedElement(null);
      // Also clear any text editing state by dispatching a custom event
      // that the Canvas component can listen to
      const clearEditingEvent = new CustomEvent('clearTextEditing');
      document.dispatchEvent(clearEditingEvent);
    }
  }, [setSelectedElement]);

  // Handle tab changes in RightToolbar
  const handleTabChange = useCallback((tabName) => {
    // Deselect element when switching tabs
    setSelectedElement(null);
    // Also clear text editing state
    const clearEditingEvent = new CustomEvent('clearTextEditing');
    document.dispatchEvent(clearEditingEvent);
  }, [setSelectedElement]);

  // Add global click listener for smart deselection
  useEffect(() => {
    document.addEventListener('click', handleSmartDeselection);
    return () => document.removeEventListener('click', handleSmartDeselection);
  }, [handleSmartDeselection]);

  return {
    // State
    isDarkMode,
    showDragMessage,
    setShowDragMessage,
    forceRightToolbarTab,
    setForceRightToolbarTab,
    currentRightToolbarTab,
    setCurrentRightToolbarTab,
    
    // Actions
    handleToggleDarkMode,
    handleSmartDeselection,
    handleTabChange
  };
};
