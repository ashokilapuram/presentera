// Utility function to normalize list text - removes all existing markers before applying new ones
export function normalizeListText(text, newType) {
  const lines = text.split('\n');
  
  // First, check if text already has the correct markers for bullets
  if (newType === 'bullet') {
    const alreadyFormatted = lines.every(line => {
      if (!line.trim()) return true; // empty line is fine
      return line.match(/^[\u2022•]\s*/);
    });
    if (alreadyFormatted) {
      return text; // Already properly formatted
    }
  }
  
  // For numbers, check if all lines are numbered (but we'll still renumber to fix sequences)
  // Remove any existing markers (bullet •, number 1., or any combination)
  const cleanedLines = lines
    .map(line => line.replace(/^(\s*[\u2022•]\s*|\s*\d+\.\s*)/, ''));

  if (newType === 'bullet') {
    return cleanedLines
      .map(line => (line.trim() ? `• ${line}` : line))
      .join('\n');
  }
  if (newType === 'number') {
    return cleanedLines
      .map((line, idx) => {
        if (line.trim()) {
          return `${idx + 1}. ${line}`;
        }
        return line;
      })
      .join('\n');
  }
  return cleanedLines.join('\n'); // for 'none'
}

// Utility function to strip all list markers from text (used when saving raw content)
export function stripListMarkers(text) {
  const lines = text.split('\n');
  return lines
    .map(line => line.replace(/^(\s*[\u2022•]\s*|\s*\d+\.\s*)/, ''))
    .join('\n');
}

