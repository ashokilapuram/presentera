import React, { useRef, useEffect, useState } from "react";
import { Image, Transformer } from "react-konva";
import { RotationIndicator } from "../shared/RotationIndicator";

const ImageBox = ({ element, isSelected, onSelect, onChange, readOnly = false }) => {
  const imageRef = useRef();
  const trRef = useRef();
  const [imgObj, setImgObj] = useState(null);
  const [currentRotation, setCurrentRotation] = useState(element.rotation || 0);
  const [isRotating, setIsRotating] = useState(false);

  // Load image
  useEffect(() => {
    const img = new window.Image();
    img.src = element.src;
    img.onload = () => setImgObj(img);
  }, [element.src]);

  // Sync rotation state when element changes
  useEffect(() => {
    setCurrentRotation(element.rotation || 0);
  }, [element.rotation]);

  // Handle selection transformer
  useEffect(() => {
    if (isSelected && trRef.current && imageRef.current && imgObj) {
      trRef.current.nodes([imageRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, imgObj]);

  const handleTransform = () => {
    const rotation = imageRef.current.rotation();
    setCurrentRotation(rotation);
    setIsRotating(true);
  };

  const handleTransformEnd = () => {
    const scaleX = imageRef.current.scaleX();
    const scaleY = imageRef.current.scaleY();
    imageRef.current.scaleX(1);
    imageRef.current.scaleY(1);

    const finalRotation = imageRef.current.rotation();
    setCurrentRotation(finalRotation);
    setIsRotating(false);

    onChange({
      ...element,
      x: imageRef.current.x(),
      y: imageRef.current.y(),
      width: Math.max(40, imageRef.current.width() * scaleX),
      height: Math.max(40, imageRef.current.height() * scaleY),
      rotation: finalRotation,
    });
  };

  if (!imgObj) return null;

  // Always render without corner radius (border radius removed for images)
  return (
    <>
      <Image
        ref={imageRef}
        image={imgObj}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rotation={element.rotation || 0}
        opacity={element.opacity !== undefined ? element.opacity : 1}
        draggable={!readOnly}
        stroke={element.borderColor}
        strokeWidth={element.borderWidth || 0}
        onClick={(e) => {
          e.cancelBubble = true;
          onSelect();
        }}
        onTap={(e) => {
          e.cancelBubble = true;
          onSelect();
        }}
        onDragEnd={(e) =>
          onChange({ ...element, x: e.target.x(), y: e.target.y() })
        }
        onTransform={handleTransform}
        onTransformEnd={handleTransformEnd}
        shadowBlur={2}
      />
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
            if (newBox.width < 40 || newBox.height < 40) return oldBox;
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

export default ImageBox;
