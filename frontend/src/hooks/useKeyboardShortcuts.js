import { useEffect } from 'react';

export const useKeyboardShortcuts = ({
  selectedElement,
  addSlide,
  addTextBox,
  updateSlideElement,
  deleteElement,
  setTextFormatting,
  undo,
  redo,
  isSlideshowActive,
  onCloseSlideshow,
  onToggleFullscreen,
  onStartSlideshow
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't process any shortcuts if slideshow is active (let slideshow component handle it)
      if (isSlideshowActive) {
        return;
      }

      // Handle ESC key for regular fullscreen (not slideshow)
      if (e.key === 'Escape') {
        // If in fullscreen but not slideshow, exit fullscreen
        if (document.fullscreenElement && onToggleFullscreen) {
          e.preventDefault();
          onToggleFullscreen();
          return;
        }
      }

      // Handle F5 to start slideshow
      if (e.key === 'F5') {
        e.preventDefault();
        if (onStartSlideshow) {
          onStartSlideshow();
        }
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            addSlide();
            break;
          case 't':
            e.preventDefault();
            addTextBox();
            break;
          case 'b':
            if (selectedElement) {
              e.preventDefault();
              const newWeight = selectedElement.fontWeight === 'bold' ? 'normal' : 'bold';
              updateSlideElement(selectedElement.id, { fontWeight: newWeight });
              setTextFormatting(prev => ({ ...prev, fontWeight: newWeight }));
            }
            break;
          case 'i':
            if (selectedElement) {
              e.preventDefault();
              const newStyle = selectedElement.fontStyle === 'italic' ? 'normal' : 'italic';
              updateSlideElement(selectedElement.id, { fontStyle: newStyle });
              setTextFormatting(prev => ({ ...prev, fontStyle: newStyle }));
            }
            break;
          case 'u':
            if (selectedElement) {
              e.preventDefault();
              const newDecoration = selectedElement.textDecoration === 'underline' ? 'none' : 'underline';
              updateSlideElement(selectedElement.id, { textDecoration: newDecoration });
              setTextFormatting(prev => ({ ...prev, textDecoration: newDecoration }));
            }
            break;
          case 'z':
            if (!e.shiftKey) {
              e.preventDefault();
              undo();
            } else {
              e.preventDefault();
              redo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          default:
            break;
        }
      }
      
      if (e.key === 'Delete' && selectedElement) {
        // Don't delete element if user is editing text inside a textarea or contentEditable
        const activeElement = document.activeElement;
        const isEditingText = activeElement && (
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.tagName === 'INPUT' ||
          activeElement.isContentEditable
        );
        
        if (!isEditingText) {
          deleteElement(selectedElement.id);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, addSlide, addTextBox, updateSlideElement, deleteElement, setTextFormatting, undo, redo, isSlideshowActive, onCloseSlideshow, onToggleFullscreen, onStartSlideshow]);
};
