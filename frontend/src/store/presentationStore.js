import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

const usePresentationStore = create((set, get) => ({
  // State
  slides: [
    {
      id: uuidv4(),
      elements: []
    }
  ],
  currentSlideIndex: 0,
  selectedElement: null,
  editingElement: null,
  textFormatting: {
    fontSize: 16,
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    textAlign: 'left',
    color: '#000000',
    fontFamily: 'Inter'
  },
  isDarkMode: false,
  undoStack: [],
  redoStack: [],

  // Actions
  setCurrentSlideIndex: (index) => set({ currentSlideIndex: index }),
  
  setSelectedElement: (element) => set({ selectedElement: element }),
  
  setEditingElement: (element) => set({ editingElement: element }),
  
  setTextFormatting: (formatting) => set({ textFormatting: formatting }),
  
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  
  addSlide: () => {
    const newSlide = {
      id: uuidv4(),
      elements: []
    };
    set((state) => ({
      slides: [...state.slides, newSlide],
      undoStack: [...state.undoStack, { slides: state.slides, selectedElement: state.selectedElement }],
      redoStack: []
    }));
  },
  
  deleteSlide: (slideIndex) => {
    set((state) => {
      if (state.slides.length > 1) {
        const newSlides = state.slides.filter((_, index) => index !== slideIndex);
        const newCurrentIndex = state.currentSlideIndex >= slideIndex && state.currentSlideIndex > 0 
          ? state.currentSlideIndex - 1 
          : state.currentSlideIndex;
        return {
          slides: newSlides,
          currentSlideIndex: newCurrentIndex,
          undoStack: [...state.undoStack, { slides: state.slides, selectedElement: state.selectedElement }],
          redoStack: []
        };
      }
      return state;
    });
  },
  
  addTextBox: () => {
    const state = get();
    const newTextBox = {
      id: uuidv4(),
      type: 'text',
      content: 'Click to edit text',
      x: 100,
      y: 100,
      width: 200,
      height: 50,
      fontSize: state.textFormatting.fontSize,
      fontWeight: state.textFormatting.fontWeight,
      fontStyle: state.textFormatting.fontStyle,
      textDecoration: state.textFormatting.textDecoration,
      textAlign: state.textFormatting.textAlign,
      color: '#000000', // Always black for new textboxes
      fontFamily: state.textFormatting.fontFamily
    };

    set((state) => ({
      slides: state.slides.map((slide, index) => {
        if (index === state.currentSlideIndex) {
          return {
            ...slide,
            elements: [...slide.elements, newTextBox]
          };
        }
        return slide;
      }),
      undoStack: [...state.undoStack, { slides: state.slides, selectedElement: state.selectedElement }],
      redoStack: []
    }));
  },
  
  updateSlideElement: (elementId, updates) => {
    set((state) => ({
      slides: state.slides.map((slide, index) => {
        if (index === state.currentSlideIndex) {
          return {
            ...slide,
            elements: slide.elements.map(element => 
              element.id === elementId ? { ...element, ...updates } : element
            )
          };
        }
        return slide;
      }),
      selectedElement: state.selectedElement && state.selectedElement.id === elementId 
        ? { ...state.selectedElement, ...updates } 
        : state.selectedElement,
      undoStack: [...state.undoStack, { slides: state.slides, selectedElement: state.selectedElement }],
      redoStack: []
    }));
  },
  
  updateSlide: (updates) => {
    set((state) => ({
      slides: state.slides.map((slide, index) => {
        if (index === state.currentSlideIndex) {
          return { ...slide, ...updates };
        }
        return slide;
      }),
      undoStack: [...state.undoStack, { slides: state.slides, selectedElement: state.selectedElement }],
      redoStack: []
    }));
  },
  
  deleteElement: (elementId) => {
    set((state) => ({
      slides: state.slides.map((slide, index) => {
        if (index === state.currentSlideIndex) {
          return {
            ...slide,
            elements: slide.elements.filter(element => element.id !== elementId)
          };
        }
        return slide;
      }),
      selectedElement: state.selectedElement?.id === elementId ? null : state.selectedElement,
      editingElement: state.editingElement?.id === elementId ? null : state.editingElement,
      undoStack: [...state.undoStack, { slides: state.slides, selectedElement: state.selectedElement }],
      redoStack: []
    }));
  },
  
  undo: () => {
    const state = get();
    if (state.undoStack.length > 0) {
      const lastState = state.undoStack[state.undoStack.length - 1];
      set({
        slides: lastState.slides,
        selectedElement: lastState.selectedElement,
        redoStack: [...state.redoStack, { slides: state.slides, selectedElement: state.selectedElement }],
        undoStack: state.undoStack.slice(0, -1)
      });
    }
  },
  
  redo: () => {
    const state = get();
    if (state.redoStack.length > 0) {
      const nextState = state.redoStack[state.redoStack.length - 1];
      set({
        slides: nextState.slides,
        selectedElement: nextState.selectedElement,
        undoStack: [...state.undoStack, { slides: state.slides, selectedElement: state.selectedElement }],
        redoStack: state.redoStack.slice(0, -1)
      });
    }
  },
  
  // Computed values
  getCurrentSlide: () => {
    const state = get();
    return state.slides[state.currentSlideIndex];
  },
  
  canUndo: () => {
    const state = get();
    return state.undoStack.length > 0;
  },
  
  canRedo: () => {
    const state = get();
    return state.redoStack.length > 0;
  }
}));

export default usePresentationStore;
