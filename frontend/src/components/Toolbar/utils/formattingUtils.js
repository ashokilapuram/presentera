/**
 * Utility functions for text formatting operations
 */

/**
 * Applies formatting to selected text or element
 */
export const applyFormat = (
  property,
  value,
  selectedElement,
  updateSlideElement,
  textFormatting,
  setTextFormatting
) => {
  if (selectedElement && selectedElement.type === 'text') {
    // Check if there's a text selection in the contentEditable element
    const textElement = document.querySelector(`[data-element-id="${selectedElement.id}"]`);
    if (textElement) {
      const selection = window.getSelection();
      const hasSelection = selection && selection.rangeCount > 0 && !selection.getRangeAt(0).collapsed;
      
      if (hasSelection && selection.anchorNode && textElement.contains(selection.anchorNode)) {
        // Apply formatting to selected text
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        
        switch (property) {
          case 'color':
            span.style.color = value;
            break;
          case 'fontSize':
            span.style.fontSize = `${value}px`;
            break;
          case 'fontFamily':
            span.style.fontFamily = value;
            break;
          case 'fontWeight':
            span.style.fontWeight = value;
            break;
          case 'fontStyle':
            span.style.fontStyle = value;
            break;
          case 'textDecoration':
            span.style.textDecoration = value;
            break;
          default:
            break;
        }
        
        const frag = range.extractContents();
        span.appendChild(frag);
        range.insertNode(span);
        
        // Update the element content
        updateSlideElement(selectedElement.id, {
          content: textElement.innerHTML,
          [property]: value
        });
      } else {
        // No text selection, update element properties directly
        updateSlideElement(selectedElement.id, {
          [property]: value
        });
      }
    } else {
      // Fallback: update element properties directly
      updateSlideElement(selectedElement.id, {
        [property]: value
      });
    }
  }

  // Update the formatting state
  const newFormat = { ...textFormatting, [property]: value };
  setTextFormatting(newFormat);
};

/**
 * Toggles text style (bold, italic, underline)
 */
export const toggleStyle = (
  property,
  selectedElement,
  updateSlideElement,
  textFormatting,
  setTextFormatting
) => {
  // Get current value from selected element or formatting state
  const current = selectedElement?.[property] || textFormatting[property];
  let newValue;
  switch (property) {
    case 'fontWeight': newValue = current === 'bold' ? 'normal' : 'bold'; break;
    case 'fontStyle': newValue = current === 'italic' ? 'normal' : 'italic'; break;
    case 'textDecoration': newValue = current === 'underline' ? 'none' : 'underline'; break;
    default: newValue = current;
  }
  
  // For toggle styles, we need to handle text selection differently
  if (selectedElement && selectedElement.type === 'text') {
    const textElement = document.querySelector(`[data-element-id="${selectedElement.id}"]`);
    if (textElement) {
      const selection = window.getSelection();
      const hasSelection = selection && selection.rangeCount > 0 && !selection.getRangeAt(0).collapsed;
      
      if (hasSelection && selection.anchorNode && textElement.contains(selection.anchorNode)) {
        // Apply formatting to selected text using execCommand for toggle styles
        textElement.focus();
        switch (property) {
          case 'fontWeight':
            document.execCommand('bold');
            break;
          case 'fontStyle':
            document.execCommand('italic');
            break;
          case 'textDecoration':
            document.execCommand('underline');
            break;
          default:
            break;
        }
        
        // Update the element content
        updateSlideElement(selectedElement.id, {
          content: textElement.innerHTML,
          [property]: newValue
        });
      } else {
        // No text selection, update element properties directly
        updateSlideElement(selectedElement.id, {
          [property]: newValue
        });
      }
    } else {
      // Fallback: update element properties directly
      updateSlideElement(selectedElement.id, {
        [property]: newValue
      });
    }
  }

  // Update the formatting state
  const newFormat = { ...textFormatting, [property]: newValue };
  setTextFormatting(newFormat);
};

/**
 * Restores text selection
 */
export const restoreSelection = () => {
  const store = window.__PRESENTIFY_SELECTION__;
  if (store && store.element) {
    store.element.focus();
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(store.range);
  }
};

