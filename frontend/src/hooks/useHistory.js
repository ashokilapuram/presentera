import { useState, useCallback } from 'react';

export const useHistory = () => {
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [lastSaveTime, setLastSaveTime] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Helper function to save undo state with debouncing
  const saveUndoState = useCallback((slides, selectedElement, currentSlideIndex) => {
    const now = Date.now();
    // Mark that there are unsaved changes immediately
    setHasUnsavedChanges(true);
    
    // Only save if at least 300ms have passed since last save
    if (now - lastSaveTime > 300) {
      setUndoStack(prev => {
        const newStack = [...prev, { slides, selectedElement, currentSlideIndex }];
        return newStack.length > 100 ? newStack.slice(-100) : newStack;
      });
      setLastSaveTime(now);
    }
  }, [lastSaveTime]);

  const pushSnapshot = useCallback((snapshot) => {
    setUndoStack(prev => {
      const newStack = [...prev, snapshot];
      return newStack.length > 100 ? newStack.slice(-100) : newStack;
    });
    setRedoStack([]); // Clear redo stack when new action is performed
  }, []);

  const undo = useCallback((slides, selectedElement, currentSlideIndex, setSlides, setSelectedElement, setCurrentSlideIndex) => {
    // save current state (with index) to redo
    setRedoStack(prev => [...prev, { slides, selectedElement, currentSlideIndex }]);

    if (undoStack.length > 0) {
      const lastState = undoStack[undoStack.length - 1];

      // restore slides and selection
      setSlides(lastState.slides);
      setSelectedElement(lastState.selectedElement ?? null);

      // restore index safely (fallback keeps current index for old snapshots)
      const restoredIndex = typeof lastState.currentSlideIndex === 'number'
        ? Math.max(0, Math.min(lastState.slides.length - 1, lastState.currentSlideIndex))
        : Math.max(0, Math.min(lastState.slides.length - 1, currentSlideIndex));
      setCurrentSlideIndex(restoredIndex);

      setUndoStack(prev => prev.slice(0, -1));
    }
    setHasUnsavedChanges(false);
  }, [undoStack]);

  const redo = useCallback((slides, selectedElement, currentSlideIndex, setSlides, setSelectedElement, setCurrentSlideIndex) => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];

      // push current to undo (with index)
      setUndoStack(prev => [...prev, { slides, selectedElement, currentSlideIndex }]);

      setSlides(nextState.slides);
      setSelectedElement(nextState.selectedElement ?? null);

      const restoredIndex = typeof nextState.currentSlideIndex === 'number'
        ? Math.max(0, Math.min(nextState.slides.length - 1, nextState.currentSlideIndex))
        : Math.max(0, Math.min(nextState.slides.length - 1, currentSlideIndex));
      setCurrentSlideIndex(restoredIndex);

      setRedoStack(prev => prev.slice(0, -1));
    }
  }, [redoStack]);

  return {
    // State
    undoStack,
    redoStack,
    hasUnsavedChanges,
    
    // Actions
    saveUndoState,
    pushSnapshot,
    undo,
    redo
  };
};
