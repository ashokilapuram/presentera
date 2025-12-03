import React from 'react';
import { Text, Rect } from 'react-konva';

/**
 * RotationIndicator - Displays the rotation angle in degrees (0-360) during rotation
 * @param {Object} props
 * @param {number} props.rotation - Current rotation in degrees
 * @param {number} props.x - X position of the element
 * @param {number} props.y - Y position of the element
 * @param {number} props.width - Width of the element
 * @param {number} props.height - Height of the element
 * @param {boolean} props.isVisible - Whether to show the indicator
 */
export function RotationIndicator({ rotation, x, y, width, height, isVisible }) {
  if (!isVisible) return null;

  // Normalize rotation to 0-360 degrees
  const normalizedRotation = ((rotation % 360) + 360) % 360;
  const rotationText = `${Math.round(normalizedRotation)}°`;

  // Position the indicator above the element, centered horizontally
  const indicatorX = x + width / 2;
  const indicatorY = y - 35; // 35 pixels above the element
  
  // Approximate text width (rough estimate: ~8px per character)
  const textWidth = rotationText.length * 8;
  const textHeight = 18;
  const padding = 8;
  const bgWidth = textWidth + padding * 2;
  const bgHeight = textHeight + padding * 2;

  return (
    <>
      {/* Background rectangle for better visibility */}
      <Rect
        x={indicatorX - bgWidth / 2}
        y={indicatorY - bgHeight / 2}
        width={bgWidth}
        height={bgHeight}
        fill="rgba(0, 0, 0, 0.7)"
        cornerRadius={4}
      />
      {/* Rotation text */}
      <Text
        x={indicatorX}
        y={indicatorY}
        text={rotationText}
        fontSize={14}
        fontFamily="Arial"
        fontStyle="bold"
        fill="#ffffff"
        align="center"
        offsetX={textWidth / 2}
        offsetY={textHeight / 2}
      />
    </>
  );
}

