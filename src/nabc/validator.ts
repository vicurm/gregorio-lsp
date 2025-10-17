import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import { 
  NABCFontFamily, 
  NABCComplexGlyph,
  NABCGlyphModifier,
  NABCSubPunctisModifier 
} from './types';

import { NABC_BASIC_GLYPHS } from './glyphs';
import { ALL_SIGNIFICANT_LETTERS } from './significantLetters';

/**
 * NABC Validator
 * Validates NABC notation syntax and semantics
 */

export interface NABCValidationContext {
  font: NABCFontFamily;
  nabcLinesCount: number;
  currentLineIndex: number;
  documentUri: string;
}

export class NABCValidator {
  private diagnostics: Diagnostic[] = [];
  private context: NABCValidationContext;

  constructor(context: NABCValidationContext) {
    this.context = context;
    this.diagnostics = [];
  }

  /**
   * Validate a complete NABC snippet
   */
  validateNABCSnippet(snippet: string, startOffset: number): Diagnostic[] {
    this.diagnostics = [];
    
    // Parse spacing adjustments
    const { spacings, remainder: afterSpacing } = this.parseSpacingAdjustments(snippet);
    let currentOffset = startOffset;
    
    // Validate spacing
    for (const spacing of spacings) {
      this.validateSpacing(spacing, currentOffset);
      currentOffset += spacing.length;
    }

    // Parse complex neume descriptors
    const neumes = this.parseComplexNeumes(afterSpacing);
    
    for (const neume of neumes) {
      this.validateComplexNeume(neume, currentOffset);
      currentOffset += neume.originalText.length;
    }

    // Validate warning cases
    this.validateWarningCases(snippet, startOffset);

    return this.diagnostics;
  }

  /**
   * Parse spacing adjustments from the beginning of snippet
   */
  private parseSpacingAdjustments(snippet: string): { spacings: string[], remainder: string } {
    const spacings: string[] = [];
    let pos = 0;
    
    while (pos < snippet.length) {
      if (snippet.substr(pos, 2) === '//' || snippet.substr(pos, 2) === '``') {
        spacings.push(snippet.substr(pos, 2));
        pos += 2;
      } else if (snippet[pos] === '/' || snippet[pos] === '`') {
        spacings.push(snippet[pos]);
        pos += 1;
      } else {
        break;
      }
    }

    return {
      spacings,
      remainder: snippet.substr(pos)
    };
  }

  /**
   * Validate spacing adjustment
   */
  private validateSpacing(spacing: string, offset: number): void {
    const validSpacings = ['//', '/', '``', '`'];
    
    if (!validSpacings.includes(spacing)) {
      this.createDiagnostic(
        offset,
        offset + spacing.length,
        `Invalid spacing adjustment: ${spacing}`,
        DiagnosticSeverity.Error,
        'nabc-invalid-spacing'
      );
    }
  }

  /**
   * Parse complex neume descriptors
   */
  private parseComplexNeumes(text: string): Array<NABCComplexGlyph & { originalText: string }> {
    const neumes: Array<NABCComplexGlyph & { originalText: string }> = [];
    
    // Split by whitespace to get individual neume descriptors
    const descriptors = text.split(/\s+/).filter(d => d.length > 0);
    
    for (const descriptor of descriptors) {
      const parsed = this.parseComplexGlyph(descriptor);
      if (parsed) {
        neumes.push({ ...parsed, originalText: descriptor });
      }
    }

    return neumes;
  }

  /**
   * Parse a single complex glyph descriptor
   */
  private parseComplexGlyph(descriptor: string): NABCComplexGlyph | null {
    // Complex pattern: [glyph][modifiers][pitch][subpunctis][letters]
    
    // First, extract compound glyphs (separated by !)
    const glyphParts = descriptor.split('!');
    const components: string[] = [];
    
    for (let i = 0; i < glyphParts.length; i++) {
      const part = glyphParts[i];
      
      // Extract basic glyph code (first 2 letters)
      const glyphMatch = part.match(/^([a-z]{2})/);
      if (glyphMatch) {
        components.push(glyphMatch[1]);
        
        // For the first component, parse modifiers, pitch, etc.
        if (i === 0) {
          return this.parseGlyphDetails(part, components);
        }
      }
    }

    return null;
  }

  /**
   * Parse glyph details (modifiers, pitch, subpunctis, letters)
   */
  private parseGlyphDetails(text: string, components: string[]): NABCComplexGlyph {
    const result: NABCComplexGlyph = { components };
    
    let remaining = text.substr(2); // Skip basic glyph code
    
    // Parse modifiers (S, G, M, -, >, ~) with optional numbers
    const modifierMatch = remaining.match(/^([SGM\-~>]+\d*)/);
    if (modifierMatch) {
      result.modifiers = this.parseModifiers(modifierMatch[1]);
      remaining = remaining.substr(modifierMatch[1].length);
    }

    // Parse pitch descriptor (h + letter)
    const pitchMatch = remaining.match(/^(h[a-np])/);
    if (pitchMatch) {
      result.pitch = pitchMatch[1];
      remaining = remaining.substr(pitchMatch[1].length);
    }

    // Parse subpunctis/prepunctis
    const subPunctisMatch = remaining.match(/^((su|pp)[tuvwxy]?\d+)+/);
    if (subPunctisMatch) {
      result.subpunctis = this.parseSubPunctis(subPunctisMatch[1]);
      remaining = remaining.substr(subPunctisMatch[1].length);
    }

    // Parse significant letters
    const letterMatches = remaining.match(/(ls[a-z]+\d|lt[a-z]+\d)/g);
    if (letterMatches) {
      result.significantLetters = letterMatches.map(match => {
        const positionMatch = match.match(/(\d)$/);
        return {
          code: match,
          position: positionMatch ? parseInt(positionMatch[1]) : 1
        };
      });
    }

    return result;
  }

  /**
   * Parse modifier string into structured format
   */
  private parseModifiers(modifierText: string): Array<{ modifier: NABCGlyphModifier; variant?: number }> {
    const modifiers: Array<{ modifier: NABCGlyphModifier; variant?: number }> = [];
    let pos = 0;

    while (pos < modifierText.length) {
      const char = modifierText[pos];
      
      if (['S', 'G', 'M', '-', '>', '~'].includes(char)) {
        const modifier = char as NABCGlyphModifier;
        pos++;
        
        // Check for variant number
        const numberMatch = modifierText.substr(pos).match(/^\d+/);
        if (numberMatch) {
          modifiers.push({ 
            modifier, 
            variant: parseInt(numberMatch[0]) 
          });
          pos += numberMatch[0].length;
        } else {
          modifiers.push({ modifier });
        }
      } else {
        pos++;
      }
    }

    return modifiers;
  }

  /**
   * Parse subpunctis/prepunctis string
   */
  private parseSubPunctis(text: string): Array<{ type: 'su' | 'pp'; modifier?: NABCSubPunctisModifier; count: number }> {
    const result: Array<{ type: 'su' | 'pp'; modifier?: NABCSubPunctisModifier; count: number }> = [];
    const matches = text.match(/(su|pp)([tuvwxy])?(\d+)/g);
    
    if (matches) {
      for (const match of matches) {
        const parts = match.match(/(su|pp)([tuvwxy])?(\d+)/)!;
        result.push({
          type: parts[1] as 'su' | 'pp',
          modifier: parts[2] as NABCSubPunctisModifier,
          count: parseInt(parts[3])
        });
      }
    }

    return result;
  }

  /**
   * Validate a complex neume descriptor
   */
  private validateComplexNeume(neume: NABCComplexGlyph & { originalText: string }, offset: number): void {
    // Validate each component glyph
    for (const component of neume.components) {
      if (!NABC_BASIC_GLYPHS[component]) {
        this.createDiagnostic(
          offset,
          offset + component.length,
          `Unknown glyph code: ${component}`,
          DiagnosticSeverity.Error,
          'nabc-unknown-glyph'
        );
        continue;
      }

      const glyph = NABC_BASIC_GLYPHS[component];
      if (!glyph.fontFamilies.includes(this.context.font)) {
        this.createDiagnostic(
          offset,
          offset + component.length,
          `Glyph '${component}' not available in ${this.context.font} font`,
          DiagnosticSeverity.Error,
          'nabc-font-incompatibility'
        );
      }
    }

    // Validate modifiers
    if (neume.modifiers) {
      this.validateModifiers(neume.modifiers, neume.components[0], offset);
    }

    // Validate pitch descriptor
    if (neume.pitch) {
      this.validatePitch(neume.pitch, offset);
    }

    // Validate subpunctis
    if (neume.subpunctis) {
      this.validateSubPunctis(neume.subpunctis, offset);
    }

    // Validate significant letters
    if (neume.significantLetters) {
      this.validateSignificantLetters(neume.significantLetters, offset);
    }

    // Semantic validations
    this.validateSemanticConstraints(neume, offset);
  }

  /**
   * Validate glyph modifiers
   */
  private validateModifiers(modifiers: Array<{ modifier: NABCGlyphModifier; variant?: number }>, baseGlyph: string, offset: number): void {
    for (const mod of modifiers) {
      // Check if modifier is appropriate for glyph
      if (mod.modifier === NABCGlyphModifier.DIMINUTIVE && !['cl', 'po', 'tr'].includes(baseGlyph)) {
        this.createDiagnostic(
          offset,
          offset + 2,
          `Diminutive liquescence (~) rarely used with ${baseGlyph}`,
          DiagnosticSeverity.Warning,
          'nabc-unusual-modifier'
        );
      }

      // Check variant numbers
      if (mod.variant && mod.variant > 5) {
        this.createDiagnostic(
          offset,
          offset + 2,
          `Unusual modifier variant number: ${mod.variant}`,
          DiagnosticSeverity.Warning,
          'nabc-high-variant'
        );
      }
    }
  }

  /**
   * Validate pitch descriptor
   */
  private validatePitch(pitch: string, offset: number): void {
    if (!pitch.match(/^h[a-np]$/)) {
      this.createDiagnostic(
        offset,
        offset + pitch.length,
        `Invalid pitch descriptor: ${pitch}`,
        DiagnosticSeverity.Error,
        'nabc-invalid-pitch'
      );
    }
  }

  /**
   * Validate subpunctis/prepunctis
   */
  private validateSubPunctis(subpunctis: Array<{ type: 'su' | 'pp'; modifier?: NABCSubPunctisModifier; count: number }>, offset: number): void {
    for (const sp of subpunctis) {
      if (sp.count > 10) {
        this.createDiagnostic(
          offset,
          offset + 10,
          `Unusually high count for ${sp.type}: ${sp.count}`,
          DiagnosticSeverity.Warning,
          'nabc-high-subpunctis-count'
        );
      }

      if (sp.modifier && this.context.font === NABCFontFamily.LAON) {
        // Laon has different modifier rules
        const laonModifiers = ['n', 'q', 'z', 'x'];
        if (!laonModifiers.includes(sp.modifier)) {
          this.createDiagnostic(
            offset,
            offset + 10,
            `Modifier '${sp.modifier}' not available in Laon font`,
            DiagnosticSeverity.Error,
            'nabc-laon-modifier-error'
          );
        }
      }
    }
  }

  /**
   * Validate significant letters
   */
  private validateSignificantLetters(letters: Array<{ code: string; position: number }>, offset: number): void {
    for (const letter of letters) {
      const letterDef = ALL_SIGNIFICANT_LETTERS[letter.code];
      
      if (!letterDef) {
        this.createDiagnostic(
          offset,
          offset + letter.code.length,
          `Unknown significant letter: ${letter.code}`,
          DiagnosticSeverity.Error,
          'nabc-unknown-letter'
        );
        continue;
      }

      if (!letterDef.fontFamilies.includes(this.context.font)) {
        this.createDiagnostic(
          offset,
          offset + letter.code.length,
          `Letter '${letter.code}' not available in ${this.context.font} font`,
          DiagnosticSeverity.Error,
          'nabc-letter-font-incompatibility'
        );
      }

      if (!letterDef.positions.includes(letter.position)) {
        this.createDiagnostic(
          offset,
          offset + letter.code.length,
          `Position ${letter.position} not valid for letter '${letter.code}'`,
          DiagnosticSeverity.Error,
          'nabc-invalid-letter-position'
        );
      }

      // Tironian notes only in Laon
      if (letterDef.category === 'tironian' && this.context.font !== NABCFontFamily.LAON) {
        this.createDiagnostic(
          offset,
          offset + letter.code.length,
          `Tironian note '${letter.code}' only available in Laon font`,
          DiagnosticSeverity.Error,
          'nabc-tironian-font-error'
        );
      }
    }
  }

  /**
   * Validate semantic constraints
   */
  private validateSemanticConstraints(neume: NABCComplexGlyph & { originalText: string }, offset: number): void {
    // Check for compound glyphs with inconsistent pitches
    if (neume.components.length > 1 && !neume.pitch) {
      this.createDiagnostic(
        offset,
        offset + neume.originalText.length,
        'Compound glyph should specify pitch descriptor for all components',
        DiagnosticSeverity.Warning,
        'nabc-missing-compound-pitch'
      );
    }

    // Check for conflicting modifiers
    if (neume.modifiers) {
      const hasLiquescence = neume.modifiers.some(m => 
        m.modifier === NABCGlyphModifier.AUGMENTIVE || 
        m.modifier === NABCGlyphModifier.DIMINUTIVE
      );
      
      const hasEpisema = neume.modifiers.some(m => 
        m.modifier === NABCGlyphModifier.EPISEMA
      );

      if (hasLiquescence && hasEpisema) {
        this.createDiagnostic(
          offset,
          offset + neume.originalText.length,
          'Liquescence and episema modifiers rarely used together',
          DiagnosticSeverity.Information,
          'nabc-unusual-modifier-combination'
        );
      }
    }
  }

  /**
   * Add a diagnostic to the list
   */
  private createDiagnostic(
    start: number,
    end: number,
    message: string,
    severity: DiagnosticSeverity,
    code: string
  ): void {
    this.diagnostics.push({
      range: {
        start: { line: 0, character: start },
        end: { line: 0, character: end }
      },
      message,
      severity,
      code,
      source: 'gregorio-lsp-nabc'
    });
  }

  /**
   * Validate warning cases for NABC content
   */
  private validateWarningCases(content: string, startOffset: number): void {
    // Warning 1: Font-specific feature usage - Tironian notes in non-Laon fonts
    const tironianPattern = /lt[a-z]+\d/g;
    let match;
    
    while ((match = tironianPattern.exec(content)) !== null) {
      if (this.context.font !== NABCFontFamily.LAON) {
        this.createDiagnostic(
          startOffset + match.index,
          startOffset + match.index + match[0].length,
          'Tironian notes are only supported in Laon fonts (grelaon)',
          DiagnosticSeverity.Warning,
          'nabc-font-specific-tironian'
        );
      }

      // Warning 2: Invalid position for Tironian notes (position 5 not allowed)
      const positionMatch = match[0].match(/(\d)$/);
      if (positionMatch && positionMatch[1] === '5') {
        this.createDiagnostic(
          startOffset + match.index,
          startOffset + match.index + match[0].length,
          'Position 5 is not valid for Tironian notes',
          DiagnosticSeverity.Warning,
          'nabc-invalid-tironian-position'
        );
      }
    }

    // Warning 3: Excessive spacing adjustments
    const spacingPattern = /[\/`]{5,}/g;
    while ((match = spacingPattern.exec(content)) !== null) {
      this.createDiagnostic(
        startOffset + match.index,
        startOffset + match.index + match[0].length,
        'Excessive spacing adjustments may cause layout issues',
        DiagnosticSeverity.Warning,
        'nabc-excessive-spacing'
      );
    }

    // Warning 4: Unusual modifier combinations (more than 3 modifiers)
    const modifierPattern = /[a-z]{2}[SGM\->~]{4,}/g;
    while ((match = modifierPattern.exec(content)) !== null) {
      this.createDiagnostic(
        startOffset + match.index,
        startOffset + match.index + match[0].length,
        'Unusual number of modifiers - verify intended notation',
        DiagnosticSeverity.Warning,
        'nabc-unusual-modifiers'
      );
    }

    // Warning 5: Multiple significant letters at same position
    const significantPattern = /ls[a-z]+(\d)/g;
    const positions: Array<{ pos: number, start: number, end: number }> = [];
    
    while ((match = significantPattern.exec(content)) !== null) {
      const position = parseInt(match[1]);
      positions.push({
        pos: position,
        start: startOffset + match.index,
        end: startOffset + match.index + match[0].length
      });
    }

    // Check for duplicate positions
    const positionCounts = new Map<number, Array<{ start: number, end: number }>>();
    for (const item of positions) {
      if (!positionCounts.has(item.pos)) {
        positionCounts.set(item.pos, []);
      }
      positionCounts.get(item.pos)!.push({ start: item.start, end: item.end });
    }

    for (const [pos, items] of positionCounts.entries()) {
      if (items.length > 1) {
        for (const item of items) {
          this.createDiagnostic(
            item.start,
            item.end,
            `Multiple significant letters at position ${pos}`,
            DiagnosticSeverity.Warning,
            'nabc-duplicate-positions'
          );
        }
      }
    }
  }
}

/**
 * Validate NABC header
 */
export function validateNABCHeader(headerValue: string, offset: number): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  
  const match = headerValue.match(/^\s*(\d+)\s*$/);
  if (!match) {
    diagnostics.push({
      range: {
        start: { line: 0, character: offset },
        end: { line: 0, character: offset + headerValue.length }
      },
      message: 'nabc-lines must be a positive integer',
      severity: DiagnosticSeverity.Error,
      code: 'nabc-invalid-header',
      source: 'gregorio-lsp-nabc'
    });
    return diagnostics;
  }

  const count = parseInt(match[1]);
  if (count < 1 || count > 10) {
    diagnostics.push({
      range: {
        start: { line: 0, character: offset },
        end: { line: 0, character: offset + headerValue.length }
      },
      message: `nabc-lines should be between 1 and 10, got ${count}`,
      severity: count > 10 ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning,
      code: 'nabc-header-range',
      source: 'gregorio-lsp-nabc'
    });
  }

  return diagnostics;
}