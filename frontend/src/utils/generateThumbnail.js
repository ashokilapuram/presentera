import Konva from 'konva';
import { renderChartToImage } from './renderChartToImage';

/**
 * Generates a thumbnail for a slide by rendering it to a Konva stage
 * @param {Object} slide - The slide object to generate thumbnail for
 * @returns {Promise<string>} - Promise that resolves to data URL of thumbnail
 */
export const generateSlideThumbnail = async (slide) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create a temporary container (hidden)
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = '1024px';
      container.style.height = '576px';
      document.body.appendChild(container);

      // Create Konva stage
      const stage = new Konva.Stage({
        container: container,
        width: 1024,
        height: 576,
      });

      const layer = new Konva.Layer();
      stage.add(layer);

      // Render background
      if (slide.backgroundImage) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((imgResolve, imgReject) => {
          img.onload = () => {
            const konvaImg = new Konva.Image({
              x: 0,
              y: 0,
              width: 1024,
              height: 576,
              image: img,
              listening: false,
            });
            layer.add(konvaImg);
            imgResolve();
          };
          img.onerror = imgReject;
          img.src = slide.backgroundImage;
        });
      } else if (slide.backgroundGradient) {
        const gradientType = slide.backgroundGradient.type || 'linear';
        const colors = slide.backgroundGradient.colors || ['#ffffff'];
        
        // Build color stops array (flat array: [stop1, color1, stop2, color2, ...])
        const colorStops = [];
        colors.forEach((color, i) => {
          const step = colors.length > 1 ? i / (colors.length - 1) : 0;
          colorStops.push(step, color);
        });
        
        const rect = new Konva.Rect({
          x: 0,
          y: 0,
          width: 1024,
          height: 576,
          listening: false,
        });

        if (gradientType === 'radial') {
          rect.fillRadialGradientStartPoint({ x: 512, y: 288 });
          rect.fillRadialGradientEndPoint({ x: 512, y: 288 });
          rect.fillRadialGradientStartRadius(0);
          rect.fillRadialGradientEndRadius(Math.max(1024, 576));
          rect.fillRadialGradientColorStops(colorStops);
        } else {
          rect.fillLinearGradientStartPoint({ x: 0, y: 0 });
          rect.fillLinearGradientEndPoint({ x: 1024, y: 576 });
          rect.fillLinearGradientColorStops(colorStops);
        }
        
        layer.add(rect);
      } else if (slide.backgroundColor) {
        const rect = new Konva.Rect({
          x: 0,
          y: 0,
          width: 1024,
          height: 576,
          fill: slide.backgroundColor || '#ffffff',
          listening: false,
        });
        layer.add(rect);
      } else {
        const rect = new Konva.Rect({
          x: 0,
          y: 0,
          width: 1024,
          height: 576,
          fill: '#ffffff',
          listening: false,
        });
        layer.add(rect);
      }

      // Render elements
      if (slide.elements && slide.elements.length > 0) {
        for (const element of slide.elements) {
          try {
            if (element.type === 'text') {
              const text = new Konva.Text({
                x: element.x || 0,
                y: element.y || 0,
                width: element.width || 200,
                height: element.height || 50,
                text: element.content || '',
                fontSize: element.fontSize || 16,
                fontFamily: element.fontFamily || 'Arial',
                fontStyle: element.fontStyle || 'normal',
                fill: element.color || '#000000',
                align: element.textAlign || 'left',
                verticalAlign: 'top',
                wrap: 'word',
                listening: false,
              });
              layer.add(text);
            } else if (element.type === 'shape') {
              const shapeType = element.shapeType || 'rectangle';
              let shape;
              
              if (shapeType === 'circle') {
                shape = new Konva.Circle({
                  x: (element.x || 0) + (element.width || 100) / 2,
                  y: (element.y || 0) + (element.height || 100) / 2,
                  radius: Math.min((element.width || 100) / 2, (element.height || 100) / 2),
                  fill: element.fillColor || '#2d9cdb',
                  stroke: element.borderColor || 'transparent',
                  strokeWidth: element.borderWidth || 0,
                  listening: false,
                });
              } else {
                shape = new Konva.Rect({
                  x: element.x || 0,
                  y: element.y || 0,
                  width: element.width || 100,
                  height: element.height || 100,
                  fill: element.fillColor || '#2d9cdb',
                  stroke: element.borderColor || 'transparent',
                  strokeWidth: element.borderWidth || 0,
                  cornerRadius: shapeType === 'rounded' ? 10 : 0,
                  listening: false,
                });
              }
              
              if (element.rotation) {
                shape.rotation(element.rotation);
              }
              
              layer.add(shape);
            } else if (element.type === 'image') {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              await new Promise((imgResolve, imgReject) => {
                img.onload = () => {
                  const konvaImg = new Konva.Image({
                    x: element.x || 0,
                    y: element.y || 0,
                    width: element.width || 200,
                    height: element.height || 200,
                    image: img,
                    listening: false,
                  });
                  if (element.rotation) {
                    konvaImg.rotation(element.rotation);
                  }
                  layer.add(konvaImg);
                  imgResolve();
                };
                img.onerror = () => {
                  console.warn('Failed to load image for thumbnail:', element.src);
                  imgResolve(); // Continue even if image fails
                };
                img.src = element.src;
              });
            } else if (element.type === 'chart') {
              // Render chart as image
              try {
                const chartImageData = await renderChartToImage(element);
                const img = new Image();
                await new Promise((imgResolve, imgReject) => {
                  img.onload = () => {
                    const konvaImg = new Konva.Image({
                      x: element.x || 0,
                      y: element.y || 0,
                      width: element.width || 360,
                      height: element.height || 240,
                      image: img,
                      listening: false,
                    });
                    if (element.rotation) {
                      konvaImg.rotation(element.rotation);
                    }
                    layer.add(konvaImg);
                    imgResolve();
                  };
                  img.onerror = imgReject;
                  img.src = chartImageData;
                });
              } catch (error) {
                console.warn('Failed to render chart for thumbnail:', error);
                // Add placeholder rectangle
                const rect = new Konva.Rect({
                  x: element.x || 0,
                  y: element.y || 0,
                  width: element.width || 360,
                  height: element.height || 240,
                  fill: '#f0f0f0',
                  stroke: '#ddd',
                  strokeWidth: 1,
                  listening: false,
                });
                layer.add(rect);
              }
            } else if (element.type === 'table') {
              // Render table as a simple representation
              const tableRect = new Konva.Rect({
                x: element.x || 0,
                y: element.y || 0,
                width: element.width || 400,
                height: element.height || 200,
                fill: '#ffffff',
                stroke: '#ddd',
                strokeWidth: 1,
                listening: false,
              });
              layer.add(tableRect);
              
              // Add some grid lines to represent table
              if (element.rows && element.cols) {
                const cellWidth = (element.width || 400) / element.cols;
                const cellHeight = (element.height || 200) / element.rows;
                
                for (let i = 1; i < element.rows; i++) {
                  const line = new Konva.Line({
                    points: [
                      element.x || 0,
                      (element.y || 0) + i * cellHeight,
                      (element.x || 0) + (element.width || 400),
                      (element.y || 0) + i * cellHeight
                    ],
                    stroke: '#ddd',
                    strokeWidth: 1,
                    listening: false,
                  });
                  layer.add(line);
                }
                
                for (let i = 1; i < element.cols; i++) {
                  const line = new Konva.Line({
                    points: [
                      (element.x || 0) + i * cellWidth,
                      element.y || 0,
                      (element.x || 0) + i * cellWidth,
                      (element.y || 0) + (element.height || 200)
                    ],
                    stroke: '#ddd',
                    strokeWidth: 1,
                    listening: false,
                  });
                  layer.add(line);
                }
              }
            }
          } catch (error) {
            console.warn('Error rendering element for thumbnail:', error);
            // Continue with other elements
          }
        }
      }

      // Draw the layer
      layer.draw();

      // Wait a bit for all async operations to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Generate thumbnail
      const dataURL = stage.toDataURL({
        pixelRatio: 0.25,
        mimeType: 'image/png',
        quality: 1
      });

      // Cleanup
      stage.destroy();
      document.body.removeChild(container);

      resolve(dataURL);
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      reject(error);
    }
  });
};

/**
 * Generates thumbnails for all slides
 * @param {Array} slides - Array of slide objects
 * @returns {Promise<Array>} - Promise that resolves to array of {slideId, thumbnail} objects
 */
export const generateAllSlideThumbnails = async (slides) => {
  const thumbnails = [];
  
  for (const slide of slides) {
    try {
      const thumbnail = await generateSlideThumbnail(slide);
      thumbnails.push({
        slideId: slide.id,
        thumbnail: thumbnail
      });
    } catch (error) {
      console.error(`Error generating thumbnail for slide ${slide.id}:`, error);
      // Continue with other slides even if one fails
    }
  }
  
  return thumbnails;
};

