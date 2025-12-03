import { useState, useEffect } from 'react';

/**
 * Custom hook to handle modal resizing functionality
 */
export const useModalResize = (isOpen, modalRef, position, setPosition) => {
  const [modalHeight, setModalHeight] = useState(null); // null means use default height
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartY, setResizeStartY] = useState(0);
  const [resizeStartHeight, setResizeStartHeight] = useState(0);

  // Handle resize functionality
  const handleResizeMouseDown = (e) => {
    if (!modalRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    
    const rect = modalRef.current.getBoundingClientRect();
    const currentHeight = modalHeight || rect.height;
    
    // If modal is centered (position is null), convert to fixed positioning
    // This prevents the overlay click from closing the modal during resize
    if (!position) {
      const centerX = (window.innerWidth - rect.width) / 2;
      const centerY = (window.innerHeight - rect.height) / 2;
      setPosition({ x: centerX, y: centerY });
    }
    
    setIsResizing(true);
    setResizeStartY(e.clientY);
    setResizeStartHeight(currentHeight);
    
    // If height is null (default), set it to current height
    if (!modalHeight) {
      setModalHeight(currentHeight);
    }
  };

  useEffect(() => {
    if (!isResizing) {
      // Ensure cursor is reset when not resizing
      if (document.body) {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
      return;
    }

    let isActive = true;

    const handleMouseMove = (e) => {
      if (!modalRef.current || !isActive) return;
      
      const deltaY = e.clientY - resizeStartY;
      const newHeight = Math.max(220, Math.min(800, resizeStartHeight + deltaY));
      setModalHeight(newHeight);
      
      // Set cursor during active resize
      if (document.body) {
        document.body.style.cursor = 'ns-resize';
        document.body.style.userSelect = 'none';
      }
    };

    const handleMouseUp = (e) => {
      if (!isActive) return;
      isActive = false;
      
      // Stop resizing immediately
      setIsResizing(false);
      
      // Reset cursor immediately on mouse up
      if (document.body) {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    const handleMouseLeave = () => {
      if (!isActive) return;
      isActive = false;
      
      // If mouse leaves window during resize, end resize and reset cursor
      setIsResizing(false);
      if (document.body) {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    // Set cursor on body when resize starts
    if (document.body) {
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp, true); // Use capture phase
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      isActive = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp, true);
      document.removeEventListener('mouseleave', handleMouseLeave);
      // Always cleanup cursor when effect unmounts
      if (document.body) {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
  }, [isResizing, resizeStartY, resizeStartHeight, modalRef]);

  // Reset height when modal opens (but keep position)
  useEffect(() => {
    if (isOpen) {
      setModalHeight(null); // Reset to default height
      setIsResizing(false);
      // Reset cursor if it was stuck
      if (document.body) {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    }
  }, [isOpen]);

  return {
    modalHeight,
    isResizing,
    handleResizeMouseDown,
    setIsResizing
  };
};

