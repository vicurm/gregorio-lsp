import { 
  CompletionItem, 
  CompletionItemKind, 
  Hover, 
  MarkupContent, 
  MarkupKind 
} from 'vscode-languageserver';

import { 
  NABCFontFamily, 
  NABCCompletionItem, 
  NABCHoverInfo,
  NABCGlyphModifier,
  NABCSpacingType 
} from './types';

import { NABC_BASIC_GLYPHS, getGlyphsByFont } from './glyphs';
import { ALL_SIGNIFICANT_LETTERS, getSignificantLettersByFont } from './significantLetters';

/**
 * NABC Autocomplete and Hover Provider
 * Provides intelligent completions and hover information for NABC notation
 */

export class NABCCompletionProvider {
  private currentFont: NABCFontFamily = NABCFontFamily.ST_GALL;

  setFont(font: NABCFontFamily): void {
    this.currentFont = font;
  }

  /**
   * Get completion items for basic glyph codes
   */
  getGlyphCompletions(): CompletionItem[] {
    const glyphs = getGlyphsByFont(this.currentFont);
    
    return glyphs.map(glyph => ({
      label: glyph.code,
      kind: CompletionItemKind.Function,
      detail: glyph.name,
      documentation: {
        kind: MarkupKind.Markdown,
        value: this.formatGlyphDocumentation(glyph)
      },
      insertText: glyph.code,
      sortText: `1_${glyph.category}_${glyph.code}`, // Prioritize by category
      filterText: `${glyph.code} ${glyph.name}`,
      data: {
        type: 'glyph',
        code: glyph.code,
        font: this.currentFont
      }
    }));
  }

  /**
   * Get completion items for glyph modifiers
   */
  getModifierCompletions(): CompletionItem[] {
    const modifiers = [
      { 
        code: NABCGlyphModifier.MARK, 
        name: 'Mark Modification',
        description: 'Modification of the mark (S, S1, S2, ...)',
        examples: ['clS', 'peS', 'toS1']
      },
      { 
        code: NABCGlyphModifier.GROUPING, 
        name: 'Grouping Modification', 
        description: 'Modification of grouping (neumatic break)',
        examples: ['clG', 'peG', 'toG1']
      },
      { 
        code: NABCGlyphModifier.MELODIC, 
        name: 'Melodic Modification',
        description: 'Melodic modification (M, M1, M2, ...)',
        examples: ['clM', 'toM', 'saM1']
      },
      { 
        code: NABCGlyphModifier.EPISEMA, 
        name: 'Episema',
        description: 'Addition of horizontal episema stroke',
        examples: ['vi-', 'cl-', 'pe-1']
      },
      { 
        code: NABCGlyphModifier.AUGMENTIVE, 
        name: 'Augmentive Liquescence',
        description: 'Lengthening liquescence (>, >1, >2, ...)',
        examples: ['cl>', 'pe>1', 'to>']
      },
      { 
        code: NABCGlyphModifier.DIMINUTIVE, 
        name: 'Diminutive Liquescence',
        description: 'Shortening liquescence (~)',
        examples: ['cl~', 'po~', 'tr~']
      }
    ];

    return modifiers.map(modifier => ({
      label: modifier.code,
      kind: CompletionItemKind.Operator,
      detail: modifier.name,
      documentation: {
        kind: MarkupKind.Markdown,
        value: this.formatModifierDocumentation(modifier)
      },
      insertText: modifier.code,
      sortText: `2_modifier_${modifier.code}`,
      data: {
        type: 'modifier',
        code: modifier.code
      }
    }));
  }

  /**
   * Get completion items for significant letters
   */
  getSignificantLetterCompletions(): CompletionItem[] {
    const letters = getSignificantLettersByFont(this.currentFont);
    
    return letters.map(letter => ({
      label: letter.fullCode,
      kind: CompletionItemKind.Constant,
      detail: letter.meaning,
      documentation: {
        kind: MarkupKind.Markdown,
        value: this.formatLetterDocumentation(letter)
      },
      insertText: letter.fullCode,
      sortText: `3_${letter.category}_${letter.code}`,
      filterText: `${letter.fullCode} ${letter.meaning} ${letter.description}`,
      data: {
        type: 'significantLetter',
        code: letter.fullCode,
        font: this.currentFont
      }
    }));
  }

  /**
   * Get completion items for spacing adjustments
   */
  getSpacingCompletions(): CompletionItem[] {
    const spacings = [
      { 
        code: '//', 
        name: 'Large Space Right',
        description: 'Move right by nabclargerspace'
      },
      { 
        code: '/', 
        name: 'Inter Space Right', 
        description: 'Move right by nabcinterelementspace'
      },
      { 
        code: '``', 
        name: 'Large Space Left',
        description: 'Move left by nabclargerspace'
      },
      { 
        code: '`', 
        name: 'Inter Space Left',
        description: 'Move left by nabcinterelementspace'
      }
    ];

    return spacings.map(spacing => ({
      label: spacing.code,
      kind: CompletionItemKind.Keyword,
      detail: spacing.name,
      documentation: {
        kind: MarkupKind.Markdown,
        value: `**${spacing.name}**\n\n${spacing.description}`
      },
      insertText: spacing.code,
      sortText: `4_spacing_${spacing.code}`,
      data: {
        type: 'spacing',
        code: spacing.code
      }
    }));
  }

  /**
   * Get completion items for pitch descriptors
   */
  getPitchCompletions(): CompletionItem[] {
    const pitches = 'abcdefghijklmnp'.split('').map((letter, index) => ({
      label: `h${letter}`,
      kind: CompletionItemKind.Value,
      detail: `Pitch level ${letter}`,
      documentation: {
        kind: MarkupKind.Markdown,
        value: `**Pitch Descriptor: h${letter}**\n\nSets the vertical position of the neume to level ${letter}.\n\n*Default: hf*`
      },
      insertText: `h${letter}`,
      sortText: `5_pitch_${index.toString().padStart(2, '0')}`,
      data: {
        type: 'pitch',
        code: `h${letter}`
      }
    }));

    return pitches;
  }

  /**
   * Get completion items for subpunctis/prepunctis
   */
  getSubPunctisCompletions(): CompletionItem[] {
    const types = [
      { code: 'su', name: 'Subpunctis', description: 'Points below the neume' },
      { code: 'pp', name: 'Prepunctis', description: 'Points before/above the neume' }
    ];

    const modifiers = [
      { code: 't', name: 'Tractulus', description: 'Small horizontal stroke' },
      { code: 'u', name: 'Tractulus with Episema', description: 'Tractulus with horizontal line' },
      { code: 'v', name: 'Tractulus with Double Episema', description: 'Tractulus with double line' },
      { code: 'w', name: 'Gravis', description: 'Descending stroke' },
      { code: 'x', name: 'Liquescens Stropha', description: 'Liquid stropha' },
      { code: 'y', name: 'Gravis with Episema', description: 'Gravis with horizontal line' }
    ];

    const completions: CompletionItem[] = [];

    // Basic su/pp with numbers
    for (const type of types) {
      for (let i = 1; i <= 5; i++) {
        completions.push({
          label: `${type.code}${i}`,
          kind: CompletionItemKind.Constructor,
          detail: `${type.name} (${i})`,
          documentation: {
            kind: MarkupKind.Markdown,
            value: `**${type.name}**\n\n${type.description}\n\nCount: ${i}`
          },
          insertText: `${type.code}${i}`,
          sortText: `6_${type.code}_${i}`,
          data: {
            type: 'subpunctis',
            code: `${type.code}${i}`
          }
        });
      }

      // With modifiers
      for (const modifier of modifiers) {
        for (let i = 1; i <= 3; i++) {
          completions.push({
            label: `${type.code}${modifier.code}${i}`,
            kind: CompletionItemKind.Constructor,
            detail: `${type.name} ${modifier.name} (${i})`,
            documentation: {
              kind: MarkupKind.Markdown,
              value: `**${type.name} with ${modifier.name}**\n\n${type.description} using ${modifier.description}\n\nCount: ${i}`
            },
            insertText: `${type.code}${modifier.code}${i}`,
            sortText: `6_${type.code}_${modifier.code}_${i}`,
            data: {
              type: 'subpunctis',
              code: `${type.code}${modifier.code}${i}`
            }
          });
        }
      }
    }

    return completions;
  }

  /**
   * Get all completion items based on context
   */
  getAllCompletions(): CompletionItem[] {
    return [
      ...this.getGlyphCompletions(),
      ...this.getModifierCompletions(),
      ...this.getSignificantLetterCompletions(),
      ...this.getSpacingCompletions(),
      ...this.getPitchCompletions(),
      ...this.getSubPunctisCompletions()
    ];
  }

  private formatGlyphDocumentation(glyph: any): string {
    let doc = `**${glyph.name}** (\`${glyph.code}\`)\n\n`;
    doc += `${glyph.description}\n\n`;
    doc += `**Category:** ${glyph.category}\n`;
    doc += `**Font families:** ${glyph.fontFamilies.join(', ')}\n`;
    
    if (glyph.manuscriptSources && glyph.manuscriptSources.length > 0) {
      doc += `**Sources:** ${glyph.manuscriptSources.join(', ')}\n`;
    }

    return doc;
  }

  private formatModifierDocumentation(modifier: any): string {
    let doc = `**${modifier.name}** (\`${modifier.code}\`)\n\n`;
    doc += `${modifier.description}\n\n`;
    
    if (modifier.examples && modifier.examples.length > 0) {
      doc += `**Examples:**\n`;
      modifier.examples.forEach((example: string) => {
        doc += `- \`${example}\`\n`;
      });
    }

    return doc;
  }

  private formatLetterDocumentation(letter: any): string {
    let doc = `**${letter.meaning}** (\`${letter.fullCode}\`)\n\n`;
    doc += `${letter.description}\n\n`;
    doc += `**Category:** ${letter.category}\n`;
    doc += `**Font families:** ${letter.fontFamilies.join(', ')}\n`;
    doc += `**Valid positions:** ${letter.positions.join(', ')}\n`;

    return doc;
  }
}

export class NABCHoverProvider {
  private currentFont: NABCFontFamily = NABCFontFamily.ST_GALL;

  setFont(font: NABCFontFamily): void {
    this.currentFont = font;
  }

  /**
   * Get hover information for a NABC element
   */
  getHoverInfo(element: string): Hover | null {
    // Try to match as basic glyph
    const glyph = NABC_BASIC_GLYPHS[element];
    if (glyph && glyph.fontFamilies.includes(this.currentFont)) {
      return {
        contents: {
          kind: MarkupKind.Markdown,
          value: this.formatGlyphHover(glyph)
        }
      };
    }

    // Try to match as significant letter
    const letter = ALL_SIGNIFICANT_LETTERS[element];
    if (letter && letter.fontFamilies.includes(this.currentFont)) {
      return {
        contents: {
          kind: MarkupKind.Markdown,
          value: this.formatLetterHover(letter)
        }
      };
    }

    // Try to parse complex glyph with modifiers
    const complexHover = this.parseComplexGlyph(element);
    if (complexHover) {
      return complexHover;
    }

    return null;
  }

  private formatGlyphHover(glyph: any): string {
    let content = `### ${glyph.name}\n\n`;
    content += `**Code:** \`${glyph.code}\`\n\n`;
    content += `${glyph.description}\n\n`;
    content += `**Category:** ${glyph.category}\n\n`;
    
    if (glyph.manuscriptSources && glyph.manuscriptSources.length > 0) {
      content += `**Manuscript sources:** ${glyph.manuscriptSources.slice(0, 3).join(', ')}`;
      if (glyph.manuscriptSources.length > 3) {
        content += ` (+${glyph.manuscriptSources.length - 3} more)`;
      }
      content += '\n\n';
    }

    content += `**Font compatibility:** ${glyph.fontFamilies.join(', ')}`;
    
    return content;
  }

  private formatLetterHover(letter: any): string {
    let content = `### ${letter.meaning}\n\n`;
    content += `**Code:** \`${letter.fullCode}\`\n\n`;
    content += `${letter.description}\n\n`;
    content += `**Category:** ${letter.category}\n\n`;
    content += `**Valid positions:** ${letter.positions.join(', ')}\n\n`;
    
    if (letter.category === 'tironian') {
      content += '*Tironian note - only available in Laon font*\n\n';
    }

    content += `**Font compatibility:** ${letter.fontFamilies.join(', ')}`;
    
    return content;
  }

  private parseComplexGlyph(element: string): Hover | null {
    // Parse glyph with modifiers (e.g., "cl>1", "peS", "vi-")
    const glyphMatch = element.match(/^([a-z]{2})([SGM\-~>])(\d*)$/);
    if (glyphMatch) {
      const [, glyphCode, modifier, variant] = glyphMatch;
      const glyph = NABC_BASIC_GLYPHS[glyphCode];
      
      if (glyph && glyph.fontFamilies.includes(this.currentFont)) {
        const modifierNames: Record<string, string> = {
          'S': 'Mark modification',
          'G': 'Grouping modification', 
          'M': 'Melodic modification',
          '-': 'Episema',
          '>': 'Augmentive liquescence',
          '~': 'Diminutive liquescence'
        };

        let content = `### ${glyph.name} with ${modifierNames[modifier]}\n\n`;
        content += `**Code:** \`${element}\`\n\n`;
        content += `Base glyph: **${glyph.name}** (\`${glyphCode}\`)\n\n`;
        content += `${glyph.description}\n\n`;
        content += `**Modifier:** ${modifierNames[modifier]}`;
        
        if (variant) {
          content += ` (variant ${variant})`;
        }
        
        return {
          contents: {
            kind: MarkupKind.Markdown,
            value: content
          }
        };
      }
    }

    return null;
  }
}

// Export singleton instances
export const nabcCompletionProvider = new NABCCompletionProvider();
export const nabcHoverProvider = new NABCHoverProvider();