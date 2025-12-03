import React, { useEffect, useRef, useState } from "react";
import { Rect, Circle, RegularPolygon, Star, Transformer, Group } from "react-konva";
import { RotationIndicator } from "../shared/RotationIndicator";

// Convert hex to rgba with opacity
const hexToRgba = (hex, opacity = 1) => {
  if (!hex || hex === 'transparent') return `rgba(0, 0, 0, ${opacity})`;
  
  let r, g, b;
  if (hex.startsWith('#')) {
    const colorHex = hex.slice(1);
    if (colorHex.length === 3) {
      r = parseInt(colorHex[0] + colorHex[0], 16);
      g = parseInt(colorHex[1] + colorHex[1], 16);
      b = parseInt(colorHex[2] + colorHex[2], 16);
    } else {
      r = parseInt(colorHex.slice(0, 2), 16);
      g = parseInt(colorHex.slice(2, 4), 16);
      b = parseInt(colorHex.slice(4, 6), 16);
    }
  } else if (hex.startsWith('rgba')) {
    // If already rgba, extract rgb and use new opacity
    const matches = hex.match(/\d+\.?\d*/g);
    if (matches && matches.length >= 3) {
      r = parseInt(matches[0]);
      g = parseInt(matches[1]);
      b = parseInt(matches[2]);
    } else {
      return hex;
    }
  } else if (hex.startsWith('rgb')) {
    const matches = hex.match(/\d+/g);
    if (matches && matches.length >= 3) {
      r = parseInt(matches[0]);
      g = parseInt(matches[1]);
      b = parseInt(matches[2]);
    } else {
      return hex;
    }
  } else {
    return hex;
  }
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const KonvaShape = ({ element, isSelected, onSelect, onChange, readOnly = false }) => {
  const shapeRef = useRef();
  const trRef = useRef();
  const [currentRotation, setCurrentRotation] = useState(element.rotation || 0);
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // Sync rotation state when element changes
  useEffect(() => {
    setCurrentRotation(element.rotation || 0);
  }, [element.rotation]);

  const handleTransform = () => {
    const node = shapeRef.current;
    if (node) {
      const rotation = node.rotation();
      setCurrentRotation(rotation);
      setIsRotating(true);
    }
  };

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);

    const newWidth = Math.max(30, node.width() * scaleX);
    const newHeight = Math.max(30, node.height() * scaleY);

    const finalRotation = node.rotation();
    setCurrentRotation(finalRotation);
    setIsRotating(false);

    onChange({
      ...element,
      x: node.x(),
      y: node.y(),
      width: newWidth,
      height: newHeight,
      rotation: finalRotation,
    });
  };

  // Apply opacity to fill color if specified
  const fillColor = element.fillColor || '#3b82f6';
  const fillOpacity = element.fillOpacity !== undefined ? element.fillOpacity : 1;
  const fillWithOpacity = fillOpacity < 1 ? hexToRgba(fillColor, fillOpacity) : fillColor;

  // Check if shape needs to be wrapped in a Group (non-rectangular shapes)
  const needsGroup = element.shapeType !== "square" && element.shapeType !== "rectangle";

  const groupProps = {
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
    rotation: element.rotation || 0,
    draggable: !readOnly,
    onClick: (e) => {
      e.cancelBubble = true;
      onSelect();
    },
    onDragEnd: (e) =>
      onChange({ ...element, x: e.target.x(), y: e.target.y() }),
    onTransform: handleTransform,
    onTransformEnd: handleTransformEnd,
    ref: shapeRef,
  };

  const shapeProps = {
    fill: fillWithOpacity,
    stroke: element.borderColor,
    strokeWidth: element.borderWidth,
  };

  const renderShape = () => {
    // For rectangles and squares, render directly
    if (element.shapeType === "square" || element.shapeType === "rectangle") {
      return (
        <Rect
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          cornerRadius={element.cornerRadius !== undefined ? element.cornerRadius : 4}
          {...shapeProps}
          rotation={element.rotation || 0}
          draggable={!readOnly}
          onClick={(e) => {
            e.cancelBubble = true;
            onSelect();
          }}
          onDragEnd={(e) =>
            onChange({ ...element, x: e.target.x(), y: e.target.y() })
          }
          onTransform={handleTransform}
          onTransformEnd={handleTransformEnd}
          ref={shapeRef}
        />
      );
    }

    // For other shapes, wrap in Group with bounding box
    // Use a base size and scale the shape to fit the bounding box
    const baseSize = Math.min(element.width, element.height);
    const scaleX = element.width / baseSize;
    const scaleY = element.height / baseSize;
    const centerX = element.width / 2;
    const centerY = element.height / 2;

    let shapeComponent;
    switch (element.shapeType) {
      case "circle":
        shapeComponent = (
          <Circle
            x={centerX}
            y={centerY}
            radius={baseSize / 2}
            scaleX={scaleX}
            scaleY={scaleY}
            {...shapeProps}
          />
        );
        break;
      case "triangle":
        shapeComponent = (
          <RegularPolygon
            x={centerX}
            y={centerY}
            sides={3}
            radius={baseSize / 2}
            scaleX={scaleX}
            scaleY={scaleY}
            {...shapeProps}
          />
        );
        break;
      case "star":
        shapeComponent = (
          <Star
            x={centerX}
            y={centerY}
            numPoints={5}
            innerRadius={baseSize / 4}
            outerRadius={baseSize / 2}
            scaleX={scaleX}
            scaleY={scaleY}
            {...shapeProps}
          />
        );
        break;
      case "pentagon":
        shapeComponent = (
          <RegularPolygon
            x={centerX}
            y={centerY}
            sides={5}
            radius={baseSize / 2}
            scaleX={scaleX}
            scaleY={scaleY}
            {...shapeProps}
          />
        );
        break;
      case "hexagon":
        shapeComponent = (
          <RegularPolygon
            x={centerX}
            y={centerY}
            sides={6}
            radius={baseSize / 2}
            scaleX={scaleX}
            scaleY={scaleY}
            {...shapeProps}
          />
        );
        break;
      default:
        return null;
    }

    return (
      <Group {...groupProps}>
        {/* Invisible rect for bounding box */}
        <Rect
          width={element.width}
          height={element.height}
          visible={false}
        />
        {shapeComponent}
      </Group>
    );
  };

  return (
    <>
      {renderShape()}
      {isSelected && !readOnly && (
        <Transformer
          ref={trRef}
          rotateEnabled
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
            "middle-left",
            "middle-right",
            "bottom-center"
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 30 || newBox.height < 30) return oldBox;
            return newBox;
          }}
          anchorSize={8}
          anchorStroke="#0ea5e9"
          anchorFill="#ffffff"
          anchorStrokeWidth={2}
          borderStroke="#0ea5e9"
          borderStrokeWidth={1}
        />
      )}
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

export default KonvaShape;
