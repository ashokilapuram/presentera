import { useState, useRef, useCallback } from 'react';
import { calculateMinWidth } from '../utils/transformUtils';

export function useTextTransform(element, textRef, strokeRef, backgroundRef, onChange) {
  const [isTransforming, setIsTransforming] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(element.rotation || 0);
  const originalYPositionRef = useRef(null);
  const originalRotationRef = useRef(null);

  const handleTransform = useCallback((e) => {
    setIsTransforming(true);
    const node = textRef.current;
    const scaleX = node.scaleX();
    
    // Store original y position and rotation on first transform
    if (originalYPositionRef.current === null) {
      originalYPositionRef.current = node.y();
      originalRotationRef.current = node.rotation();
    }
    
    // Check if rotation has changed (user is rotating, not just resizing)
    const rotationChanged = Math.abs(node.rotation() - originalRotationRef.current) > 0.01;
    const rotation = node.rotation();
    setCurrentRotation(rotation);
    setIsRotating(rotationChanged);
    
    const minWidth = calculateMinWidth(element);
    const newWidth = Math.max(minWidth, node.width() * scaleX);
    
    // Update the text dimensions in real-time during resize
    // Reset scale to prevent font size changes
    node.scaleX(1);
    node.scaleY(1);
    node.width(newWidth);
    
    // Sync stroke layer with main text node
    if (strokeRef.current && element.strokeWidth > 0) {
      strokeRef.current.scaleX(1);
      strokeRef.current.scaleY(1);
      strokeRef.current.width(newWidth);
      strokeRef.current.x(node.x());
      strokeRef.current.y(node.y());
      strokeRef.current.rotation(node.rotation());
    }
    
    // Mirror Konva measured height after width change
    if (node.getLayer()) node.getLayer().batchDraw();
    const newHeight = Math.ceil(node.height());
    
    // Also update the background rectangle to match
    if (backgroundRef.current) {
      backgroundRef.current.width(newWidth);
      backgroundRef.current.height(newHeight);
      backgroundRef.current.x(node.x());
      backgroundRef.current.y(node.y());
      backgroundRef.current.rotation(node.rotation());
    }
  }, [element, textRef, strokeRef, backgroundRef]);

  const handleTransformEnd = useCallback((e) => {
    const node = textRef.current;
    
    // Always reset scale to prevent font size changes
    node.scaleX(1);
    node.scaleY(1);
    
    // Sync stroke layer with main text node
    if (strokeRef.current && element.strokeWidth > 0) {
      strokeRef.current.scaleX(1);
      strokeRef.current.scaleY(1);
      strokeRef.current.x(node.x());
      strokeRef.current.y(node.y());
      strokeRef.current.rotation(node.rotation());
    }
    
    // Set transforming to false after a short delay to allow the height to be set
    setTimeout(() => {
      setIsTransforming(false);
    }, 100);

    // Get the final width
    const newWidth = node.width();
    
    // Mirror Konva measured height based on the final width
    if (node.getLayer()) node.getLayer().batchDraw();
    const newHeight = Math.ceil(node.height());

    // Also update the background rectangle to match the final state
    if (backgroundRef.current) {
      backgroundRef.current.width(newWidth);
      backgroundRef.current.height(newHeight);
      backgroundRef.current.x(node.x());
      backgroundRef.current.y(node.y());
      backgroundRef.current.rotation(node.rotation());
    }

    onChange({
      ...element,
      x: node.x(),
      y: node.y(),
      width: newWidth,
      height: newHeight,
      rotation: node.rotation(),
    });
    
    // Reset the stored positions after transform ends
    originalYPositionRef.current = null;
    originalRotationRef.current = null;
    setIsRotating(false);
    setCurrentRotation(node.rotation());
  }, [element, textRef, strokeRef, backgroundRef, onChange]);

  return {
    isTransforming,
    isRotating,
    currentRotation,
    handleTransform,
    handleTransformEnd,
  };
}

