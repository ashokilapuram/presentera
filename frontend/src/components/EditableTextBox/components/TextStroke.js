import React from 'react';
import { Text } from 'react-konva';
import { processTextForDisplay } from '../utils/textProcessing';

export function TextStroke({ element, value, isEditing, strokeRef }) {
  // Show stroke if strokeWidth > 0 OR if there's a gradient stroke (hollow text effect)
  if ((!element.strokeWidth || element.strokeWidth <= 0) && !element.strokeLinearGradientColorStops) {
    return null;
  }

  const displayText = processTextForDisplay(value || "", element);

  // Prepare gradient stroke properties
  const gradientStrokeProps = {};
  if (element.strokeLinearGradientColorStops && Array.isArray(element.strokeLinearGradientColorStops)) {
    gradientStrokeProps.strokeLinearGradientColorStops = element.strokeLinearGradientColorStops;
    if (element.strokeLinearGradientStartPoint) {
      gradientStrokeProps.strokeLinearGradientStartPoint = element.strokeLinearGradientStartPoint;
    }
    if (element.strokeLinearGradientEndPoint) {
      gradientStrokeProps.strokeLinearGradientEndPoint = element.strokeLinearGradientEndPoint;
    }
  }

  return (
    <Text
      ref={strokeRef}
      text={displayText}
      x={element.x}
      y={element.y}
      width={element.width}
      fontSize={element.fontSize}
      fontFamily={element.fontFamily || "Arial"}
      fontStyle={`${element.fontStyle === 'italic' ? 'italic ' : ''}${element.fontWeight === 'bold' ? 'bold' : 'normal'}`.trim()}
      fill="transparent"
      stroke={element.strokeLinearGradientColorStops ? undefined : element.strokeColor}
      {...gradientStrokeProps}
      strokeWidth={element.strokeLinearGradientColorStops ? (element.strokeWidth || 3) : (element.strokeWidth || 0)}
      textDecoration={element.textDecoration || 'none'}
      align={element.textAlign}
      verticalAlign="top"
      wrap="word"
      ellipsis={false}
      letterSpacing={element.letterSpacing || 0}
      lineHeight={element.lineHeight || 1.2}
      rotation={element.rotation || 0}
      listening={false}
      visible={!isEditing}
    />
  );
}

