import Konva from 'konva';
import * as d3 from 'd3';

/**
 * Renders a chart element to an image using a temporary Konva stage
 * Similar to how gradients are rendered to canvas - works for any slide
 */
export const renderChartToImage = async (element) => {
  try {
    const chartW = element.width || 360;
    const chartH = element.height || 240;
    const padding = 35;
    const titleSpacing = element.chartName 
      ? (element.chartType === "pie" ? 30 : 20)
      : 0;

    // Process chart data first to calculate proper dimensions
    const labels = element.labels || [];
    let seriesData = [];
    if (element.chartType === 'pie') {
      const values = element.values || [];
      const barColors = element.barColors || [];
      const defaultColors = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#84cc16', '#f97316'];
      
      seriesData.push({
        name: 'Series 1',
        values: values,
        barColors: barColors.length > 0 ? barColors : 
          labels.map((_, i) => defaultColors[i % defaultColors.length])
      });
    } else if (element.series && Array.isArray(element.series)) {
      seriesData = element.series;
    } else {
      const values = element.values || [];
      seriesData.push({
        name: 'Series 1',
        values: values,
        barColors: element.barColors || []
      });
      if (element.values2) {
        seriesData.push({
          name: 'Series 2',
          values: element.values2,
          barColors: element.barColors2 || []
        });
      }
    }
    
    // Calculate scales for legend height calculation
    const xScale = d3
      .scaleBand()
      .domain(labels)
      .range([padding, chartW - padding])
      .padding(0.25);

    // Calculate extraLabelSpace (same as ChartBox)
    const bandWidth = labels.length > 0 ? xScale.bandwidth() : 40;
    const minWidthForHorizontal = 40;
    const minWidthForRotation = 25;
    const needsLabelRotation = bandWidth < minWidthForRotation;
    const useTruncation = !needsLabelRotation && bandWidth < minWidthForHorizontal;
    
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

    // Calculate legend height (same as ChartBox)
    let legendHeight = 0;
    if (element.chartType !== 'pie' && seriesData.length > 0) {
      const minItemWidth = 70;
      const itemContentWidth = 10 + 4 + minItemWidth;
      const availableWidth = chartW - (padding * 2);
      const minItemGap = 8;
      const estimatedItemWidth = itemContentWidth + minItemGap;
      const maxItemsInRow = Math.max(1, Math.floor(availableWidth / estimatedItemWidth));
      const itemsPerRow = Math.min(seriesData.length, maxItemsInRow);
      const rows = Math.ceil(seriesData.length / itemsPerRow);
      const rowHeight = 14;
      const marginFromLabels = 20 + extraLabelSpace;
      const marginBottom = 8;
      legendHeight = (rows * rowHeight) + marginFromLabels + marginBottom;
    }

    // Calculate full background height (same as ChartBox)
    const backgroundHeight = element.chartType === "pie" && element.chartName
      ? chartH + titleSpacing + legendHeight + extraLabelSpace
      : element.chartType === "pie"
      ? chartH + legendHeight + extraLabelSpace
      : chartH + legendHeight + extraLabelSpace;

    // Create a temporary container div (off-screen)
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = `${chartW}px`;
    container.style.height = `${backgroundHeight}px`;
    document.body.appendChild(container);

    // Create Konva stage with full background height
    const stage = new Konva.Stage({
      container: container,
      width: chartW,
      height: backgroundHeight,
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    const group = new Konva.Group({
      x: 0,
      y: 0,
      rotation: element.rotation || 0,
    });

    // Calculate max/min values
    let allValues = [];
    seriesData.forEach(s => {
      allValues = [...allValues, ...(s.values || [])];
    });
    const maxVal = d3.max(allValues) || 1;
    const minVal = d3.min(allValues) || 0;
    const hasNegativeValues = minVal < 0;

    const data = seriesData.length > 0 ? seriesData[0].values : [];

    // Create scales (xScale already calculated above, recalculate yScale)
    const yScale = d3
      .scaleLinear()
      .domain(hasNegativeValues ? [minVal, maxVal] : [0, maxVal])
      .range(hasNegativeValues ? [chartH - padding, padding] : [chartH - padding, padding]);

    const defaultColor = element.color || "#0ea5e9";
    const barColors = element.barColors || [];
    const sliceColors = element.chartType === 'pie' 
      ? (barColors.length > 0 ? barColors : labels.map((_, i) => {
          const defaultColors = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#84cc16', '#f97316'];
          return defaultColors[i % defaultColors.length];
        }))
      : [];

    // backgroundHeight already calculated above

    // Background
    const bgRect = new Konva.Rect({
      width: chartW,
      height: backgroundHeight,
      fill: element.backgroundColor || "transparent",
      cornerRadius: 8,
    });
    group.add(bgRect);

    // Chart Name
    if (element.chartName) {
      const nameText = new Konva.Text({
        text: element.chartName,
        x: chartW / 2,
        y: 8,
        fontSize: Math.max(10, Math.min(18, chartW / 25)),
        fontStyle: 'bold',
        fill: element.chartNameColor || "#111827",
        align: 'center',
        width: chartW,
        offsetX: chartW / 2,
      });
      group.add(nameText);
    }

    // Chart content group
    const contentGroup = new Konva.Group({
      y: titleSpacing,
    });

    // Only add grid, axes, and labels for bar and line charts (NOT pie charts)
    if (element.chartType !== 'pie') {
      // Grid lines
      const gridLines = [];
      const gridCount = 5;
      for (let i = 0; i <= gridCount; i++) {
        const value = hasNegativeValues 
          ? minVal + (maxVal - minVal) * (i / gridCount)
          : (maxVal * i) / gridCount;
        const y = yScale(value);
        
        const line = new Konva.Line({
          points: [padding, y, chartW - padding, y],
          stroke: '#e5e7eb',
          strokeWidth: 1,
          dash: i === 0 || i === gridCount ? [] : [5, 5],
        });
        gridLines.push(line);
      }
      gridLines.forEach(line => contentGroup.add(line));

      // Axis lines
      if (element.showXAxis !== false) {
        const xAxisLine = new Konva.Line({
          points: [padding, chartH - padding, chartW - padding, chartH - padding],
          stroke: element.labelsColor || '#6b7280',
          strokeWidth: 1.5,
        });
        contentGroup.add(xAxisLine);
      }

      if (element.showYAxis !== false) {
        const yAxisLine = new Konva.Line({
          points: [padding, padding, padding, chartH - padding],
          stroke: element.yAxisColor || '#6b7280',
          strokeWidth: 1.5,
        });
        contentGroup.add(yAxisLine);
      }

      // X-axis labels - match exact positioning from ChartAxes.js (chartH - padding + 8)
      labels.forEach((label, i) => {
        const x = xScale(label) + xScale.bandwidth() / 2;
        const labelText = new Konva.Text({
          text: label,
          x: x,
          y: chartH - padding + 8,
          fontSize: 12,
          fill: element.labelsColor || '#6b7280',
          align: 'center',
          offsetX: 0,
        });
        contentGroup.add(labelText);
      });

      // Y-axis values - match exact positioning from YAxisValues.js (x: 4, y: yScale(t) - 6)
      // Use d3.ticks for consistent tick generation (4 ticks)
      const tickCount = 4;
      const domain = hasNegativeValues ? [minVal, maxVal] : [0, maxVal];
      const ticks = d3.ticks(domain[0], domain[1], tickCount);
      
      ticks.forEach((tickValue) => {
        const y = yScale(tickValue);
        const valueText = new Konva.Text({
          text: tickValue.toFixed(0),
          x: 4,
          y: y - 6,
          fontSize: 13,
          fill: element.yAxisColor || '#6b7280',
          align: 'left',
          offsetX: 0,
        });
        contentGroup.add(valueText);
      });
    }

    // Render chart based on type
    if (element.chartType === 'bar') {
      const barWidth = xScale.bandwidth() / seriesData.length;
      const gap = barWidth * 0.1;
      const actualBarWidth = barWidth - gap;

      labels.forEach((label, labelIndex) => {
        seriesData.forEach((series, seriesIndex) => {
          const value = series.values[labelIndex] || 0;
          const x = xScale(label) + (seriesIndex * barWidth) + gap / 2;
          const barHeight = Math.abs(yScale(value) - yScale(0));
          const y = value >= 0 ? yScale(value) : yScale(0);
          
          const color = (series.barColors && series.barColors[labelIndex]) || 
                       (series.barColors && series.barColors[0]) || 
                       defaultColor;
          
          const bar = new Konva.Rect({
            x: x,
            y: y,
            width: actualBarWidth,
            height: barHeight,
            fill: color,
            cornerRadius: [4, 4, 0, 0],
          });
          contentGroup.add(bar);
        });
      });
    } else if (element.chartType === 'line') {
      const seriesColors = ['#4472C4', '#ED7D31', '#A5A5A5', '#FFC000', '#5B9BD5', '#70AD47', '#264478', '#9E480E'];
      
      seriesData.forEach((series, seriesIndex) => {
        const points = (series.values || []).map((d, i) => [
          xScale(labels[i]) + xScale.bandwidth() / 2, 
          yScale(d)
        ]);
        const lineColor = (series.barColors && series.barColors[0]) || seriesColors[seriesIndex % seriesColors.length];
        
        // Draw lines
        for (let i = 0; i < points.length - 1; i++) {
          const [x1, y1] = points[i];
          const [x2, y2] = points[i + 1];
          const line = new Konva.Line({
            points: [x1, y1, x2, y2],
            stroke: lineColor,
            strokeWidth: 2.5,
            lineCap: 'round',
            lineJoin: 'round',
          });
          contentGroup.add(line);
        }
        
        // Draw points
        points.forEach(([x, y], i) => {
          const pointColor = (series.barColors && series.barColors[i]) || lineColor;
          const circle = new Konva.Circle({
            x: x,
            y: y,
            radius: 5,
            fill: pointColor,
            stroke: '#ffffff',
            strokeWidth: 2,
          });
          contentGroup.add(circle);
        });
      });
    } else if (element.chartType === 'pie') {
      // Pie charts don't use padding like bar/line charts
      // They need to be centered in the available space
      const topPadding = titleSpacing || 0;
      const sidePadding = 15;
      const bottomPadding = 10; // Padding from bottom to prevent cropping
      const availableWidth = chartW - (sidePadding * 2);
      const availableHeight = chartH - topPadding - bottomPadding;
      
      // Calculate radius to fit in available space (extra 5px for safety margin)
      const radius = Math.min(availableWidth, availableHeight) / 2 - 5;
      
      // Center of the pie chart - account for top padding and center in available height
      const cx = chartW / 2;
      const cy = topPadding + (availableHeight / 2);
      
      const pieGen = d3.pie()(data);
      const arcGen = d3.arc().innerRadius(0).outerRadius(radius);
      
      // Create a group for the pie chart centered at cx, cy
      const pieGroup = new Konva.Group({
        x: cx,
        y: cy,
      });
      
      pieGen.forEach((slice, i) => {
        const path = arcGen(slice);
        const color = sliceColors[i] || defaultColor;
        
        // Use Konva's Path for pie slices
        // Path data from d3.arc() is centered at (0,0), so we position via the group
        const pathShape = new Konva.Path({
          data: path,
          fill: color,
          stroke: '#ffffff',
          strokeWidth: 2,
        });
        pieGroup.add(pathShape);
        
        // Labels - positioned at the centroid of each slice (relative to pie center)
        if (element.showLabels !== false && labels[i]) {
          const [labelX, labelY] = arcGen.centroid(slice);
          const labelText = new Konva.Text({
            text: labels[i],
            x: labelX,
            y: labelY,
            fontSize: 12,
            fill: element.labelsColor || "#1f2937",
            align: 'center',
            offsetX: 0,
            offsetY: 0,
          });
          pieGroup.add(labelText);
        }
      });
      
      contentGroup.add(pieGroup);
    }
    
    // Add legend for bar and line charts (positioned same as ChartLegend component)
    if (element.chartType !== 'pie' && seriesData.length > 0) {
      const seriesColors = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#84cc16', '#f97316'];
      
      const marginFromLabels = 20 + extraLabelSpace;
      const baseLabelY = chartH - padding + 8;
      const rotatedLabelY = baseLabelY + (needsLabelRotation ? 20 : 0);
      const baseLegendY = rotatedLabelY + marginFromLabels;
      
      const minItemWidth = 70;
      const itemContentWidth = 10 + 4 + minItemWidth;
      const availableWidth = chartW - (padding * 2);
      const minItemGap = 8;
      const maxItemGap = 16;
      const estimatedItemWidth = itemContentWidth + minItemGap;
      const maxItemsInRow = Math.max(1, Math.floor(availableWidth / estimatedItemWidth));
      const itemsPerRow = Math.min(seriesData.length, maxItemsInRow);
      const rows = Math.ceil(seriesData.length / itemsPerRow);
      const rowHeight = 14;
      
      const calculateItemGap = (itemsInRow) => {
        if (itemsInRow <= 1) return 0;
        const totalItemsWidth = itemsInRow * itemContentWidth;
        const remainingSpace = availableWidth - totalItemsWidth;
        const gap = remainingSpace / (itemsInRow - 1);
        return Math.max(minItemGap, Math.min(maxItemGap, gap));
      };
      
      seriesData.forEach((series, index) => {
        const seriesColor = (series.barColors && series.barColors[0]) || 
                           seriesColors[index % seriesColors.length];
        const seriesName = series.name || `Series ${index + 1}`;
        
        const row = Math.floor(index / itemsPerRow);
        const col = index % itemsPerRow;
        const legendY = baseLegendY + (row * rowHeight);
        
        const itemsInCurrentRow = row === rows - 1 
          ? seriesData.length - (row * itemsPerRow) 
          : itemsPerRow;
        
        const itemGap = calculateItemGap(itemsInCurrentRow);
        const totalItemsWidth = itemsInCurrentRow * itemContentWidth;
        const totalGapsWidth = (itemsInCurrentRow - 1) * itemGap;
        const totalRowWidth = totalItemsWidth + totalGapsWidth;
        const rowStartX = padding + (availableWidth - totalRowWidth) / 2;
        const legendX = rowStartX + (col * (itemContentWidth + itemGap));
        
        // Legend color box
        const legendRect = new Konva.Rect({
          x: legendX,
          y: legendY,
          width: 10,
          height: 10,
          fill: seriesColor,
          cornerRadius: 2,
        });
        contentGroup.add(legendRect);
        
        // Legend text
        const legendText = new Konva.Text({
          text: seriesName,
          x: legendX + 14,
          y: legendY,
          fontSize: 13,
          fill: element.labelsColor || '#1f2937',
        });
        contentGroup.add(legendText);
      });
    }

    group.add(contentGroup);
    layer.add(group);
    layer.draw();

    // Wait for rendering to complete
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });

    // Export as image
    const dataURL = stage.toDataURL({
      pixelRatio: 2,
      mimeType: 'image/png',
      quality: 1
    });

    // Cleanup
    stage.destroy();
    document.body.removeChild(container);

    return dataURL;
  } catch (error) {
    console.error('Error rendering chart to image:', error);
    return null;
  }
};

