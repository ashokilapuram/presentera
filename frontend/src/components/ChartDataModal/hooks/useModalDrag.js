import { useState, useEffect } from 'react';

/**
 * Custom hook to handle modal dragging functionality
 */
export const useModalDrag = (isOpen, modalRef, initialPosition) => {
  const [position, setPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Set initial position only on first open
  useEffect(() => {
    if (isOpen && modalRef.current && initialPosition && !position) {
      const modal = modalRef.current;
      const modalWidth = modal.offsetWidth;
      const modalHeight = modal.offsetHeight;
      const padding = 16;
      
      // Calculate initial position (below the button)
      let x = initialPosition.x - (modalWidth / 2) + (initialPosition.width / 2);
      let y = initialPosition.y + initialPosition.height + 8; // 8px gap below button
      
      // Adjust position to stay within viewport
      // Right edge check
      if (x + modalWidth > window.innerWidth - padding) {
        x = window.innerWidth - modalWidth - padding;
      }
      // Left edge check
      if (x < padding) {
        x = padding;
      }
      // Bottom edge check
      if (y + modalHeight > window.innerHeight - padding) {
        // If not enough space below, try above the button
        if (initialPosition.y - modalHeight > padding) {
          y = initialPosition.y - modalHeight - 8; // 8px gap above button
        } else {
          y = window.innerHeight - modalHeight - padding;
        }
      }
      // Top edge check
      if (y < padding) {
        y = padding;
      }
      
      setPosition({ x, y });
    }
  }, [isOpen, modalRef, initialPosition]);

  // Handle drag functionality
  const handleMouseDown = (e) => {
    if (!modalRef.current) return;
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('table')) {
      return; // Don't drag if clicking on interactive elements
    }
    
    const rect = modalRef.current.getBoundingClientRect();
    const currentX = position ? position.x : (window.innerWidth - rect.width) / 2;
    const currentY = position ? position.y : (window.innerHeight - rect.height) / 2;
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - currentX,
      y: e.clientY - currentY
    });
    
    // If position is null (centered), set initial position
    if (!position) {
      setPosition({
        x: currentX,
        y: currentY
      });
    }
  };

  useEffect(() => {
    if (!isDragging) {
      // Reset cursor when not dragging
      if (document.body) {
        document.body.style.cursor = '';
      }
      return;
    }

    // Set move cursor on body during dragging to ensure it's always visible
    if (document.body) {
      document.body.style.cursor = 'move';
      document.body.style.userSelect = 'none';
    }

    const handleMouseMove = (e) => {
      if (!modalRef.current) return;
      
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Get modal dimensions
      const modalWidth = modalRef.current.offsetWidth;
      const modalHeight = modalRef.current.offsetHeight;
      
      // Keep modal within viewport with some padding
      const padding = 20;
      const minX = padding;
      const minY = padding;
      const maxX = window.innerWidth - modalWidth - padding;
      const maxY = window.innerHeight - modalHeight - padding;
      
      setPosition({
        x: Math.max(minX, Math.min(newX, maxX)),
        y: Math.max(minY, Math.min(newY, maxY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Reset cursor when dragging ends
      if (document.body) {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    const handleMouseLeave = () => {
      // Ensure cursor is reset if mouse leaves window
      if (document.body) {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      // Cleanup cursor on unmount
      if (document.body) {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
  }, [isDragging, dragOffset, modalRef]);

  // Reset dragging state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsDragging(false);
    }
  }, [isOpen]);

  return {
    position,
    setPosition,
    isDragging,
    handleMouseDown
  };
};

