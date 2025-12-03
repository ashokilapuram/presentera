import React, { useEffect, useRef } from 'react';
import { Shape } from 'react-konva';

/**
 * Custom Konva path component for D3 arc strings
 */
const PathLike = ({ pathData, fill, x, y }) => {
  const shapeRef = useRef();
  useEffect(() => {
    if (shapeRef.current) shapeRef.current.getLayer()?.batchDraw();
  }, [pathData]);
  return (
    <React.Fragment>
      <Shape
        ref={shapeRef}
        sceneFunc={(context, shape) => {
          const path = new Path2D(pathData);
          context.fillStyle = fill;
          context.fill(path);
          context.closePath();
        }}
        x={x}
        y={y}
      />
    </React.Fragment>
  );
};

export default PathLike;

