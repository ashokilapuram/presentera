import React, { useRef } from "react";

// Components
import { TextBackground } from "./components/TextBackground";
import { TextStroke } from "./components/TextStroke";
import { TextFill } from "./components/TextFill";
import { TextTransformer } from "./components/TextTransformer";
import { TextEditor } from "./components/TextEditor";
import { RotationIndicator } from "../shared/RotationIndicator";

// Hooks
import { useTextEditing } from "./hooks/useTextEditing";
import { useTextAnimation } from "./hooks/useTextAnimation";
import { useTextTransform } from "./hooks/useTextTransform";
import { useAutoResize } from "./hooks/useAutoResize";
import { useTransformer } from "./hooks/useTransformer";
import { useCursorPosition } from "./hooks/useCursorPosition";
import { useTextSync } from "./hooks/useTextSync";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

const EditableTextBox = ({ element, isSelected, onSelect, onChange, readOnly = false }) => {
  const textRef = useRef();
  const strokeRef = useRef();
  const backgroundRef = useRef();

  // Text editing state and handlers
  const {
    isEditing,
    value,
    setValue,
    textareaRef,
    editingLockRef,
    userHasInteractedRef,
    handleBlur,
    handleDblClick,
    handleEscape,
  } = useTextEditing(element, onChange, readOnly, isSelected);

  // Transformer management
  const { trRef, forceTransformerRefresh } = useTransformer(isSelected, textRef);

  // Text transform handlers
  const { isTransforming, isRotating, currentRotation, handleTransform, handleTransformEnd } = useTextTransform(
    element,
    textRef,
    strokeRef,
    backgroundRef,
    onChange
  );

  // Auto-resize functionality
  useAutoResize(element, isEditing, value, textareaRef, textRef, onChange, isTransforming);

  // Cursor position management
  useCursorPosition(isEditing, textareaRef, userHasInteractedRef);

  // Text animation in slideshow mode
  useTextAnimation(element, readOnly, textRef, strokeRef, backgroundRef);

  // Text sync and transformer refresh
  useTextSync(element, isEditing, isSelected, forceTransformerRefresh);

  // Keyboard shortcuts
  const { handleKeyDown } = useKeyboardShortcuts(
    element,
    onChange,
    handleBlur,
    handleEscape,
    setValue
  );

  return (
    <>
      <TextBackground
        element={element}
        isEditing={isEditing}
        backgroundRef={backgroundRef}
      />

      <TextStroke
        element={element}
        value={value}
        isEditing={isEditing}
        strokeRef={strokeRef}
      />

      <TextFill
        element={element}
        value={value}
        isEditing={isEditing}
        readOnly={readOnly}
        onSelect={onSelect}
        handleDblClick={handleDblClick}
        handleTransform={handleTransform}
        handleTransformEnd={handleTransformEnd}
        textRef={textRef}
        strokeRef={strokeRef}
        backgroundRef={backgroundRef}
        onChange={onChange}
      />

      <TextTransformer
        element={element}
        isSelected={isSelected}
        isEditing={isEditing}
        readOnly={readOnly}
        trRef={trRef}
        textRef={textRef}
      />

      <TextEditor
        element={element}
        value={value}
        isEditing={isEditing}
        readOnly={readOnly}
        textareaRef={textareaRef}
        textRef={textRef}
        setValue={setValue}
        userHasInteractedRef={userHasInteractedRef}
        handleBlur={handleBlur}
        handleKeyDown={handleKeyDown}
        forceTransformerRefresh={forceTransformerRefresh}
        onSelect={onSelect}
      />

      {isSelected && isRotating && (
        <RotationIndicator
          rotation={currentRotation}
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          isVisible={isRotating}
        />
      )}
    </>
  );
};

export default EditableTextBox;
