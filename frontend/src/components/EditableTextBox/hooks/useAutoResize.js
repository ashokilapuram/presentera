import { useEffect, useCallback } from 'react';

export function useAutoResize(element, isEditing, value, textareaRef, textRef, onChange, isTransforming) {
  // Simple auto-resize textarea based on content
  const autoResize = useCallback(() => {
    if (textareaRef.current) {
      // Preserve cursor position during resize
      const cursorPos = textareaRef.current.selectionStart;
      const cursorEnd = textareaRef.current.selectionEnd;
      
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const newHeight = Math.max(element.height, scrollHeight);
      textareaRef.current.style.height = `${newHeight}px`;
      
      // Restore cursor position after resize
      try {
        textareaRef.current.setSelectionRange(cursorPos, cursorEnd);
      } catch (err) {
        // Ignore errors (might happen if textarea is not focused)
      }
    }
  }, [element.height, textareaRef]);

  // Auto-resize when value changes (only when editing)
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      // Preserve cursor position before auto-resize
      const cursorPos = textareaRef.current.selectionStart;
      const cursorEnd = textareaRef.current.selectionEnd;
      
      autoResize();
      
      // Restore cursor position after auto-resize
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          try {
            textareaRef.current.setSelectionRange(cursorPos, cursorEnd);
          } catch (err) {
            // Ignore errors
          }
        }
      });
    }
  }, [value, isEditing, autoResize, textareaRef]);

  // Auto-resize when font properties change (when not editing): mirror Konva height
  useEffect(() => {
    if (isEditing || isTransforming) return;
    if (!textRef.current) return;

    if (textRef.current.getLayer()) textRef.current.getLayer().batchDraw();
    const newHeight = Math.ceil(textRef.current.height());

    if (Math.abs(newHeight - element.height) > 2) {
      onChange({ height: newHeight, __internal: 'autoHeight' });
    }
  }, [element.fontSize, element.fontWeight, element.fontStyle, element.fontFamily, value, element.width, onChange, isEditing, isTransforming, textRef, element.height]);

  return { autoResize };
}

