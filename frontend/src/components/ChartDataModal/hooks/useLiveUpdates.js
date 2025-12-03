import { useEffect, useRef } from 'react';
import { padChartData } from '../utils/dataProcessing';

/**
 * Custom hook to handle live updates for bar and line charts
 */
export const useLiveUpdates = (isOpen, element, labels, series, onSave) => {
  const updateTimeoutRef = useRef(null);
  const isInitialLoadRef = useRef(true);
  const onSaveRef = useRef(onSave);
  const initializedRef = useRef(false);
  const lastSavedDataRef = useRef(null);

  // Keep onSave ref up to date
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  // Reset when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Reset flags when modal opens
      isInitialLoadRef.current = true;
      initializedRef.current = false;
      lastSavedDataRef.current = null;
    } else {
      // Cleanup timeout when modal closes
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
      // Reset flags when modal closes
      isInitialLoadRef.current = true;
      initializedRef.current = false;
      lastSavedDataRef.current = null;
    }
  }, [isOpen]);

  // Mark as initialized once we have data
  useEffect(() => {
    if (isOpen && element && labels.length > 0 && series.length > 0) {
      if (!initializedRef.current) {
        // Store the initial data to compare against later
        const initialData = padChartData(labels, series, element.chartType, element);
        lastSavedDataRef.current = JSON.stringify(initialData);
        initializedRef.current = true;
        // Keep isInitialLoadRef true until first actual change
        isInitialLoadRef.current = true;
      }
    }
  }, [isOpen, element, labels, series]);

  // Live updates: automatically save changes as user edits (for bar and line charts only)
  useEffect(() => {
    // Skip if modal not open, no element, or no data
    if (!isOpen || !element || labels.length === 0 || series.length === 0) {
      return;
    }
    
    // Only for bar and line charts (pie charts excluded)
    if (element.chartType === 'pie') {
      return;
    }
    
    // Skip if not yet initialized (wait for initial data to be set)
    if (!initializedRef.current) {
      return;
    }
    
    // Skip first change (initial data load) - wait for actual user edit
    if (isInitialLoadRef.current) {
      // Compare current data with last saved to see if it's actually different
      const currentData = padChartData(labels, series, element.chartType, element);
      const currentDataString = JSON.stringify(currentData);
      
      // If data hasn't changed from initial load, don't save
      if (currentDataString === lastSavedDataRef.current) {
        return;
      }
      
      // Data has changed - this is the first real edit
      isInitialLoadRef.current = false;
    }
    
    // Compare with last saved data to avoid unnecessary saves
    const currentData = padChartData(labels, series, element.chartType, element);
    const currentDataString = JSON.stringify(currentData);
    
    // If data hasn't changed, don't save
    if (currentDataString === lastSavedDataRef.current) {
      return;
    }
    
    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    // Debounce: wait 300ms after last change
    updateTimeoutRef.current = setTimeout(() => {
      const finalData = padChartData(labels, series, element.chartType, element);
      const finalDataString = JSON.stringify(finalData);
      
      // Update last saved data
      lastSavedDataRef.current = finalDataString;
      
      // Send live update (without closing modal) - use ref to avoid stale closure
      if (onSaveRef.current) {
        onSaveRef.current(finalData, { isLive: true });
      }
    }, 300);
    
    // Cleanup
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [labels, series, isOpen, element]);
};

