import { useState, useCallback } from 'react';

export const useLandingPage = (loadTemplate) => {
  const [showLandingPage, setShowLandingPage] = useState(true);

  const handleLaunchPresentify = useCallback((template) => {
    setShowLandingPage(false);
    
    // If a template is provided, load it
    if (template) {
      loadTemplate(template);
    }
  }, [loadTemplate]);

  const handleBackToLanding = useCallback(() => {
    setShowLandingPage(true);
  }, []);

  return {
    // State
    showLandingPage,
    setShowLandingPage,
    
    // Actions
    handleLaunchPresentify,
    handleBackToLanding
  };
};
