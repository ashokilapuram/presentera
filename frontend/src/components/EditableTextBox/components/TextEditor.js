import React, { useRef } from 'react';
import { Html } from 'react-konva-utils';
import { normalizeListText, stripListMarkers } from '../utils/textFormatting';
import { hexToRgba } from '../utils/colorUtils';

export function TextEditor({
  element,
  value,
  isEditing,
  readOnly,
  textareaRef,
  textRef,
  setValue,
  userHasInteractedRef,
  handleBlur,
  handleKeyDown,
  forceTransformerRefresh,
  onSelect,
}) {
  if (!isEditing || readOnly) {
    return null;
  }

  const hasBackground = element.backgroundColor && element.backgroundColor !== 'transparent';
  const textOpacity = element.textOpacity !== undefined ? element.textOpacity : 1;
  const textColor = hasBackground 
    ? (textOpacity < 1 ? hexToRgba(element.color, textOpacity) : element.color)
    : (textOpacity < 1 ? hexToRgba(element.color, textOpacity) : element.color);
  const backgroundOpacity = hasBackground ? textOpacity : 1;

  return (
    <Html>
      <textarea
        ref={textareaRef}
        className="editable-textbox-textarea"
        style={{
          position: "absolute",
          top: element.y,
          left: element.x,
          width: element.width,
          minHeight: Math.max(100, Math.ceil(textRef.current?.height?.() || element.height)),
          fontSize: element.fontSize,
          fontFamily: element.fontFamily || "Arial",
          color: textColor,
          fontWeight: element.fontWeight || "normal",
          fontStyle: element.fontStyle || "normal",
          textDecoration: element.textDecoration || "none",
          textAlign: element.textAlign,
          border: element.borderWidth > 0
            ? `${element.borderWidth}px solid ${element.borderColor || "#000000"}`
            : "none !important",
          borderWidth: element.borderWidth > 0 ? `${element.borderWidth}px` : "0px !important",
          borderStyle: element.borderWidth > 0 ? "solid" : "none !important",
          borderColor: element.borderWidth > 0 ? (element.borderColor || "#000000") : "transparent !important",
          background: hasBackground && backgroundOpacity < 1 
            ? hexToRgba(element.backgroundColor, backgroundOpacity) 
            : (element.backgroundColor || "transparent"),
          outline: "none",
          resize: "none",
          overflow: "hidden",
          whiteSpace: "pre-wrap",
          letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 'normal',
          lineHeight: element.lineHeight || 1.2,
          textTransform: element.textTransform || 'none',
          padding: "0px",
          margin: "0px",
          boxSizing: "border-box",
          transform: `rotate(${element.rotation || 0}deg)`,
          transformOrigin: "top left",
        }}
        defaultValue={normalizeListText(value || element.content || "", element.listType || 'none')}
        onInput={(e) => {
          // Mark that user has interacted
          userHasInteractedRef.current = true;
          
          const textarea = e.target;
          // Preserve cursor position before any state updates
          const cursorPos = textarea.selectionStart;
          const cursorEnd = textarea.selectionEnd;
          
          // Auto-apply bullets/numbers if listType is set but current line doesn't have marker
          const listType = element.listType || 'none';
          if (listType === 'bullet' || listType === 'number') {
            const textBeforeCursor = textarea.value.substring(0, cursorPos);
            const lines = textBeforeCursor.split('\n');
            const currentLine = lines[lines.length - 1];
            
            // Check if current line has a marker
            const hasBullet = /^[\u2022•]\s*/.test(currentLine);
            const hasNumber = /^\d+\.\s*/.test(currentLine);
            
            // If no marker but listType is set and line has content (user started typing), add it
            // Only add if the line doesn't already have a marker and has some non-whitespace content
            const lineHasContent = currentLine.trim().length > 0;
            if (lineHasContent && 
                ((listType === 'bullet' && !hasBullet) || 
                 (listType === 'number' && !hasNumber))) {
              const lastNewlineIndex = textBeforeCursor.lastIndexOf('\n');
              const lineStartIndex = lastNewlineIndex + 1;
              const lineContent = currentLine;
              const textAfterCursor = textarea.value.substring(cursorPos);
              
              let newText;
              let newCursorPos;
              
              if (listType === 'bullet') {
                newText = textarea.value.substring(0, lineStartIndex) + '• ' + lineContent + textAfterCursor;
                newCursorPos = cursorPos + 2; // +2 for '• '
              } else if (listType === 'number') {
                // Count existing numbered lines to get the next number
                const allLines = textarea.value.split('\n');
                let lineNumber = 1;
                for (let i = 0; i < lines.length - 1; i++) {
                  const numMatch = allLines[i]?.match(/^(\d+)\.\s*/);
                  if (numMatch) {
                    lineNumber = Math.max(lineNumber, parseInt(numMatch[1]) + 1);
                  }
                }
                newText = textarea.value.substring(0, lineStartIndex) + lineNumber + '. ' + lineContent + textAfterCursor;
                newCursorPos = cursorPos + (lineNumber + '. ').length;
              }
              
              textarea.value = newText;
              setValue(newText);
              // Restore cursor position after state update
              requestAnimationFrame(() => {
                if (textarea === textareaRef.current) {
                  try {
                    textarea.setSelectionRange(newCursorPos, newCursorPos);
                  } catch (err) {
                    // Ignore errors
                  }
                }
              });
              return; // Don't continue with normal input handling
            }
          }
          
          // Auto-resize textarea to fit content
          textarea.style.height = 'auto';
          textarea.style.height = textarea.scrollHeight + 'px';
          
          // Update state value on input to trigger autoResize effect on value change
          // Use a ref to track if we need to restore cursor
          const currentValue = textarea.value;
          setValue(currentValue);
          
          // Restore cursor position after state update completes
          // Use requestAnimationFrame to ensure DOM has updated
          requestAnimationFrame(() => {
            if (textarea === textareaRef.current) {
              try {
                // Restore the exact cursor position
                textarea.setSelectionRange(cursorPos, cursorEnd);
              } catch (err) {
                // Ignore errors (might happen if textarea was unmounted)
              }
            }
          });
        }}
        onFocus={(e) => {
          // Auto-resize on focus to ensure full text is visible
          e.target.style.height = 'auto';
          e.target.style.height = e.target.scrollHeight + 'px';
          
          // Only force cursor to end if user hasn't interacted yet (initial focus from double-click)
          if (!userHasInteractedRef.current) {
            const setCursorToEnd = () => {
              if (userHasInteractedRef.current) return; // Don't force if user has interacted
              const len = e.target.value.length;
              try {
                e.target.setSelectionRange(len, len);
              } catch (err) {
                // Ignore errors
              }
            };
            
            // Set immediately
            setCursorToEnd();
            
            // Set again after a small delay to override browser default
            setTimeout(() => {
              if (!userHasInteractedRef.current) {
                setCursorToEnd();
                setTimeout(() => {
                  if (!userHasInteractedRef.current) {
                    setCursorToEnd();
                  }
                }, 10);
              }
            }, 0);
          }
        }}
        onBlur={(e) => {
          // Centralized blur handler saves content and exits edit mode
          handleBlur();

          // After the textarea is removed and state updates, ensure selection
          // and transformer attachment happen. We don't rely on the stale
          // `isEditing` closure value here — always re-select and refresh
          // the transformer on the next frame.
          requestAnimationFrame(() => {
            if (typeof onSelect === 'function') {
              try {
                onSelect();
              } catch (err) {
                // swallow errors from parent handlers
                console.error('onSelect handler failed after blur:', err);
              }
            }

            // Force the transformer to re-attach and redraw so handles become visible
            try {
              forceTransformerRefresh();
            } catch (err) {
              console.error('forceTransformerRefresh failed after blur:', err);
            }
          });
        }}
        onMouseDown={(e) => {
          // Mark that user has interacted when they click
          userHasInteractedRef.current = true;
        }}
        onKeyDown={(e) => {
          // Mark that user has interacted when they type or use arrow keys
          if (e.key.length === 1 || e.key.startsWith('Arrow') || e.key === 'Home' || e.key === 'End') {
            userHasInteractedRef.current = true;
          }
          if (handleKeyDown) {
            handleKeyDown(e);
          }
        }}
        autoFocus
      />
    </Html>
  );
}

