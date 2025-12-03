// Convert hex to rgba with opacity
export function hexToRgba(hex, opacity = 1) {
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
}

