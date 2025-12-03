import React from 'react';
import { Transformer } from 'react-konva';
import { calculateMinWidth, calculateMinHeight } from '../utils/transformUtils';

export function TextTransformer({ element, isSelected, isEditing, readOnly, trRef, textRef }) {
  if (!isSelected || isEditing || readOnly) {
    return null;
  }

  return (
    <Transformer
      ref={trRef}
      enabledAnchors={["middle-left", "middle-right"]}
      boundBoxFunc={(oldBox, newBox) => {
        const minWidth = calculateMinWidth(element);
        const currentText = textRef.current?.text() || '';
        const minHeight = calculateMinHeight(element, currentText, newBox.width);
        
        return {
          ...newBox,
          width: Math.max(minWidth, newBox.width),
          height: Math.max(minHeight, newBox.height),
        };
      }}
      keepRatio={false}
    />
  );
}

