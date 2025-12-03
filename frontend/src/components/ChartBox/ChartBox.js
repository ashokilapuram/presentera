import React, { useEffect, useRef, useState } from "react";
import { Group, Rect, Text, Transformer } from "react-konva";
import { RotationIndicator } from "../shared/RotationIndicator";
import { useChartAnimations } from "./components/ChartAnimations";
import { useChartDataProcessor } from "./components/ChartDataProcessor";
import BarChart from "./components/BarChart";
import LineChart from "./components/LineChart";
import PieChart from "./components/PieChart";
import ChartGrid from "./components/ChartGrid";
import { YAxisValues, XAxisLabels, AxisLines } from "./components/ChartAxes";
import ChartLegend, { calculateLegendHeight } from "./components/ChartLegend";
import ChartTooltip from "./components/ChartTooltip";

const ChartBox = ({ element, isSelected, onSelect, onChange, readOnly = false, onExport }) => {
  const groupRef = useRef(null);
  const trRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [currentRotation, setCurrentRotation] = useState(element.rotation || 0);
  const [isRotating, setIsRotating] = useState(false);
  
  // Expose chart export function
  useEffect(() => {
    if (onExport) {
      onExport(async () => {
        if (groupRef.current) {
          return groupRef.current.toDataURL({ 
            pixelRatio: 2,
            mimeType: 'image/png',
            quality: 1
          });
        }
        return null;
      });
    }
  }, [onExport, element.id, element.width, element.height, element.rotation]);

  const chartW = element.width || 360;
  const chartH = element.height || 240;
  const padding = 35;
  // Add extra top spacing when chart name exists
  // For pie charts, reserve more space for title to prevent overflow
  const titleSpacing = element.chartName 
    ? (element.chartType === "pie" ? 30 : 20)
    : 0;

  // Process chart data
  const {
    seriesData,
    data,
    labels,
    maxVal,
    minVal,
    hasNegativeValues,
    xScale,
    yScale,
    defaultColor,
    barColors,
    sliceColors
  } = useChartDataProcessor(element, chartW, chartH, padding);

  // Handle animations
  const { animationProgress, barAnimations } = useChartAnimations(element, seriesData);

  // ---- Selection transformer ----
  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // ---- Update transformer when element changes ----
  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [element.x, element.y, element.width, element.height, isSelected]);

  // Sync rotation state when element changes
  useEffect(() => {
    setCurrentRotation(element.rotation || 0);
  }, [element.rotation]);

  const handleTransform = () => {
    const node = groupRef.current;
    if (node) {
      const rotation = node.rotation();
      setCurrentRotation(rotation);
      setIsRotating(true);
    }
  };

  const handleTransformEnd = () => {
    const node = groupRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    
    // Use same minimum sizes as transformer bounds
    const minWidth = element.chartType === "pie" ? 140 : 120;
    const minHeight = element.chartType === "pie" ? 140 : 100;
    
    const finalRotation = node.rotation();
    setCurrentRotation(finalRotation);
    setIsRotating(false);
    
    onChange({
      ...element,
      x: node.x(),
      y: node.y(),
      width: Math.max(minWidth, chartW * scaleX),
      height: Math.max(minHeight, chartH * scaleY),
      rotation: finalRotation,
    });
  };

  // Calculate if labels need rotation (for legend positioning)
  const bandWidth = labels.length > 0 ? xScale.bandwidth() : 40;
  const minWidthForHorizontal = 40;
  const minWidthForRotation = 25;
  const needsLabelRotation = bandWidth < minWidthForRotation;
  const useTruncation = !needsLabelRotation && bandWidth < minWidthForHorizontal;
  
  // Estimate if labels will wrap to multiple lines
  const labelFontSize = 12;
  const estimateTextWidth = (text) => {
    return text.length * labelFontSize * 0.6;
  };
  
  const hasMultiLineLabels = labels.some(label => {
    if (needsLabelRotation || useTruncation) return false;
    const estimatedWidth = estimateTextWidth(label);
    return estimatedWidth > bandWidth;
  });
  
  const extraLabelSpace = needsLabelRotation ? 30 : (hasMultiLineLabels ? 20 : 0);

  // Calculate legend height for background wrapping
  const legendHeight = calculateLegendHeight(seriesData, element.chartType, chartW, chartH, padding, labels, xScale);
  // For pie charts with title, background should include title space (title is at top, content offset by titleSpacing)
  // For other charts, title is inside chartH, so don't add extra height
  const backgroundHeight = element.chartType === "pie" && element.chartName
    ? chartH + titleSpacing + legendHeight + extraLabelSpace
    : chartH + legendHeight + extraLabelSpace;

  return (
    <>
      <Group
        ref={groupRef}
        x={element.x}
        y={element.y}
        rotation={element.rotation || 0}
        draggable={!readOnly}
        onClick={(e) => {
          e.cancelBubble = true;
          onSelect?.();
        }}
        onTap={(e) => {
          e.cancelBubble = true;
          onSelect?.();
        }}
        onDragEnd={(e) =>
          onChange({ ...element, x: e.target.x(), y: e.target.y() })
        }
        onTransform={handleTransform}
        onTransformEnd={handleTransformEnd}
      >
        {/* Background - extends to include legend */}
        <Rect
          width={chartW}
          height={backgroundHeight}
          fill={element.backgroundColor || "transparent"}
          stroke="transparent"
          strokeWidth={1.5}
          cornerRadius={8}
        />

        {/* Chart Name */}
        {element.chartName && (
          <Text
            text={element.chartName}
            x={chartW / 2}
            y={8}
            fontSize={Math.max(10, Math.min(18, chartW / 25))}
            fontStyle="bold"
            fill={element.chartNameColor || "#111827"}
            align="center"
            width={chartW}
            offsetX={chartW / 2}
          />
        )}

        {/* Chart Content - Wrapped in Group with offset when title exists */}
        <Group y={titleSpacing}>
          {/* Horizontal grid lines at Y-axis values */}
          <ChartGrid
            chartType={element.chartType}
            chartW={chartW}
            chartH={chartH}
            padding={padding}
            yScale={yScale}
            hasNegativeValues={hasNegativeValues}
            minVal={minVal}
            maxVal={maxVal}
          />

          {/* Axis lines */}
          <AxisLines
            chartType={element.chartType}
            showXAxis={element.showXAxis}
            showYAxis={element.showYAxis}
            chartW={chartW}
            chartH={chartH}
            padding={padding}
            yScale={yScale}
            hasNegativeValues={hasNegativeValues}
          />

          {/* Labels - Render first so they're behind chart elements */}
          {element.chartType !== "pie" && (
            <XAxisLabels
              labels={labels}
              xScale={xScale}
              chartH={chartH}
              padding={padding}
              labelsColor={element.labelsColor}
            />
          )}
          {element.chartType !== "pie" && (
            <YAxisValues
              yScale={yScale}
              hasNegativeValues={hasNegativeValues}
              minVal={minVal}
              maxVal={maxVal}
              yAxisColor={element.yAxisColor}
            />
          )}
          
          {/* Series Legend - Render before chart elements so it's behind them */}
          <ChartLegend
            seriesData={seriesData}
            chartType={element.chartType}
            chartW={chartW}
            chartH={chartH}
            padding={padding}
            labels={labels}
            xScale={xScale}
            labelsColor={element.labelsColor}
          />

          {/* Chart Rendering - Render last so bars/points are on top and can receive mouse events */}
          {element.chartType === "bar" && (
            <BarChart
              seriesData={seriesData}
              labels={labels}
              xScale={xScale}
              yScale={yScale}
              barAnimations={barAnimations}
              defaultColor={defaultColor}
              onBarHover={(data) => setTooltip(data)}
              onBarLeave={() => setTooltip(null)}
            />
          )}
          {element.chartType === "line" && (
            <LineChart
              seriesData={seriesData}
              labels={labels}
              xScale={xScale}
              yScale={yScale}
              animationProgress={animationProgress}
              onPointHover={(data) => setTooltip(data)}
              onPointLeave={() => setTooltip(null)}
            />
          )}
          {element.chartType === "pie" && (
            <PieChart
              data={data}
              labels={labels}
              chartW={chartW}
              chartH={chartH}
              animationProgress={animationProgress}
              sliceColors={sliceColors}
              element={element}
              titleSpacing={titleSpacing}
            />
          )}
          
          {/* Tooltip - Render on top of everything */}
          {tooltip && (element.chartType === "bar" || element.chartType === "line") && (
            <ChartTooltip
              x={tooltip.x}
              y={tooltip.y}
              value={tooltip.value}
              seriesName={tooltip.seriesName}
              visible={!!tooltip}
            />
          )}
        </Group>
      </Group>

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
            // Increased minimum sizes for better appearance
            const minWidth = element.chartType === "pie" ? 140 : 120;
            const minHeight = element.chartType === "pie" ? 140 : 100;
            
            if (newBox.width < minWidth || newBox.height < minHeight) return oldBox;
            return newBox;
          }}
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

export default ChartBox;
