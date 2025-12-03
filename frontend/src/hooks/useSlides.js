import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getGlobalBackground } from '../utils/globalBackground';

export const useSlides = () => {
  const [slides, setSlides] = useState([
    {
      id: uuidv4(),
      elements: []
    }
  ]);
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedElement, setSelectedElement] = useState(null);

  const addSlide = useCallback((onSnapshot) => {
    // snapshot BEFORE
    onSnapshot({ slides, selectedElement, currentSlideIndex });

    // Check for global background (from DesignSection)
    let globalBackground = null;
    const bgState = getGlobalBackground();
    if (bgState.isActive && bgState.background) {
      globalBackground = bgState.background;
    }

    const newSlide = {
      id: uuidv4(),
      elements: [],
      ...(globalBackground || {})
    };
    // Insert the new slide after the current slide
    setSlides(prev => {
      const newSlides = [...prev];
      newSlides.splice(currentSlideIndex + 1, 0, newSlide);
      return newSlides;
    });
    // Automatically switch to the new slide
    setCurrentSlideIndex(prev => prev + 1);
    // Deselect any selected element
    setSelectedElement(null);
  }, [slides, selectedElement, currentSlideIndex]);

  const duplicateSlide = useCallback((slideIndex, onSnapshot) => {
    // --- Save current state before action ---
    onSnapshot({ slides, selectedElement, currentSlideIndex });

    const slideToDuplicate = slides[slideIndex];
    const duplicatedSlide = {
      ...slideToDuplicate,
      id: uuidv4(),
      elements: slideToDuplicate.elements.map(element => ({
        ...element,
        id: uuidv4()
      }))
    };

    setSlides(prev => {
      const newSlides = [...prev];
      newSlides.splice(slideIndex + 1, 0, duplicatedSlide);
      return newSlides;
    });

    // make duplicated slide active
    setCurrentSlideIndex(slideIndex + 1);
  }, [slides, selectedElement, currentSlideIndex]);

  const deleteSlide = useCallback((slideIndex, onSnapshot) => {
    // --- Save current state before delete ---
    onSnapshot({ slides, selectedElement, currentSlideIndex });

    // perform delete
    if (slides.length > 1) {
      setSlides(prev => prev.filter((_, index) => index !== slideIndex));
      if (currentSlideIndex >= slideIndex && currentSlideIndex > 0) {
        setCurrentSlideIndex(prev => prev - 1);
      }
    } else {
      // if only one slide → reset to fresh one
      setSlides([{ id: uuidv4(), elements: [] }]);
      setCurrentSlideIndex(0);
    }
  }, [slides, selectedElement, currentSlideIndex]);

  const reorderSlides = useCallback((fromIndex, toIndex, onSnapshot) => {
    // Snapshot BEFORE the reorder for undo functionality
    onSnapshot({ slides, selectedElement, currentSlideIndex });

    // Perform the reorder
    setSlides(prev => {
      const newSlides = [...prev];
      const [movedSlide] = newSlides.splice(fromIndex, 1);
      newSlides.splice(toIndex, 0, movedSlide);
      return newSlides;
    });

    // Make the moved slide active on canvas
    setCurrentSlideIndex(toIndex);
  }, [slides, selectedElement, currentSlideIndex]);

  const updateSlideElement = useCallback((elementId, rawUpdates, onSnapshot) => {
    const { __internal, ...updates } = rawUpdates || {};
    if (!__internal) {
      // one clean snapshot BEFORE applying the change
      onSnapshot({ slides, selectedElement, currentSlideIndex });
    }

    setSlides(prev => prev.map((slide, index) => {
      if (index === currentSlideIndex) {
        return {
          ...slide,
          elements: slide.elements.map(element => 
            element.id === elementId ? { ...element, ...updates } : element
          )
        };
      }
      return slide;
    }));
    setSelectedElement(prev => (prev && prev.id === elementId) ? { ...prev, ...updates } : prev);
  }, [currentSlideIndex, slides, selectedElement]);

  const updateSlide = useCallback((updates, onSnapshot) => {
    // Save current state to undo stack with debouncing
    onSnapshot({ slides, selectedElement, currentSlideIndex });
    
    setSlides(prev => prev.map((slide, index) => {
      if (index === currentSlideIndex) {
        return { ...slide, ...updates };
      }
      return slide;
    }));
  }, [currentSlideIndex, slides, selectedElement]);

  const updateAllSlides = useCallback((updates, onSnapshot) => {
    // Save current state to undo stack
    onSnapshot({ slides, selectedElement, currentSlideIndex });
    
    setSlides(prev => prev.map((slide) => {
      return { ...slide, ...updates };
    }));
  }, [slides, selectedElement, currentSlideIndex]);

  const addTextBox = useCallback((textType = 'content', textFormatting, onSnapshot) => {
    onSnapshot({ slides, selectedElement, currentSlideIndex });

    let fontSize, fontWeight, content, width, height;

    switch (textType) {
      case 'title':
        fontSize = 60;
        fontWeight = 'bold';
        content = 'Click to add title';
        width = 600;
        height = 80;
        break;

      case 'subtitle':
        fontSize = 36;
        fontWeight = 'bold';
        content = 'Click to add subtitle';
        width = 450;
        height = 50;
        break;

      case 'content':
      default:
        fontSize = 24;
        fontWeight = 'normal';
        content = 'Click to add content';
        width = 300;
        height = 40;
        break;
    }

    const newTextBox = {
      id: uuidv4(),
      type: 'text',
      content,
      x: 100,
      y: 100,
      width,
      height,
      fontSize,
      fontWeight,
      fontStyle: textFormatting.fontStyle,
      textDecoration: textFormatting.textDecoration,
      textAlign: textFormatting.textAlign,
      color: '#000000' // Always black for new textboxes
    };

    setSlides(prev => prev.map((slide, index) => {
      if (index === currentSlideIndex) {
        return {
          ...slide,
          elements: [...slide.elements, newTextBox]
        };
      }
      return slide;
    }));
    
    // Automatically select the newly added element
    setSelectedElement(newTextBox);
  }, [slides, selectedElement, currentSlideIndex]);

  const deleteElement = useCallback((elementId, onSnapshot) => {
    onSnapshot({ slides, selectedElement, currentSlideIndex });

    setSlides(prev => prev.map((slide, index) => {
      if (index === currentSlideIndex) {
        return {
          ...slide,
          elements: slide.elements.filter(element => element.id !== elementId)
        };
      }
      return slide;
    }));
    setSelectedElement(null);
  }, [slides, selectedElement, currentSlideIndex]);

  const addShape = useCallback((shapeType, onSnapshot) => {
    onSnapshot({ slides, selectedElement, currentSlideIndex });

    const newShape = {
      id: uuidv4(),
      type: 'shape',
      shapeType: shapeType,
      x: 200,
      y: 200,
      width: 100,
      height: 100,
      fillColor: '#2d9cdb',
      borderColor: 'transparent',
      borderWidth: 0
    };

    setSlides(prev => prev.map((slide, index) => {
      if (index === currentSlideIndex) {
        return {
          ...slide,
          elements: [...slide.elements, newShape]
        };
      }
      return slide;
    }));
    
    // Automatically select the newly added element
    setSelectedElement(newShape);
  }, [slides, selectedElement, currentSlideIndex]);

  const addImage = useCallback((onSnapshot) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          // snapshot BEFORE inserting the image
          onSnapshot({ slides, selectedElement, currentSlideIndex });

          // Load image to get natural dimensions
          const img = new window.Image();
          img.onload = () => {
            // Calculate dimensions preserving aspect ratio
            // Use a max width/height to fit nicely on canvas
            const maxWidth = 400;
            const maxHeight = 300;
            let width = img.naturalWidth;
            let height = img.naturalHeight;

            // Scale down if image is too large
            if (width > maxWidth || height > maxHeight) {
              const widthRatio = maxWidth / width;
              const heightRatio = maxHeight / height;
              const ratio = Math.min(widthRatio, heightRatio);
              width = width * ratio;
              height = height * ratio;
            }

            const newImage = {
              id: uuidv4(),
              type: 'image',
              src: event.target.result,
              x: 150,
              y: 150,
              width: Math.round(width),
              height: Math.round(height)
            };

            setSlides(prev => prev.map((slide, index) => {
              if (index === currentSlideIndex) {
                return {
                  ...slide,
                  elements: [...slide.elements, newImage]
                };
              }
              return slide;
            }));
            
            // Automatically select the newly added element
            setSelectedElement(newImage);
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [slides, selectedElement, currentSlideIndex]);

  const addClipart = useCallback((imageUrl, imageName, onSnapshot) => {
    // snapshot BEFORE inserting the clipart
    onSnapshot({ slides, selectedElement, currentSlideIndex });

    // Load image to get natural dimensions
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Calculate dimensions preserving aspect ratio
      // Use a max width/height to fit nicely on canvas
      const maxWidth = 200;
      const maxHeight = 200;
      let width = img.naturalWidth;
      let height = img.naturalHeight;

      // Scale down if image is too large
      if (width > maxWidth || height > maxHeight) {
        const widthRatio = maxWidth / width;
        const heightRatio = maxHeight / height;
        const ratio = Math.min(widthRatio, heightRatio);
        width = width * ratio;
        height = height * ratio;
      }

      const newImage = {
        id: uuidv4(),
        type: 'image',
        src: imageUrl,
        x: 150,
        y: 150,
        width: Math.round(width),
        height: Math.round(height)
      };

      setSlides(prev => prev.map((slide, index) => {
        if (index === currentSlideIndex) {
          return {
            ...slide,
            elements: [...slide.elements, newImage]
          };
        }
        return slide;
      }));
      
      // Automatically select the newly added element
      setSelectedElement(newImage);
    };
    img.onerror = () => {
      console.error('Failed to load clipart image:', imageUrl);
    };
    img.src = imageUrl;
  }, [slides, selectedElement, currentSlideIndex]);

  const addChart = useCallback((chartType, onSnapshot) => {
    onSnapshot({ slides, selectedElement, currentSlideIndex });

    const screenWidth = window.innerWidth;
    const isSmallScreen = screenWidth >= 1024 && screenWidth <= 1150;

    // Third colorful palette option colors: ['#10b981', '#0ea5e9', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4']
    const thirdColorfulPalette = ['#10b981', '#0ea5e9', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4'];

    let newChart;
    
    if (chartType === 'line') {
      // Line chart with specific initial properties
      newChart = {
        id: uuidv4(),
        type: 'chart',
        chartType: 'line',
        x: 160,
        y: 160,
        width: 360, // Always use bigger size, not small
        height: 220, // Always use bigger size, not small
        labels: ['A', 'B', 'C', 'D'],
        chartName: 'chart name', // Initial chart name
        backgroundColor: '#ffffff', // White initially
        showXAxis: true, // X lines ON
        showYAxis: true, // Y lines ON
        // New series format for line charts
        series: [
          {
            name: 'Series 1',
            values: [12, 16, 9, 18],
            barColors: [12, 16, 9, 18].map(() => thirdColorfulPalette[0]) // First color from third palette
          },
          {
            name: 'Series 2',
            values: [9, 13, 14, 22],
            barColors: [9, 13, 14, 22].map(() => thirdColorfulPalette[1]) // Second color from third palette
          }
        ]
      };
    } else if (chartType === 'bar') {
      // Bar chart with specific initial properties
      newChart = {
        id: uuidv4(),
        type: 'chart',
        chartType: 'bar',
        x: 160,
        y: 160,
        width: 360, // Always use bigger size, not small
        height: 220, // Always use bigger size, not small
        labels: ['A', 'B', 'C', 'D'],
        chartName: 'chart name', // Initial chart name
        backgroundColor: '#ffffff', // White initially
        showXAxis: true, // X line ON
        showYAxis: false, // Y line OFF (not specified, default false)
        // New series format for bar charts
        series: [
          {
            name: 'Series 1',
            values: [12, 25, 9, 18],
            barColors: [12, 25, 9, 18].map(() => thirdColorfulPalette[0]) // First color from third palette for all bars in series 1
          },
          {
            name: 'Series 2',
            values: [9, 22, 15, 13],
            barColors: [9, 22, 15, 13].map(() => thirdColorfulPalette[1]) // Second color from third palette for all bars in series 2
          }
        ]
      };
    } else if (chartType === 'pie') {
      // Pie chart with specific initial properties
      newChart = {
        id: uuidv4(),
        type: 'chart',
        chartType: 'pie',
        x: 160,
        y: 160,
        width: isSmallScreen ? 192 : 360,
        height: isSmallScreen ? 157 : 220,
        labels: ['A', 'B', 'C', 'D', 'E'],
        values: [12, 67, 9, 24, 12],
        chartName: 'chart name', // Initial chart name
        backgroundColor: '#ffffff', // White initially
        color: '#0ea5e9',
        barColors: ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e'] // 5 colors for 5 data points
      };
    } else {
      // Default/fallback for other chart types
      newChart = {
        id: uuidv4(),
        type: 'chart',
        chartType: chartType || 'bar',
        x: 160,
        y: 160,
        width: isSmallScreen ? 192 : 360,
        height: isSmallScreen ? 157 : 220,
        labels: ['A', 'B', 'C', 'D'],
        values: [12, 25, 9, 18],
        color: '#0ea5e9',
        backgroundColor: 'transparent',
        barColors: ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b']
      };
    }

    setSlides(prev => prev.map((slide, index) => {
      if (index === currentSlideIndex) {
        return {
          ...slide,
          elements: [...slide.elements, newChart]
        };
      }
      return slide;
    }));
    
    // Automatically select the newly added element
    setSelectedElement(newChart);
  }, [slides, selectedElement, currentSlideIndex]);

  const addTable = useCallback((onSnapshot, style = 'blue') => {
    onSnapshot({ slides, selectedElement, currentSlideIndex });

    const rows = 4; // 1 header + 3 data rows
    const cols = 4;
    const cellWidth = 100;
    const cellHeight = 40;
    const width = cols * cellWidth;
    const height = rows * cellHeight;

    // Table style definitions
    const tableStyles = {
      default: {
        header: { bgColor: "#ffffff", textColor: "#000000", borderColor: "#FFFFFF", fontWeight: "bold" },
        row1: { bgColor: "#f5f5f5", textColor: "#000000", borderColor: "#FFFFFF" },
        row2: { bgColor: "#e8e8e8", textColor: "#000000", borderColor: "#FFFFFF" },
        row3: { bgColor: "#f5f5f5", textColor: "#000000", borderColor: "#FFFFFF" }
      },
      orange: {
        header: { bgColor: "#FF6B35", textColor: "#ffffff", borderColor: "#FFFFFF", fontWeight: "bold" },
        row1: { bgColor: "#FFE5D9", textColor: "#000000", borderColor: "#FFFFFF" },
        row2: { bgColor: "#FFF0E6", textColor: "#000000", borderColor: "#FFFFFF" },
        row3: { bgColor: "#FFE5D9", textColor: "#000000", borderColor: "#FFFFFF" }
      },
      grey: {
        header: { bgColor: "#6C757D", textColor: "#ffffff", borderColor: "#FFFFFF", fontWeight: "bold" },
        row1: { bgColor: "#E9ECEF", textColor: "#000000", borderColor: "#FFFFFF" },
        row2: { bgColor: "#F5F6F7", textColor: "#000000", borderColor: "#FFFFFF" },
        row3: { bgColor: "#E9ECEF", textColor: "#000000", borderColor: "#FFFFFF" }
      },
      yellow: {
        header: { bgColor: "#FFC000", textColor: "#000000", borderColor: "#FFFFFF", fontWeight: "bold" },
        row1: { bgColor: "#FFF2CC", textColor: "#000000", borderColor: "#FFFFFF" },
        row2: { bgColor: "#FFF9E6", textColor: "#000000", borderColor: "#FFFFFF" },
        row3: { bgColor: "#FFF2CC", textColor: "#000000", borderColor: "#FFFFFF" }
      },
      blue: {
        header: { bgColor: "#2196F3", textColor: "#ffffff", borderColor: "#FFFFFF", fontWeight: "bold" },
        row1: { bgColor: "#BBDEFB", textColor: "#000000", borderColor: "#FFFFFF" },
        row2: { bgColor: "#E3F2FD", textColor: "#000000", borderColor: "#FFFFFF" },
        row3: { bgColor: "#BBDEFB", textColor: "#000000", borderColor: "#FFFFFF" }
      }
    };

    const selectedStyle = tableStyles[style] || tableStyles.default;

    // Initialize table data with style
    const initialData = Array(rows).fill(null).map((_, rowIndex) =>
      Array(cols).fill(null).map(() => {
        let cellStyle;
        if (rowIndex === 0) {
          // Header row
          cellStyle = selectedStyle.header;
        } else if (rowIndex === 1) {
          // First data row
          cellStyle = selectedStyle.row1;
        } else if (rowIndex === 2) {
          // Second data row
          cellStyle = selectedStyle.row2;
        } else {
          // For rows beyond 2, alternate between row1 and row2
          cellStyle = (rowIndex % 2 === 1) ? selectedStyle.row1 : selectedStyle.row2;
        }

        return {
          text: "",
          bgColor: cellStyle.bgColor,
          textColor: cellStyle.textColor,
          borderColor: cellStyle.borderColor,
          borderWidth: 2,
          fontSize: 14,
          fontFamily: "Arial",
          fontWeight: cellStyle.fontWeight || "normal",
          fontStyle: "normal",
          textDecoration: "none",
          align: "left"
        };
      })
    );

    const newTable = {
      id: uuidv4(),
      type: 'table',
      x: 150,
      y: 150,
      width,
      height,
      rows,
      cols,
      cellWidth,
      cellHeight,
      data: initialData,
      tableStyle: style // Store the selected table style
    };

    setSlides(prev => prev.map((slide, index) => {
      if (index === currentSlideIndex) {
        return {
          ...slide,
          elements: [...slide.elements, newTable]
        };
      }
      return slide;
    }));
    
    // Automatically select the newly added element
    setSelectedElement(newTable);
  }, [slides, selectedElement, currentSlideIndex]);

  // Layer reordering for elements
  const bringForward = useCallback((elementId, onSnapshot) => {
    onSnapshot({ slides, selectedElement, currentSlideIndex });

    setSlides(prev => prev.map((slide, i) => {
      if (i === currentSlideIndex) {
        const newElements = [...slide.elements];
        const index = newElements.findIndex(el => el.id === elementId);
        if (index > -1 && index < newElements.length - 1) {
          [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
        }
        return { ...slide, elements: newElements };
      }
      return slide;
    }));
  }, [slides, selectedElement, currentSlideIndex]);

  const sendBackward = useCallback((elementId, onSnapshot) => {
    onSnapshot({ slides, selectedElement, currentSlideIndex });

    setSlides(prev => prev.map((slide, i) => {
      if (i === currentSlideIndex) {
        const newElements = [...slide.elements];
        const index = newElements.findIndex(el => el.id === elementId);
        if (index > 0) {
          [newElements[index - 1], newElements[index]] = [newElements[index], newElements[index - 1]];
        }
        return { ...slide, elements: newElements };
      }
      return slide;
    }));
  }, [slides, selectedElement, currentSlideIndex]);

  const bringToFront = useCallback((elementId, onSnapshot) => {
    onSnapshot({ slides, selectedElement, currentSlideIndex });

    setSlides(prev => prev.map((slide, i) => {
      if (i === currentSlideIndex) {
        const newElements = slide.elements.filter(el => el.id !== elementId);
        const element = slide.elements.find(el => el.id === elementId);
        if (element) newElements.push(element);
        return { ...slide, elements: newElements };
      }
      return slide;
    }));
  }, [slides, selectedElement, currentSlideIndex]);

  const sendToBack = useCallback((elementId, onSnapshot) => {
    onSnapshot({ slides, selectedElement, currentSlideIndex });

    setSlides(prev => prev.map((slide, i) => {
      if (i === currentSlideIndex) {
        const newElements = slide.elements.filter(el => el.id !== elementId);
        const element = slide.elements.find(el => el.id === elementId);
        if (element) newElements.unshift(element);
        return { ...slide, elements: newElements };
      }
      return slide;
    }));
  }, [slides, selectedElement, currentSlideIndex]);

  return {
    // State
    slides,
    setSlides,
    currentSlideIndex,
    setCurrentSlideIndex,
    selectedElement,
    setSelectedElement,
    
    // Actions
    addSlide,
    duplicateSlide,
    deleteSlide,
    reorderSlides,
    updateSlideElement,
    updateSlide,
    updateAllSlides,
    addTextBox,
    deleteElement,
    addShape,
    addImage,
    addClipart,
    addChart,
    addTable,
    
    // Layer ordering
    bringForward,
    bringToFront,
    sendBackward,
    sendToBack
  };
};
