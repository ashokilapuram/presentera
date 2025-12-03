// Calculate minimum width based on 2 characters
export function calculateMinWidth(element) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  const fontStyle = element.fontStyle || 'normal';
  const fontWeight = element.fontWeight || 'normal';
  const fontFamily = element.fontFamily || 'Arial';
  const fontSize = element.fontSize || 16;
  
  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
  
  // Measure width of 2 characters (using 'MM' as a reasonable approximation)
  const twoCharWidth = ctx.measureText('MM').width;
  return Math.max(40, twoCharWidth + 10); // Add some padding
}

// Calculate minimum height based on Konva's displayed text content
export function calculateMinHeight(element, currentText, newBoxWidth) {
  if (!currentText || currentText.trim() === '') {
    return 20; // Default minimum
  }
  
  // Create a temporary canvas to measure text height
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set font properties to match the text
  const fontStyle = element.fontStyle || 'normal';
  const fontWeight = element.fontWeight || 'normal';
  const fontFamily = element.fontFamily || 'Arial';
  const fontSize = element.fontSize || 16;
  
  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
  
  // Handle line breaks first
  const paragraphs = currentText.split('\n');
  let totalLines = 0;
  
  for (const paragraph of paragraphs) {
    if (paragraph.trim() === '') {
      totalLines += 1; // Empty line
      continue;
    }
    
    const words = paragraph.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > newBoxWidth) {
        // If current line has content, save it and start new line
        if (currentLine !== '') {
          lines.push(currentLine);
          currentLine = '';
        }
        
        // Now handle the word - if it's still too long, break it character by character
        if (currentLine === '') {
          let charIndex = 0;
          while (charIndex < word.length) {
            let charLine = '';
            while (charIndex < word.length) {
              const testChar = charLine + word[charIndex];
              const charMetrics = ctx.measureText(testChar);
              if (charMetrics.width > newBoxWidth && charLine !== '') {
                break;
              }
              charLine = testChar;
              charIndex++;
            }
            if (charLine) {
              lines.push(charLine);
            }
          }
        } else {
          // If we have space on current line, add the word
          currentLine = word;
        }
      } else {
        // Word fits, add it to current line
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    totalLines += lines.length;
  }
  
  const lineHeight = fontSize * 1.2; // Slightly more spacing for better text wrapping
  const padding = totalLines === 1 ? 2 : 4; // Less padding for single line, normal for multi-line
  return Math.max(12, totalLines * lineHeight + padding);
}

