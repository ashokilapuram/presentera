import { useState, useEffect } from 'react';
import { convertElementToSeries } from '../utils/dataProcessing';

/**
 * Custom hook to initialize chart data from element
 */
export const useDataInitialization = (isOpen, element) => {
  const [labels, setLabels] = useState([]);
  const [series, setSeries] = useState([]);

  useEffect(() => {
    if (isOpen && element) {
      // Initialize state from element
      const { labels: labelsData, series: seriesData } = convertElementToSeries(element);
      setLabels(labelsData);
      setSeries(seriesData);
    }
  }, [isOpen, element]);

  return {
    labels,
    series,
    setLabels,
    setSeries
  };
};

