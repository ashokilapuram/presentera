import { useEffect, useRef } from 'react';

export function useCursorPosition(isEditing, textareaRef, userHasInteractedRef) {
  // When you enter editing mode - handle focus and cursor
  useEffect(() => {
    if (isEditing && textareaRef.current && !userHasInteractedRef.current) {
      const ta = textareaRef.current;
      
      // Only set cursor to end if user hasn't interacted yet (i.e., just entered edit mode)
      const setCursorToEnd = () => {
        if (userHasInteractedRef.current) return; // Don't force if user has interacted
        const len = ta.value.length;
        try {
          // Set selection range to the end to force cursor position
          ta.setSelectionRange(len, len);
        } catch (e) {
          // In case setSelectionRange fails in some environments
          console.error("Failed to set selection range:", e);
        }
      };
      
      // Set cursor position first, then focus
      setCursorToEnd();
      ta.focus({ preventScroll: true });
      
      // Try again after focus to ensure it sticks (but only if user hasn't interacted)
      requestAnimationFrame(() => {
        if (!userHasInteractedRef.current) {
          setCursorToEnd();
          // Try multiple times to override browser default behavior
          setTimeout(() => {
            if (!userHasInteractedRef.current) {
              setCursorToEnd();
              setTimeout(() => {
                if (!userHasInteractedRef.current) {
                  setCursorToEnd();
                }
              }, 20);
            }
          }, 10);
        }
      });
    }
  }, [isEditing, textareaRef, userHasInteractedRef]);
}

