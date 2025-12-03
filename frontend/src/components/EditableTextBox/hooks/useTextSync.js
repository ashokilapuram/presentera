import { useEffect } from 'react';

export function useTextSync(element, isEditing, isSelected, forceTransformerRefresh) {
  // Force re-render when font properties change
  useEffect(() => {
    // This effect ensures the layer redraws when font properties change
    // The actual redraw is handled by the component's useEffect
  }, [element.fontWeight, element.fontStyle, element.fontSize, element.fontFamily]);

  // If formatting/appearance changes while this element is selected (for example
  // via a toolbar that updates fontWeight/color/size), ensure the Transformer
  // is re-attached and redrawn so resize handles remain visible. We don't
  // depend on isSelected toggling here because formatting updates often happen
  // while selection is already true.
  useEffect(() => {
    if (isSelected && !isEditing) {
      try {
        forceTransformerRefresh();
      } catch (err) {
        console.error('Error refreshing transformer after formatting change:', err);
      }
    }
    // Intentionally include commonly changed element appearance props
  }, [
    isSelected,
    isEditing,
    element.fontWeight,
    element.fontStyle,
    element.fontSize,
    element.fontFamily,
    element.color,
    element.width,
    element.height,
    element.textAlign,
    element.rotation,
    element.strokeWidth,
    element.strokeColor,
    element.letterSpacing,
    element.lineHeight,
    forceTransformerRefresh,
  ]);
}

