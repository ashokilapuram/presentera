import { useEffect, useRef } from 'react';
import Konva from 'konva';

export function useTextAnimation(element, readOnly, textRef, strokeRef, backgroundRef) {
  const animationRef = useRef(null);
  const canvasReadyRef = useRef(false);

  // Handle text animation in slideshow mode
  useEffect(() => {
    if (!readOnly || !textRef.current) return;

    // Ensure cleanup of previous animation
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }

    // Wait for canvas to be ready
    const layer = textRef.current.getLayer();
    if (!layer) return;

    layer.draw(); // Force initial draw
    canvasReadyRef.current = true;

    // Initial position (50px below target position)
    const targetY = element.y;
    textRef.current.y(targetY + 50);
    // Also animate stroke layer if it exists
    if (strokeRef.current && element.strokeWidth > 0) {
      strokeRef.current.y(targetY + 50);
    }
    // Only animate background if it exists
    if (backgroundRef.current && (element.backgroundColor || element.borderWidth > 0)) {
      backgroundRef.current.y(targetY + 50);
    }

    // Create and start the animation
    animationRef.current = new Konva.Animation((frame) => {
      if (!frame) return;

      const progress = Math.min(1, frame.time / 500); // 500ms duration
      const ease = 0.5 - Math.cos(progress * Math.PI) / 2; // Smooth easing
      const currentY = targetY + 50 * (1 - ease);

      textRef.current.y(currentY);
      // Also animate stroke layer if it exists
      if (strokeRef.current && element.strokeWidth > 0) {
        strokeRef.current.y(currentY);
      }
      // Only animate background if it exists and is visible
      if (backgroundRef.current && (element.backgroundColor || element.borderWidth > 0)) {
        backgroundRef.current.y(currentY);
      }

      if (progress >= 1) {
        animationRef.current.stop();
      }
    }, layer);

    animationRef.current.start();

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
      // Reset position on cleanup
      if (textRef.current) {
        textRef.current.y(targetY);
      }
      // Also reset stroke layer if it exists
      if (strokeRef.current && element.strokeWidth > 0) {
        strokeRef.current.y(targetY);
      }
      // Only reset background if it exists and is visible
      if (backgroundRef.current && (element.backgroundColor || element.borderWidth > 0)) {
        backgroundRef.current.y(targetY);
      }
    };
  }, [readOnly, element.y, element.strokeWidth, element.backgroundColor, element.borderWidth, textRef, strokeRef, backgroundRef]);

  return { animationRef, canvasReadyRef };
}

