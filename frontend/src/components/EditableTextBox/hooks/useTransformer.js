import { useEffect, useRef, useCallback } from 'react';

export function useTransformer(isSelected, textRef) {
  const trRef = useRef();

  // Force Transformer to refresh after selection re-apply
  const forceTransformerRefresh = useCallback(() => {
    if (trRef.current && textRef.current) {
      trRef.current.nodes([textRef.current]);
      const layer = trRef.current.getLayer();
      if (layer) layer.batchDraw();
    }
  }, [textRef]);

  // Attach transformer when selected
  useEffect(() => {
    if (isSelected && trRef.current && textRef.current) {
      trRef.current.nodes([textRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, textRef]);

  return {
    trRef,
    forceTransformerRefresh,
  };
}

