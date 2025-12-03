import { normalizeListText } from './textFormatting';

// Process text for display (apply transforms and list formatting)
export function processTextForDisplay(text, element) {
  let processedText = text || "";

  // Apply case transform
  const transform = element.textTransform || 'none';
  if (transform === 'uppercase') processedText = processedText.toUpperCase();
  else if (transform === 'lowercase') processedText = processedText.toLowerCase();

  // Apply list prefixes using normalization (removes all old markers first)
  if (element.listType === 'bullet' || element.listType === 'number' || element.listType === 'none') {
    processedText = normalizeListText(processedText, element.listType || 'none');
  }

  return processedText;
}

