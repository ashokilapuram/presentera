import { useState, useRef, useEffect, useCallback } from 'react';
import { stripListMarkers } from '../utils/textFormatting';
import { normalizeListText } from '../utils/textFormatting';

export function useTextEditing(element, onChange, readOnly, isSelected) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(element.content || "");
  const textareaRef = useRef();
  const editingLockRef = useRef(false);
  const lastFormattedListTypeRef = useRef(null);
  const userHasInteractedRef = useRef(false);

  // Keep value synced with slide element, but NOT while editing
  useEffect(() => {
    // Prevent overwriting user's typing
    if (editingLockRef.current) return;

    if (!isEditing && value !== element.content) {
      setValue(element.content || "");
    }
  }, [element.content, isEditing, value]);

  // Auto-start editing for new textboxes
  useEffect(() => {
    if (element.content === 'Click to edit text' && isSelected) {
      setIsEditing(true);
      // don't force setValue(''); keep existing content so caret logic stays stable
    }
  }, [element.content, isSelected]);

  // When you enter editing mode - format content to show bullets/numbers matching display
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const currentListType = element.listType || 'none';
      // Format when entering edit mode or when listType changes during editing
      if (lastFormattedListTypeRef.current !== currentListType) {
        // Format the current value to show bullets/numbers in edit mode to match display
        const formattedValue = normalizeListText(value || element.content || "", currentListType);
        
        // Update textarea directly to show formatted content (only if different)
        // Use requestAnimationFrame to ensure this happens after initial render and cursor positioning
        requestAnimationFrame(() => {
          if (textareaRef.current && formattedValue !== textareaRef.current.value) {
            textareaRef.current.value = formattedValue;
            lastFormattedListTypeRef.current = currentListType;
          }
        });
      }
    } else if (!isEditing) {
      // Reset tracking when exiting edit mode
      lastFormattedListTypeRef.current = null;
    }
  }, [isEditing, element.listType, value, element.content]);

  const handleBlur = useCallback(() => {
    // Strip markers before saving
    const contentToSave = stripListMarkers(textareaRef.current?.value || value);
    // Update local value state immediately to prevent flicker when switching from textarea to Text
    setValue(contentToSave);
    // Set editing lock to prevent value sync effect from overwriting during transition
    editingLockRef.current = true;
    setIsEditing(false);
    // Reset user interaction flag when exiting edit mode
    userHasInteractedRef.current = false;
    onChange({ ...element, content: contentToSave });
    // Release lock after a brief delay to allow parent update to complete
    setTimeout(() => {
      editingLockRef.current = false;
    }, 0);
  }, [value, element, onChange]);

  const handleEscape = useCallback(() => {
    // Escape reverts to original content and exits
    setIsEditing(false);
    setValue(element.content || "");
  }, [element.content]);

  const handleDblClick = useCallback((e) => {
    // Don't allow editing in read-only mode (e.g., slideshow)
    if (readOnly) {
      e.cancelBubble = true;
      if (e.evt) {
        e.evt.stopPropagation();
      }
      return;
    }
    // Prevent default double-click text selection
    if (e.evt) {
      e.evt.preventDefault();
    }
    // Reset user interaction flag when entering edit mode via double-click
    userHasInteractedRef.current = false;
    // This is the core fix: simply set the state
    setIsEditing(true);
  }, [readOnly]);

  return {
    isEditing,
    value,
    setValue,
    textareaRef,
    editingLockRef,
    userHasInteractedRef,
    handleBlur,
    handleDblClick,
    handleEscape,
  };
}

