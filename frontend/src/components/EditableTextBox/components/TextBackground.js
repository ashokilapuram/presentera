import React from 'react';
import { Rect } from 'react-konva';
import { hexToRgba } from '../utils/colorUtils';

export function TextBackground({ element, isEditing, backgroundRef }) {
  const hasBackground = element.backgroundColor && element.backgroundColor !== 'transparent';
  const textOpacity = element.textOpacity !== undefined ? element.textOpacity : 1;
  const backgroundOpacity = hasBackground ? textOpacity : 1;

  if (!(element.backgroundColor || element.borderWidth > 0)) {
    return null;
  }

  return (
    <Rect
      ref={backgroundRef}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      fill={hasBackground && backgroundOpacity < 1 
        ? hexToRgba(element.backgroundColor, backgroundOpacity) 
        : (element.backgroundColor || 'transparent')}
      stroke={element.borderColor || 'transparent'}
      strokeWidth={element.borderWidth || 0}
      rotation={element.rotation || 0}
      visible={!isEditing}
    />
  );
}

