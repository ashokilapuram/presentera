import { useEffect, useState, useRef } from 'react';

/**
 * Custom hook to manage chart animations
 */
export const useChartAnimations = (element, seriesData) => {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [barAnimations, setBarAnimations] = useState({});
  const prevDataRef = useRef({ seriesCount: 0, labelCount: 0 });

  // Individual bar animations
  useEffect(() => {
    if (element.chartType === "bar" && seriesData.length > 0) {
      const newBarAnimations = {};
      seriesData.forEach((series, seriesIndex) => {
        (series.values || []).forEach((value, labelIndex) => {
          const key = `${labelIndex}-${seriesIndex}`;
          const prevValue = barAnimations[key]?.finalValue || 0;
          if (value !== prevValue) {
            newBarAnimations[key] = {
              progress: 0,
              finalValue: value,
              startValue: prevValue
            };
          } else {
            // Keep existing animation state if value hasn't changed
            newBarAnimations[key] = barAnimations[key] || {
              progress: 1,
              finalValue: value,
              startValue: value
            };
          }
        });
      });
      setBarAnimations(newBarAnimations);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element.chartType, seriesData]);

  // Animation (mount + update)
  // For line charts, only animate on mount to prevent flickering during live updates
  useEffect(() => {
    let frame = 0;
    const total = 30;
    const animate = () => {
      frame++;
      setAnimationProgress(frame / total);
      if (frame < total) requestAnimationFrame(animate);
    };
    
    // For line charts, check if this is a significant data change (structure change)
    // Only restart animation if series count or label count changed
    if (element.chartType === 'line') {
      const currentSeriesCount = seriesData.length;
      const currentLabelCount = element.labels?.length || 0;
      const prevSeriesCount = prevDataRef.current.seriesCount;
      const prevLabelCount = prevDataRef.current.labelCount;
      
      // Only animate if structure changed (new series or labels), not just values
      if (currentSeriesCount !== prevSeriesCount || currentLabelCount !== prevLabelCount) {
        prevDataRef.current.seriesCount = currentSeriesCount;
        prevDataRef.current.labelCount = currentLabelCount;
        // Set to 1 immediately to prevent flicker, or animate if it's a new structure
        if (prevSeriesCount === 0 && prevLabelCount === 0) {
          // First mount - animate
          animate();
        } else {
          // Structure change - set to 1 immediately
          setAnimationProgress(1);
        }
      } else {
        // Just value changes - keep progress at 1
        setAnimationProgress(1);
      }
    } else {
      // For bar and pie charts, animate normally
      animate();
    }
  }, [seriesData, element.labels, element.chartType]);

  // Animate individual bars
  useEffect(() => {
    const animateBars = () => {
      setBarAnimations(prev => {
        const updated = { ...prev };
        let hasAnimating = false;
        
        Object.keys(updated).forEach(key => {
          const bar = updated[key];
          if (bar.progress < 1) {
            bar.progress = Math.min(1, bar.progress + 0.05);
            hasAnimating = true;
          }
        });
        
        if (hasAnimating) {
          requestAnimationFrame(animateBars);
        }
        
        return updated;
      });
    };
    
    const hasAnimatingBars = Object.values(barAnimations).some(bar => bar.progress < 1);
    if (hasAnimatingBars) {
      requestAnimationFrame(animateBars);
    }
  }, [barAnimations]);

  return { animationProgress, barAnimations };
};

