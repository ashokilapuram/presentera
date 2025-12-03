import { useCallback } from 'react';
import { downloadPresentation } from '../utils/downloadPresentation';

export const useFileManager = () => {
  const handleDownloadPresentation = useCallback(async (slides, currentSlideIndex, chartExporters = {}) => {
    try {
      await downloadPresentation(slides, currentSlideIndex, chartExporters);
    } catch (error) {
      console.error('Error downloading presentation:', error);
      alert('Error downloading presentation. Please try again.');
    }
  }, []);

  return {
    handleDownloadPresentation
  };
};
