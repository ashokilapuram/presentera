import { useState, useCallback } from 'react';

export const useSlideshow = (setCurrentSlideIndex, setSelectedElement) => {
  const [isSlideshowActive, setIsSlideshowActive] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startSlideshow = useCallback(() => {
    setIsSlideshowActive(true);
  }, []);

  const stopSlideshow = useCallback(() => {
    setIsSlideshowActive(false);
    setIsTransitioning(false);
  }, []);

  const startTransition = useCallback(() => {
    setIsTransitioning(true);
  }, []);

  const handleSlideshowSlideChange = useCallback((newSlideIndex) => {
    setCurrentSlideIndex(newSlideIndex);
    setSelectedElement(null);
    // Clear text editing state
    const clearEditingEvent = new CustomEvent('clearTextEditing');
    document.dispatchEvent(clearEditingEvent);
  }, [setCurrentSlideIndex, setSelectedElement]);

  return {
    isSlideshowActive,
    isTransitioning,
    startSlideshow,
    stopSlideshow,
    startTransition,
    handleSlideshowSlideChange
  };
};
