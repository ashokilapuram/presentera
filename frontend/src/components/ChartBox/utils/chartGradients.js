/**
 * Utility functions for creating gradients and shadows in charts
 */

/**
 * Convert hex color to RGB
 */
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

/**
 * Convert RGB to hex
 */
export const rgbToHex = (r, g, b) => {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
};

/**
 * Lighten a color by a percentage
 */
export const lightenColor = (hex, percent) => {
  const rgb = hexToRgb(hex);
  const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * percent));
  const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * percent));
  const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * percent));
  return rgbToHex(r, g, b);
};

/**
 * Darken a color by a percentage
 */
export const darkenColor = (hex, percent) => {
  const rgb = hexToRgb(hex);
  const r = Math.max(0, Math.round(rgb.r * (1 - percent)));
  const g = Math.max(0, Math.round(rgb.g * (1 - percent)));
  const b = Math.max(0, Math.round(rgb.b * (1 - percent)));
  return rgbToHex(r, g, b);
};

/**
 * Create a linear gradient for bars (top to bottom)
 * Returns gradient object that can be used in canvas context
 */
export const createBarGradient = (context, x, y, width, height, baseColor, isNegative = false) => {
  const gradient = context.createLinearGradient(x, y, x, y + height);
  
  if (isNegative) {
    // For negative bars: lighter at top (x-axis), darker at bottom
    const lightColor = lightenColor(baseColor, 0.3);
    const darkColor = darkenColor(baseColor, 0.15);
    gradient.addColorStop(0, lightColor);
    gradient.addColorStop(1, darkColor);
  } else {
    // For positive bars: lighter at top, darker at bottom (more realistic 3D effect)
    const lightColor = lightenColor(baseColor, 0.4);
    const midColor = baseColor;
    const darkColor = darkenColor(baseColor, 0.2);
    gradient.addColorStop(0, lightColor);
    gradient.addColorStop(0.5, midColor);
    gradient.addColorStop(1, darkColor);
  }
  
  return gradient;
};

/**
 * Create a radial gradient for pie slices
 */
export const createPieGradient = (context, cx, cy, radius, baseColor, angle) => {
  // Create gradient from center (lighter) to edge (darker)
  const gradient = context.createRadialGradient(cx, cy, 0, cx, cy, radius);
  const lightColor = lightenColor(baseColor, 0.3);
  const midColor = baseColor;
  const darkColor = darkenColor(baseColor, 0.25);
  
  gradient.addColorStop(0, lightColor);
  gradient.addColorStop(0.6, midColor);
  gradient.addColorStop(1, darkColor);
  
  return gradient;
};

/**
 * Apply shadow to canvas context
 */
export const applyShadow = (context, offsetX = 0, offsetY = 2, blur = 4, color = 'rgba(0, 0, 0, 0.15)') => {
  context.shadowColor = color;
  context.shadowOffsetX = offsetX;
  context.shadowOffsetY = offsetY;
  context.shadowBlur = blur;
};

/**
 * Clear shadow from canvas context
 */
export const clearShadow = (context) => {
  context.shadowColor = 'transparent';
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;
  context.shadowBlur = 0;
};

