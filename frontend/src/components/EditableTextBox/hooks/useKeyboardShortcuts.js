import { useCallback } from 'react';

export function useKeyboardShortcuts(element, onChange, handleBlur, handleEscape, setValue) {
  const handleKeyDown = useCallback((e) => {
    // Handle keyboard shortcuts like PowerPoint
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          onChange({ ...element, fontWeight: element.fontWeight === 'bold' ? 'normal' : 'bold' });
          break;
        case 'i':
          e.preventDefault();
          onChange({ ...element, fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic' });
          break;
        case 'u':
          e.preventDefault();
          onChange({ ...element, textDecoration: element.textDecoration === 'underline' ? 'none' : 'underline' });
          break;
        case 'Enter':
          // Ctrl/Meta + Enter finishes editing
          e.preventDefault();
          handleBlur();
          break;
        default:
          break;
      }
    } else if (e.key === 'Escape') {
      // Escape reverts to original content and exits
      e.preventDefault();
      handleEscape();
    } else if (e.key === 'Tab') {
      // Tab key finishes editing
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
      // Handle Enter key for bullets/numbers
      const listType = element.listType || 'none';
      if (listType === 'bullet' || listType === 'number') {
        const textarea = e.target;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        
        // Get the current line
        const textBeforeCursor = text.substring(0, start);
        const textAfterCursor = text.substring(end);
        const lines = textBeforeCursor.split('\n');
        const currentLine = lines[lines.length - 1];
        
        // Check if current line has a bullet or number
        const hasBullet = /^[\u2022•]\s*/.test(currentLine);
        const hasNumber = /^\d+\.\s*/.test(currentLine);
        
        // If current line has a marker, add one to the new line
        if ((listType === 'bullet' && hasBullet) || (listType === 'number' && hasNumber)) {
          e.preventDefault();
          
          // Find where the current line starts in the full text
          const lastNewlineIndex = textBeforeCursor.lastIndexOf('\n');
          const lineStartIndex = lastNewlineIndex + 1;
          
          // Get the marker from current line
          let markerLength = 0;
          if (listType === 'bullet') {
            const bulletMatch = currentLine.match(/^[\u2022•]\s*/);
            markerLength = bulletMatch ? bulletMatch[0].length : 0;
          } else {
            const numberMatch = currentLine.match(/^\d+\.\s*/);
            markerLength = numberMatch ? numberMatch[0].length : 0;
          }
          
          // Calculate position within line content (excluding marker)
          const positionInLine = start - lineStartIndex;
          const positionInContent = Math.max(0, positionInLine - markerLength);
          
          // Get line content without marker
          const lineContent = currentLine.substring(markerLength);
          const contentBeforeCursor = lineContent.substring(0, positionInContent);
          const contentAfterCursor = lineContent.substring(positionInContent);
          
          // Build new text
          const previousLines = lines.slice(0, -1);
          const prefix = previousLines.length > 0 ? previousLines.join('\n') + '\n' : '';
          let newText;
          let newCursorPos;
          
          if (listType === 'bullet') {
            // Build text with bullet on new line
            newText = prefix + '• ' + contentBeforeCursor + '\n• ' + contentAfterCursor + textAfterCursor;
            // Cursor position: after the new bullet and space
            newCursorPos = prefix.length + '• '.length + contentBeforeCursor.length + '\n• '.length;
          } else if (listType === 'number') {
            // Get current number and calculate next
            const numberMatch = currentLine.match(/^(\d+)\.\s*/);
            const currentNumber = numberMatch ? parseInt(numberMatch[1]) : lines.length;
            const nextNumber = currentNumber + 1;
            
            const numberPrefix = currentNumber + '. ';
            const nextNumberPrefix = nextNumber + '. ';
            newText = prefix + numberPrefix + contentBeforeCursor + '\n' + nextNumberPrefix + contentAfterCursor + textAfterCursor;
            // Cursor position: after the new number and space
            newCursorPos = prefix.length + numberPrefix.length + contentBeforeCursor.length + '\n'.length + nextNumberPrefix.length;
          }
          
          // Update textarea value
          textarea.value = newText;
          setValue(newText);
          
          // Set cursor position after the new bullet/number
          setTimeout(() => {
            textarea.setSelectionRange(newCursorPos, newCursorPos);
          }, 0);
        }
        // If no marker, allow default behavior (just newline)
      }
      // If listType is 'none', allow default behavior (just newline)
    }
  }, [element, onChange, handleBlur, handleEscape, setValue]);

  return { handleKeyDown };
}

