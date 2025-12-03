import html2canvas from 'html2canvas';
import { renderChartToImage } from './renderChartToImage';

export const downloadPresentation = async (slides, currentSlideIndex, chartExporters = {}) => {
  try {
    // Dynamically import PptxGenJS to avoid webpack issues
    const { default: PptxGenJS } = await import('pptxgenjs');
    
    // Create a new presentation
    const pptx = new PptxGenJS();
    
    // Set presentation properties
    pptx.defineLayout({ name: 'PRES_16x9', width: 10, height: 5.625 });
    pptx.layout = 'PRES_16x9';
    
    // Set presentation metadata
    pptx.author = 'Presentify';
    pptx.company = 'Presentify';
    pptx.title = 'Presentation';
    pptx.subject = 'Created with Presentify';
    
    // Canvas dimensions (matching KonvaCanvas base dimensions)
    const CANVAS_WIDTH = 1024;
    const CANVAS_HEIGHT = 576;
    const PPT_WIDTH = 10; // inches
    const PPT_HEIGHT = 5.625; // inches
    
    // Process each slide
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      
      // Create a new slide
      const pptxSlide = pptx.addSlide();
      
      // Handle background gradient by converting to image
      if (slide.backgroundGradient && !slide.backgroundImage) {
        try {
          // Create a canvas to render the gradient
          const canvas = document.createElement('canvas');
          canvas.width = 1920; // High resolution for quality
          canvas.height = 1080; // 16:9 aspect ratio
          const ctx = canvas.getContext('2d');
          
          const gradientType = slide.backgroundGradient.type || 'linear';
          const colors = slide.backgroundGradient.colors || ['#ffffff'];
          
          let gradient;
          if (gradientType === 'radial') {
            // Radial gradient
            gradient = ctx.createRadialGradient(
              canvas.width / 2, canvas.height / 2, 0,
              canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
            );
          } else {
            // Linear gradient (default: diagonal from top-left to bottom-right)
            gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          }
          
          // Add color stops
          const step = colors.length > 1 ? 1 / (colors.length - 1) : 0;
          colors.forEach((color, i) => {
            gradient.addColorStop(i * step, color);
          });
          
          // Fill canvas with gradient
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Convert to data URL
          const gradientImageData = canvas.toDataURL('image/png', 1.0);
          
          // Add gradient as background image
          pptxSlide.addImage({
            data: gradientImageData,
            x: 0,
            y: 0,
            w: PPT_WIDTH,
            h: PPT_HEIGHT
          });
        } catch (error) {
          console.warn('Could not render gradient as image, using first color:', error);
          // Fallback to first gradient color as solid background
          const fallbackColor = slide.backgroundGradient.colors?.[0] || slide.backgroundColor || '#ffffff';
          pptxSlide.background = { fill: fallbackColor };
        }
      } else if (slide.backgroundColor && !slide.backgroundImage && !slide.backgroundGradient) {
        // Set slide background color (only if no background image or gradient)
        pptxSlide.background = { fill: slide.backgroundColor };
      }
      
      // Add background image as a regular image at the back (position 0,0 with full slide size)
      // Background image takes priority over gradient
      if (slide.backgroundImage) {
        try {
          pptxSlide.addImage({
            data: slide.backgroundImage,
            x: 0,
            y: 0,
            w: PPT_WIDTH,
            h: PPT_HEIGHT
          });
        } catch (error) {
          console.warn('Could not add background image:', error);
        }
      }
      
      // Process each element in the slide
      for (const element of slide.elements) {
        try {
          switch (element.type) {
            case 'text':
              // Clean HTML content for PowerPoint
              const cleanContent = element.content
                .replace(/<[^>]*>/g, '') // Remove HTML tags
                .replace(/&nbsp;/g, ' ') // Replace &nbsp; with spaces
                .replace(/&amp;/g, '&') // Replace &amp; with &
                .replace(/&lt;/g, '<') // Replace &lt; with <
                .replace(/&gt;/g, '>') // Replace &gt; with >
                .replace(/&quot;/g, '"') // Replace &quot; with "
                .trim();
              
              // Add text element with exact position and size
              pptxSlide.addText(cleanContent, {
                x: (element.x / CANVAS_WIDTH) * PPT_WIDTH,
                y: (element.y / CANVAS_HEIGHT) * PPT_HEIGHT,
                w: (element.width / CANVAS_WIDTH) * PPT_WIDTH,
                h: (element.height / CANVAS_HEIGHT) * PPT_HEIGHT,
                fontSize: (element.fontSize || 16) * (PPT_HEIGHT / CANVAS_HEIGHT) * 72, // Convert to points (72 points per inch)
                fontFace: element.fontFamily || 'Arial',
                color: element.color || '#000000',
                bold: element.fontWeight === 'bold',
                italic: element.fontStyle === 'italic',
                underline: element.textDecoration === 'underline',
                align: element.textAlign || 'left',
                valign: 'top',
                wrap: 'overflow'
              });
              break;
              
            case 'shape':
              // Add shape element
              // Convert hex to rgba with opacity if needed
              let fillColor = element.fillColor || '#2d9cdb';
              if (element.fillOpacity !== undefined && element.fillOpacity < 1) {
                // Convert hex to rgba
                const hexToRgba = (hex, opacity) => {
                  if (!hex || hex === 'transparent') return `rgba(0, 0, 0, ${opacity})`;
                  const colorHex = hex.startsWith('#') ? hex.slice(1) : hex;
                  let r, g, b;
                  if (colorHex.length === 3) {
                    r = parseInt(colorHex[0] + colorHex[0], 16);
                    g = parseInt(colorHex[1] + colorHex[1], 16);
                    b = parseInt(colorHex[2] + colorHex[2], 16);
                  } else {
                    r = parseInt(colorHex.slice(0, 2), 16);
                    g = parseInt(colorHex.slice(2, 4), 16);
                    b = parseInt(colorHex.slice(4, 6), 16);
                  }
                  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                };
                fillColor = hexToRgba(element.fillColor || '#2d9cdb', element.fillOpacity);
              }
              
              const shapeProps = {
                x: (element.x / CANVAS_WIDTH) * PPT_WIDTH,
                y: (element.y / CANVAS_HEIGHT) * PPT_HEIGHT,
                w: (element.width / CANVAS_WIDTH) * PPT_WIDTH,
                h: (element.height / CANVAS_HEIGHT) * PPT_HEIGHT,
                fill: { color: fillColor },
                line: { 
                  color: element.borderColor || '#1e7bb8', 
                  width: Math.max(0.01, (element.borderWidth || 2) * (PPT_WIDTH / CANVAS_WIDTH)) // Convert px to inches
                }
              };
              
              switch (element.shapeType) {
                case 'rectangle':
                  pptxSlide.addShape('rect', shapeProps);
                  break;
                case 'circle':
                  pptxSlide.addShape('ellipse', shapeProps);
                  break;
                case 'triangle':
                  pptxSlide.addShape('triangle', shapeProps);
                  break;
                default:
                  pptxSlide.addShape('rect', shapeProps);
              }
              break;
              
            case 'image':
              // Add image element with exact position and size
              try {
                let imageData = element.src;
                
                // If the image src is a URL (not base64), convert it to base64
                if (imageData && !imageData.startsWith('data:image') && !imageData.startsWith('data:application')) {
                  try {
                    // For local files (clipart), use a canvas-based approach to avoid CORS issues
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    
                    imageData = await new Promise((resolve, reject) => {
                      img.onload = () => {
                        try {
                          // Create a canvas to convert the image to base64
                          const canvas = document.createElement('canvas');
                          canvas.width = img.naturalWidth;
                          canvas.height = img.naturalHeight;
                          const ctx = canvas.getContext('2d');
                          ctx.drawImage(img, 0, 0);
                          const base64 = canvas.toDataURL('image/png');
                          resolve(base64);
                        } catch (canvasError) {
                          // Fallback to fetch if canvas fails
                          fetch(element.src)
                            .then(response => response.blob())
                            .then(blob => {
                              const reader = new FileReader();
                              reader.onloadend = () => resolve(reader.result);
                              reader.onerror = reject;
                              reader.readAsDataURL(blob);
                            })
                            .catch(reject);
                        }
                      };
                      img.onerror = () => {
                        // Fallback to fetch if image load fails
                        fetch(element.src)
                          .then(response => response.blob())
                          .then(blob => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.onerror = reject;
                            reader.readAsDataURL(blob);
                          })
                          .catch(reject);
                      };
                      img.src = element.src;
                    });
                  } catch (fetchError) {
                    console.warn('Could not convert image to base64:', fetchError, 'Image src:', imageData);
                    // If conversion fails, try to use the original src (might work for some formats)
                    // But PPTXGenJS typically needs base64, so this might fail
                  }
                }
                
                // Only add image if we have valid base64 data
                if (imageData && imageData.startsWith('data:image')) {
                  pptxSlide.addImage({
                    data: imageData,
                    x: (element.x / CANVAS_WIDTH) * PPT_WIDTH,
                    y: (element.y / CANVAS_HEIGHT) * PPT_HEIGHT,
                    w: (element.width / CANVAS_WIDTH) * PPT_WIDTH,
                    h: (element.height / CANVAS_HEIGHT) * PPT_HEIGHT
                  });
                } else {
                  throw new Error('Invalid image data format - must be base64 data URL');
                }
              } catch (error) {
                console.warn('Could not add image:', error, 'Element:', element);
                // Add placeholder text instead
                pptxSlide.addText('Image', {
                  x: (element.x / CANVAS_WIDTH) * PPT_WIDTH,
                  y: (element.y / CANVAS_HEIGHT) * PPT_HEIGHT,
                  w: (element.width / CANVAS_WIDTH) * PPT_WIDTH,
                  h: (element.height / CANVAS_HEIGHT) * PPT_HEIGHT,
                  fontSize: 12,
                  color: '#666666',
                  align: 'center',
                  valign: 'middle',
                  fill: { color: '#f0f0f0' }
                });
              }
              break;
              
            case 'chart':
              // All charts (bar, line, pie): render to image using off-screen Konva stage
              // This works for charts on any slide, not just the active one (like gradients)
              try {
                const chartX = (element.x / CANVAS_WIDTH) * PPT_WIDTH;
                const chartY = (element.y / CANVAS_HEIGHT) * PPT_HEIGHT;
                const chartW = (element.width / CANVAS_WIDTH) * PPT_WIDTH;
                const chartH = (element.height / CANVAS_HEIGHT) * PPT_HEIGHT;
                
                // Render chart to image using off-screen Konva stage
                // This works for any slide, just like gradients
                const chartImageData = await renderChartToImage(element);
                
                if (chartImageData && 
                    typeof chartImageData === 'string' && 
                    chartImageData.startsWith('data:image') &&
                    chartImageData.length > 100) {
                  // Add chart as image with exact position and size
                  pptxSlide.addImage({
                    data: chartImageData,
                    x: chartX,
                    y: chartY,
                    w: chartW,
                    h: chartH
                  });
                  console.log(`✓ Chart ${element.id} (${element.chartType}) exported successfully`);
                } else {
                  throw new Error(`Failed to render chart ${element.id} to image`);
                }
              } catch (error) {
                console.warn(`Could not render chart ${element.id} (${element.chartType}):`, error);
                // Fallback to placeholder
                const chartX = (element.x / CANVAS_WIDTH) * PPT_WIDTH;
                const chartY = (element.y / CANVAS_HEIGHT) * PPT_HEIGHT;
                const chartW = (element.width / CANVAS_WIDTH) * PPT_WIDTH;
                const chartH = (element.height / CANVAS_HEIGHT) * PPT_HEIGHT;
                pptxSlide.addText(`Chart: ${element.chartType || 'bar'}`, {
                  x: chartX,
                  y: chartY,
                  w: chartW,
                  h: chartH,
                  fontSize: 14,
                  color: '#6b7280',
                  align: 'center',
                  valign: 'middle',
                  fill: { color: '#f3f4f6' },
                  line: { color: '#9ca3af', width: 0.1, dashType: 'dash' }
                });
              }
              break;
              
            case 'table':
              // Add table element
              try {
                if (element.data && element.data.length > 0) {
                  const tableData = element.data.map(row =>
                    row.map(cell => ({
                      text: cell.text || '',
                      options: {
                        fill: { color: cell.bgColor || '#ffffff' },
                        color: cell.textColor || '#000000',
                        fontSize: cell.fontSize || 14,
                        bold: cell.fontWeight === 'bold',
                        italic: cell.fontStyle === 'italic',
                        align: cell.align || 'left'
                      }
                    }))
                  );
                  
                  pptxSlide.addTable(tableData, {
                    x: (element.x / CANVAS_WIDTH) * PPT_WIDTH,
                    y: (element.y / CANVAS_HEIGHT) * PPT_HEIGHT,
                    w: (element.width / CANVAS_WIDTH) * PPT_WIDTH,
                    h: (element.height / CANVAS_HEIGHT) * PPT_HEIGHT,
                    border: { type: 'solid', color: '#cccccc', pt: 1 }
                  });
                }
              } catch (error) {
                console.warn('Could not add table:', error);
                // Add placeholder text instead
                pptxSlide.addText('Table', {
                  x: (element.x / CANVAS_WIDTH) * PPT_WIDTH,
                  y: (element.y / CANVAS_HEIGHT) * PPT_HEIGHT,
                  w: (element.width / CANVAS_WIDTH) * PPT_WIDTH,
                  h: (element.height / CANVAS_HEIGHT) * PPT_HEIGHT,
                  fontSize: 12,
                  color: '#666666',
                  align: 'center',
                  valign: 'middle',
                  fill: { color: '#f0f0f0' }
                });
              }
              break;
          }
        } catch (elementError) {
          console.warn(`Error processing element ${element.type}:`, elementError);
        }
      }
    }
    
    // Generate and download the presentation
    const filename = `presentation-${new Date().toISOString().split('T')[0]}.pptx`;
    await pptx.writeFile({ fileName: filename });
    
    console.log('PowerPoint presentation downloaded successfully!');
    
  } catch (error) {
    console.error('Error downloading PowerPoint presentation:', error);
    console.log('Falling back to HTML export...');
    
    // Fallback to HTML export
    try {
      const presentationHTML = generatePresentationHTML(slides);
      
      // Create and download HTML file
      const blob = new Blob([presentationHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `presentation-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('Presentation downloaded as HTML! You can open this in PowerPoint or any presentation software.');
      alert('PowerPoint generation failed, but presentation has been downloaded as HTML. You can open this in PowerPoint or any presentation software.');
    } catch (htmlError) {
      console.error('Error downloading HTML presentation:', htmlError);
      alert('Error downloading presentation. Please try again.');
    }
  }
};

const generatePresentationHTML = (slides) => {
  const slideHTML = slides.map((slide, index) => {
    const elementsHTML = slide.elements.map(element => {
      switch (element.type) {
        case 'text':
          return `
            <div style="
              position: absolute;
              left: ${element.x}px;
              top: ${element.y}px;
              width: ${element.width}px;
              height: ${element.height}px;
              font-size: ${element.fontSize || 16}px;
              font-family: ${element.fontFamily || 'Arial'};
              color: ${element.color || '#000000'};
              font-weight: ${element.fontWeight || 'normal'};
              font-style: ${element.fontStyle || 'normal'};
              text-decoration: ${element.textDecoration || 'none'};
              text-align: ${element.textAlign || 'left'};
              background-color: ${element.backgroundColor || 'transparent'};
              padding: 8px;
              overflow: hidden;
            ">${element.content}</div>
          `;
        case 'shape':
          // Convert hex to rgba with opacity if needed
          let shapeFillColor = element.fillColor || '#2d9cdb';
          if (element.fillOpacity !== undefined && element.fillOpacity < 1) {
            const hex = shapeFillColor.startsWith('#') ? shapeFillColor.slice(1) : shapeFillColor;
            let r, g, b;
            if (hex.length === 3) {
              r = parseInt(hex[0] + hex[0], 16);
              g = parseInt(hex[1] + hex[1], 16);
              b = parseInt(hex[2] + hex[2], 16);
            } else {
              r = parseInt(hex.slice(0, 2), 16);
              g = parseInt(hex.slice(2, 4), 16);
              b = parseInt(hex.slice(4, 6), 16);
            }
            shapeFillColor = `rgba(${r}, ${g}, ${b}, ${element.fillOpacity})`;
          }
          
          return `
            <div style="
              position: absolute;
              left: ${element.x}px;
              top: ${element.y}px;
              width: ${element.width}px;
              height: ${element.height}px;
              background-color: ${shapeFillColor};
              border: ${element.borderWidth || 0}px solid ${element.borderColor || 'transparent'};
              border-radius: ${element.shapeType === 'circle' ? '50%' : '0'};
            "></div>
          `;
        case 'image':
          return `
            <img src="${element.src}" alt="" style="
              position: absolute;
              left: ${element.x}px;
              top: ${element.y}px;
              width: ${element.width}px;
              height: ${element.height}px;
              object-fit: contain;
              opacity: ${element.opacity !== undefined ? element.opacity : 1};
            " />
          `;
        case 'chart':
          return `
            <div style="
              position: absolute;
              left: ${element.x}px;
              top: ${element.y}px;
              width: ${element.width}px;
              height: ${element.height}px;
              background-color: #f3f4f6;
              border: 2px dashed #9ca3af;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #6b7280;
              font-size: 14px;
              font-weight: 500;
            ">Chart: ${element.chartType || 'bar'}</div>
          `;
        default:
          return '';
      }
    }).join('');
    
    return `
      <div class="slide" style="
        width: 800px;
        height: 450px;
        position: relative;
        background-color: ${slide.backgroundColor || '#ffffff'};
        background-image: ${slide.backgroundImage ? `url(${slide.backgroundImage})` : 'none'};
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        margin: 20px auto;
        border: 1px solid #ddd;
        page-break-after: always;
      ">
        ${elementsHTML}
      </div>
    `;
  }).join('');
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Presentation Export</title>
      <style>
        body {
          margin: 0;
          padding: 20px;
          font-family: Arial, sans-serif;
          background-color: #f5f5f5;
        }
        .presentation {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .slide {
          margin-bottom: 40px;
        }
        .slide:last-child {
          margin-bottom: 0;
        }
        @media print {
          body { background: white; }
          .presentation { box-shadow: none; }
          .slide { page-break-after: always; }
        }
      </style>
    </head>
    <body>
      <div class="presentation">
        <h1 style="text-align: center; margin-bottom: 30px;">Presentation Export</h1>
        ${slideHTML}
      </div>
    </body>
    </html>
  `;
};

// Alternative method using html2canvas for more accurate visual representation
export const downloadPresentationAsImages = async (slides, currentSlideIndex) => {
  try {
    const canvas = document.querySelector('.canvas');
    if (!canvas) {
      throw new Error('Canvas not found');
    }
    
    const images = [];
    
    // Capture each slide
    for (let i = 0; i < slides.length; i++) {
      // Switch to the slide (this would need to be handled by the parent component)
      // For now, we'll capture the current slide
      if (i === currentSlideIndex) {
        const canvasElement = canvas.cloneNode(true);
        canvasElement.style.position = 'absolute';
        canvasElement.style.top = '0';
        canvasElement.style.left = '0';
        canvasElement.style.zIndex = '9999';
        document.body.appendChild(canvasElement);
        
        const canvasData = await html2canvas(canvasElement, {
          width: 800,
          height: 450,
          scale: 2,
          useCORS: true,
          allowTaint: true
        });
        
        document.body.removeChild(canvasElement);
        images.push(canvasData.toDataURL('image/png'));
      }
    }
    
    // Create a zip file with images (simplified approach - just download first image)
    if (images.length > 0) {
      const link = document.createElement('a');
      link.download = `slide-${currentSlideIndex + 1}.png`;
      link.href = images[0];
      link.click();
    }
    
  } catch (error) {
    console.error('Error capturing slide:', error);
    alert('Error capturing slide. Please try again.');
  }
};
