import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import KonvaCanvas from "../KonvaCanvas/KonvaCanvas";
import "./FullScreenSlideshow.css";

const FullScreenSlideshow = ({
  slides,
  currentSlideIndex,
  onClose,
  onSlideChange,
  zoom = 100,
}) => {
  // Start slideshow from first slide
  const [slideshowSlideIndex, setSlideshowSlideIndex] = useState(0);
  const [showCounter, setShowCounter] = useState(true);
  const counterTimerRef = useRef(null);

  // Auto-advance timer (5 seconds per slide)
  const autoAdvanceTimerRef = useRef(null);

  // Function to reset the auto-advance timer
  const resetAutoAdvanceTimer = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearInterval(autoAdvanceTimerRef.current);
    }
    autoAdvanceTimerRef.current = setInterval(() => {
      setSlideshowSlideIndex(prev => (prev + 1) % slides.length);
      showCounterBriefly();
    }, 5000);
  }, [slides.length]);

  // Function to show counter and auto-hide after delay
  const showCounterBriefly = useCallback(() => {
    setShowCounter(true);
    // Clear existing timer if any
    if (counterTimerRef.current) {
      clearTimeout(counterTimerRef.current);
    }
    // Hide after 1 second
    counterTimerRef.current = setTimeout(() => {
      setShowCounter(false);
      counterTimerRef.current = null;
    }, 1000);
  }, []);

  // Show counter briefly when slideshow opens
  useEffect(() => {
    showCounterBriefly();
    return () => {
      if (counterTimerRef.current) {
        clearTimeout(counterTimerRef.current);
      }
    };
  }, [showCounterBriefly]);

  const nextSlide = useCallback(() => {
    setSlideshowSlideIndex((prev) => (prev + 1) % slides.length);
    // Show counter when slide changes
    showCounterBriefly();
    // Reset auto-advance timer
    resetAutoAdvanceTimer();
  }, [slides.length, showCounterBriefly, resetAutoAdvanceTimer]);

  const prevSlide = useCallback(() => {
    setSlideshowSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
    // Show counter when slide changes
    showCounterBriefly();
    // Reset auto-advance timer
    resetAutoAdvanceTimer();
  }, [slides.length, showCounterBriefly, resetAutoAdvanceTimer]);

  // Set up auto-advance timer
  useEffect(() => {
    resetAutoAdvanceTimer();
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearInterval(autoAdvanceTimerRef.current);
      }
    };
  }, [resetAutoAdvanceTimer]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [nextSlide, prevSlide, onClose]);

  // Notify parent of slide change
  useEffect(() => {
    if (onSlideChange) {
      onSlideChange(slideshowSlideIndex);
    }
  }, [slideshowSlideIndex, onSlideChange]);

  const currentSlide = slides[slideshowSlideIndex];

  return createPortal(
    <div className="fullscreen-slideshow">
      <div className="slideshow-content">
        <div className="slide-viewport">
          <div className="slide-placeholder">
            <KonvaCanvas
              slide={currentSlide}
              selectedElement={null}
              setSelectedElement={() => {}}
              updateSlideElement={() => {}}
              deleteElement={() => {}}
              textFormatting={{}}
              isDarkMode={false}
              onToggleDarkMode={() => {}}
              onThumbnailUpdate={() => {}}
              readOnly={true}
              zoom={zoom}
            />
          </div>
        </div>
      </div>

      <div 
        className={`slideshow-controls ${showCounter ? 'visible' : 'hidden'}`}
        style={{
          opacity: showCounter ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          pointerEvents: showCounter ? 'auto' : 'none'
        }}
      >
        <button className="slideshow-button" onClick={prevSlide}>
          <FiChevronLeft size={24} />
        </button>
        <span className="slide-counter">
          {slideshowSlideIndex + 1} / {slides.length}
        </span>
        <button className="slideshow-button" onClick={nextSlide}>
          <FiChevronRight size={24} />
        </button>
      </div>
    </div>,
    document.body
  );
};

export default FullScreenSlideshow;
