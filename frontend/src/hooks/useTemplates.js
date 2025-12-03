import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useTemplates = (slides, setSlides, setCurrentSlideIndex, setSelectedElement) => {
  const [showTemplates, setShowTemplates] = useState(false);

  const addSlideFromTemplate = useCallback((template, onSnapshot) => {
    // --- Save current state before template change ---
    onSnapshot({ slides, selectedElement: null, currentSlideIndex: 0 });

    // Template has slides array, replace ALL existing slides with template slides
    const templateSlides = template.slides.map(slide => ({
      ...slide,
      id: uuidv4(),
      elements: slide.elements.map(element => ({
        ...element,
        id: uuidv4()
      }))
    }));
    
    // Replace all slides with template slides
    setSlides(templateSlides);
    setCurrentSlideIndex(0);
    setSelectedElement(null);
  }, [slides, setSlides, setCurrentSlideIndex, setSelectedElement]);

  const handleTemplateSelect = useCallback((template, onSnapshot) => {
    addSlideFromTemplate(template, onSnapshot);
    setShowTemplates(false);
  }, [addSlideFromTemplate]);

  const loadTemplate = useCallback(async (template) => {
    try {
      // If template has a jsonFile property, fetch it
      if (template.jsonFile) {
        const response = await fetch(template.jsonFile);
        const templateData = await response.json();
        
        // Load the template data into slides
        if (templateData.slides) {
          setSlides(templateData.slides);
          setCurrentSlideIndex(0);
          setSelectedElement(null);
        }
      }
    } catch (error) {
      console.error('Error loading template:', error);
    }
  }, [setSlides, setCurrentSlideIndex, setSelectedElement]);

  return {
    // State
    showTemplates,
    setShowTemplates,
    
    // Actions
    addSlideFromTemplate,
    handleTemplateSelect,
    loadTemplate
  };
};
