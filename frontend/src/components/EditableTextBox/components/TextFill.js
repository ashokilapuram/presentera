import React from 'react';
import { Text } from 'react-konva';
import { processTextForDisplay } from '../utils/textProcessing';
import { hexToRgba } from '../utils/colorUtils';

export function TextFill({
  element,
  value,
  isEditing,
  readOnly,
  onSelect,
  handleDblClick,
  handleTransform,
  handleTransformEnd,
  textRef,
  strokeRef,
  backgroundRef,
  onChange,
}) {
  const hasBackground = element.backgroundColor && element.backgroundColor !== 'transparent';
  const textOpacity = element.textOpacity !== undefined ? element.textOpacity : 1;
  
  // Determine fill color - use gradient if available, otherwise use solid color
  let fillColor = element.color || '#000000';
  if (textOpacity < 1 && !element.fillLinearGradientColorStops) {
    fillColor = hexToRgba(fillColor, textOpacity);
  } else if (textOpacity < 1 && element.fillLinearGradientColorStops) {
    // For gradients, opacity is handled separately
    fillColor = fillColor;
  }

  const displayText = processTextForDisplay(value || "", element);

  // Prepare gradient properties
  const gradientProps = {};
  if (element.fillLinearGradientColorStops && Array.isArray(element.fillLinearGradientColorStops)) {
    gradientProps.fillLinearGradientColorStops = element.fillLinearGradientColorStops;
    if (element.fillLinearGradientStartPoint) {
      gradientProps.fillLinearGradientStartPoint = element.fillLinearGradientStartPoint;
    }
    if (element.fillLinearGradientEndPoint) {
      gradientProps.fillLinearGradientEndPoint = element.fillLinearGradientEndPoint;
    }
  }

  // Prepare shadow properties
  const shadowProps = {};
  if (element.shadowColor !== undefined) {
    shadowProps.shadowColor = element.shadowColor;
  }
  if (element.shadowBlur !== undefined) {
    shadowProps.shadowBlur = element.shadowBlur;
  }
  if (element.shadowOffsetX !== undefined) {
    shadowProps.shadowOffsetX = element.shadowOffsetX;
  }
  if (element.shadowOffsetY !== undefined) {
    shadowProps.shadowOffsetY = element.shadowOffsetY;
  }
  if (element.shadowOpacity !== undefined) {
    shadowProps.shadowOpacity = element.shadowOpacity;
  }

  // Prepare scale properties
  const scaleProps = {};
  if (element.scaleX !== undefined) {
    scaleProps.scaleX = element.scaleX;
  }
  if (element.scaleY !== undefined) {
    scaleProps.scaleY = element.scaleY;
  }

  return (
    <Text
      ref={textRef}
      text={displayText}
      x={element.x}
      y={element.y}
      width={element.width}
      // let Konva compute height from text + width
      fontSize={element.fontSize}
      fontFamily={element.fontFamily || "Arial"}
      fontStyle={`${element.fontStyle === 'italic' ? 'italic ' : ''}${element.fontWeight === 'bold' ? 'bold' : 'normal'}`.trim()}
      fill={element.fillLinearGradientColorStops ? undefined : fillColor}
      opacity={element.fillLinearGradientColorStops && textOpacity < 1 ? textOpacity : 1}
      {...gradientProps}
      {...shadowProps}
      {...scaleProps}
      textDecoration={element.textDecoration || 'none'}
      align={element.textAlign}
      verticalAlign="top"
      wrap="word"
      ellipsis={false}
      letterSpacing={element.letterSpacing || 0}
      lineHeight={element.lineHeight || 1.2}
      rotation={element.rotation || 0}
      draggable={!readOnly}
      listening={!readOnly}
      onClick={readOnly ? undefined : onSelect}
      onTap={readOnly ? undefined : onSelect}
      onDblClick={readOnly ? undefined : handleDblClick}
      onDblTap={readOnly ? undefined : handleDblClick}
      onDragMove={(e) => {
        // Sync stroke layer with main text node during drag
        if (strokeRef.current && element.strokeWidth > 0) {
          strokeRef.current.x(e.target.x());
          strokeRef.current.y(e.target.y());
          strokeRef.current.rotation(e.target.rotation());
        }
        // Update the background rectangle position and rotation in real-time during drag
        if (backgroundRef.current) {
          backgroundRef.current.x(e.target.x());
          backgroundRef.current.y(e.target.y());
          backgroundRef.current.rotation(e.target.rotation());
        }
      }}
      onDragEnd={(e) => {
        // Sync stroke layer with main text node
        if (strokeRef.current && element.strokeWidth > 0) {
          strokeRef.current.x(e.target.x());
          strokeRef.current.y(e.target.y());
          strokeRef.current.rotation(e.target.rotation());
        }
        // Also update the background rectangle position and rotation
        if (backgroundRef.current) {
          backgroundRef.current.x(e.target.x());
          backgroundRef.current.y(e.target.y());
          backgroundRef.current.rotation(e.target.rotation());
        }
        onChange({ ...element, x: e.target.x(), y: e.target.y(), rotation: e.target.rotation() });
      }}
      onTransform={handleTransform}
      onTransformEnd={handleTransformEnd}
      visible={!isEditing}
    />
  );
}

