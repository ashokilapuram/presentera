import React from "react";
import { Rect } from "react-konva";

const GradientBackground = ({
  width,
  height,
  type = "linear", // "linear" or "radial"
  colors = ["#7F7FD5", "#86A8E7", "#91EAE4"], // default nice gradient
}) => {
  const stops = [];
  const step = 1 / (colors.length - 1);

  colors.forEach((color, i) => {
    stops.push(i * step, color);
  });

  if (type === "linear") {
    return (
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        listening={false}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: width, y: height }}
        fillLinearGradientColorStops={stops}
      />
    );
  }

  // radial gradient
  return (
    <Rect
      x={0}
      y={0}
      width={width}
      height={height}
      listening={false}
      fillRadialGradientStartPoint={{ x: width / 2, y: height / 2 }}
      fillRadialGradientEndPoint={{ x: width / 2, y: height / 2 }}
      fillRadialGradientStartRadius={0}
      fillRadialGradientEndRadius={Math.max(width, height)}
      fillRadialGradientColorStops={stops}
    />
  );
};

export default GradientBackground;

