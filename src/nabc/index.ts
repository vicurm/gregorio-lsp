/**
 * NABC (Neumatic Adiastematic Neume Notation) Module
 * 
 * This module provides comprehensive support for NABC notation in Gregorio LSP,
 * including autocomplete, hover information, and validation based on official
 * Gregorio documentation.
 * 
 * Features:
 * - 31 St. Gall glyphs + 29 Laon glyphs with variants
 * - 25+ significant letters + Tironian notes
 * - Complete modifier system (S, G, M, -, >, ~)
 * - Font-aware validation and completions
 * - Pitch descriptors and subpunctis/prepunctis
 * - Compound glyph support with ! separator
 * - Semantic validation and warnings
 */

// Type definitions
export * from './types';

// Glyph definitions and utilities
export * from './glyphs';

// Significant letters and Tironian notes
export * from './significantLetters';

// Completion and hover providers
export * from './completionProvider';

// NABC validation system
export * from './validator';

// Re-export main classes for convenience
export { 
  NABCCompletionProvider, 
  NABCHoverProvider,
  nabcCompletionProvider,
  nabcHoverProvider 
} from './completionProvider';

export { 
  NABCValidator, 
  validateNABCHeader 
} from './validator';

/**
 * Utility function to detect NABC context in GABC content
 */
export function detectNABCContext(text: string, position: number): {
  isInNABC: boolean;
  nabcSnippet?: string;
  snippetStart?: number;
  font?: string;
} {
  // Look for nabc-lines header to determine if NABC is enabled
  const nabcLinesMatch = text.match(/nabc-lines:\s*(\d+)\s*;/i);
  if (!nabcLinesMatch) {
    return { isInNABC: false };
  }

  // Find the current position relative to | separators
  const beforePosition = text.substring(0, position);
  const afterPosition = text.substring(position);

  // Count | characters to determine if we're in a NABC snippet
  const pipesBefore = (beforePosition.match(/\|/g) || []).length;
  const nabcLines = parseInt(nabcLinesMatch[1]);

  // Simple alternation detection (for nabc-lines: 1)
  if (nabcLines === 1) {
    const isInNABC = pipesBefore % 2 === 1;
    
    if (isInNABC) {
      // Find the start and end of current NABC snippet
      const lastPipe = beforePosition.lastIndexOf('|');
      const nextPipe = afterPosition.indexOf('|');
      
      const snippetStart = lastPipe + 1;
      const snippetEnd = nextPipe === -1 ? text.length : position + nextPipe;
      const nabcSnippet = text.substring(snippetStart, snippetEnd);

      return {
        isInNABC: true,
        nabcSnippet: nabcSnippet.trim(),
        snippetStart,
        font: detectFont(text)
      };
    }
  }

  return { isInNABC: false };
}

/**
 * Detect font family from GABC content or filename
 */
function detectFont(text: string): string {
  // Look for font annotations or clues in the text
  if (text.includes('grelaon') || text.includes('laon')) {
    return 'grelaon';
  }
  
  if (text.includes('gresgmodern')) {
    return 'gresgmodern';
  }
  
  // Default to gregall (St. Gall)
  return 'gregall';
}

/**
 * Quick validation function for NABC snippets
 */
export function quickValidateNABC(snippet: string, font: string = 'gregall'): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic syntax check
  const glyphPattern = /([a-z]{2})([SGM\-~>]*\d*)(h[a-np])?((su|pp)[tuvwxy]?\d+)*((ls|lt)[a-z]+\d)*/g;
  const spacingPattern = /^(\/\/|\/|``|`)*(.*)$/;

  const spacingMatch = snippet.match(spacingPattern);
  if (!spacingMatch) {
    errors.push('Invalid NABC snippet format');
    return { isValid: false, errors, warnings };
  }

  const [, spacings, neumesPart] = spacingMatch;
  
  // Validate spacing
  if (spacings && !spacings.match(/^(\/\/|\/|``|`)*$/)) {
    errors.push('Invalid spacing characters');
  }

  // Validate neumes
  if (neumesPart.trim()) {
    const neumes = neumesPart.trim().split(/\s+/);
    
    for (const neume of neumes) {
      if (!neume.match(/^[a-z!SGM\-~>h0-9sutpvwxyls]+$/)) {
        errors.push(`Invalid characters in neume: ${neume}`);
      }

      // Check for basic glyph codes
      const glyphCodes = neume.split('!').map(part => part.substring(0, 2));
      for (const code of glyphCodes) {
        if (code.length === 2 && !code.match(/^[a-z]{2}$/)) {
          warnings.push(`Unusual glyph code: ${code}`);
        }
      }
    }
  }

  const isValid = errors.length === 0;
  return { isValid, errors, warnings };
}

/**
 * Get completion suggestions for current NABC context
 */
export function getNABCCompletions(
  snippet: string, 
  cursorPosition: number,
  font: string = 'gregall'
): Array<{ label: string; detail: string; documentation: string }> {
  // This would integrate with the completion provider
  // For now, return a simplified list
  
  const fontFamily = font as any; // Convert to enum
  const provider = new (require('./completionProvider').NABCCompletionProvider)();
  provider.setFont(fontFamily);
  
  return provider.getAllCompletions().map((item: any) => ({
    label: item.label,
    detail: item.detail || '',
    documentation: typeof item.documentation === 'string' ? 
      item.documentation : 
      item.documentation?.value || ''
  }));
}