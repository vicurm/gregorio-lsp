import { HoverParams, Hover, MarkupKind } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { GABCParser } from '../parser/gabc-parser';
import { GABCAnalyzer } from './gabc-analyzer';
import { HoverInfo, ASTNode, HeaderField, MusicElement, TextElement } from '../types';
import { nabcHoverProvider, NABCFontFamily } from '../nabc';

export class GABCHoverProvider {
  constructor(
    private parser: GABCParser,
    private analyzer: GABCAnalyzer
  ) {}

  public async provideHover(params: HoverParams): Promise<Hover | null> {
    try {
      // In a real implementation, we would get the document from the document manager
      const document = TextDocument.create(
        params.textDocument.uri,
        'gabc',
        1,
        '' // In real implementation, get actual content
      );

      const parseResult = this.parser.parse(document.getText());
      
      if (!parseResult.success || !parseResult.ast) {
        return null;
      }

      const element = this.analyzer.findElementAt(
        parseResult.ast,
        params.position.line,
        params.position.character
      );

      if (!element) {
        return null;
      }

      const hoverInfo = this.getHoverInfo(element, parseResult.ast);
      
      if (!hoverInfo) {
        return null;
      }

      return {
        contents: {
          kind: MarkupKind.Markdown,
          value: hoverInfo.content
        },
        range: hoverInfo.range
      };

    } catch (error) {
      return null;
    }
  }

  private getHoverInfo(element: ASTNode, ast: any): HoverInfo | null {
    switch (element.type) {
      case 'header_field':
        return this.getHeaderHoverInfo(element as HeaderField);
        
      case 'music_element':
        return this.getMusicHoverInfo(element as MusicElement, ast);
        
      case 'text_element':
        return this.getTextHoverInfo(element as TextElement);
        
      case 'syllable':
        return this.getSyllableHoverInfo(element as any, ast);
        
      default:
        return null;
    }
  }

  private getHeaderHoverInfo(header: HeaderField): HoverInfo {
    const name = header.name.toLowerCase();
    const value = header.value;

    let content = `**Header: ${header.name}**\n\n`;
    content += `Value: \`${value}\`\n\n`;

    switch (name) {
      case 'name':
        content += 'The title of this chant or liturgical piece.';
        break;
        
      case 'office-part':
        content += 'Specifies the liturgical function (e.g., Antiphon, Responsory, Hymn).';
        break;
        
      case 'mode':
        content += this.getModeDescription(value);
        break;
        
      case 'nabc-lines':
        content += this.getNabcLinesDescription(value);
        break;
        
      case 'initial-style':
        content += this.getInitialStyleDescription(value);
        break;
        
      case 'annotation':
        content += 'Annotation text that appears above the musical staff.';
        break;
        
      case 'book':
        content += 'Source book or manuscript reference.';
        break;
        
      case 'transcriber':
        content += 'Person who transcribed this chant into GABC notation.';
        break;
        
      default:
        content += `Custom header field.`;
    }

    return {
      content,
      range: header.range
    };
  }

  private getMusicHoverInfo(music: MusicElement, ast: any): HoverInfo {
    const isNabc = music.isNabc || false;
    const content = music.content;
    
    let hoverContent = `**${isNabc ? 'NABC' : 'GABC'} Notation**\n\n`;
    hoverContent += `Content: \`${content}\`\n\n`;

    if (isNabc) {
      hoverContent += this.analyzeNABCContent(content);
    } else {
      hoverContent += this.analyzeGABCContent(content);
    }

    // Add alternation context if nabc-lines is active
    const nabcConfig = this.parser.extractNABCConfiguration(ast);
    if (nabcConfig.enabled) {
      hoverContent += '\n\n---\n\n';
      hoverContent += `**Alternation Pattern**: ${nabcConfig.alternationPattern}\n`;
      hoverContent += `**NABC-lines Value**: ${nabcConfig.headerValue}`;
    }

    return {
      content: hoverContent,
      range: music.range
    };
  }

  private getTextHoverInfo(text: TextElement): HoverInfo {
    const content = text.content;
    
    let hoverContent = '**Text Element**\n\n';
    hoverContent += `Content: "${content}"\n\n`;
    
    // Analyze text content
    if (content.includes('<i>')) {
      hoverContent += '• Contains italic formatting\n';
    }
    if (content.includes('<b>')) {
      hoverContent += '• Contains bold formatting\n';
    }
    if (content.includes('<sc>')) {
      hoverContent += '• Contains small caps formatting\n';
    }
    
    const wordCount = content.trim().split(/\s+/).length;
    hoverContent += `• Word count: ${wordCount}`;

    return {
      content: hoverContent,
      range: text.range
    };
  }

  private getSyllableHoverInfo(syllable: any, ast: any): HoverInfo {
    let content = '**Syllable**\n\n';
    
    if (syllable.text && syllable.music) {
      content += `Text: "${syllable.text.content}"\n`;
      content += `Music: \`${syllable.music.content}\`\n`;
      content += `Type: ${syllable.music.isNabc ? 'NABC' : 'GABC'}\n`;
    } else if (syllable.text) {
      content += `Text only: "${syllable.text.content}"\n`;
      content += '⚠️ Missing music notation\n';
    } else if (syllable.music) {
      content += `Music only: \`${syllable.music.content}\`\n`;
      content += `Type: ${syllable.music.isNabc ? 'NABC' : 'GABC'}\n`;
      content += '⚠️ Missing text\n';
    } else {
      content += '⚠️ Empty syllable\n';
    }

    return {
      content,
      range: syllable.range
    };
  }

  private getModeDescription(value: string): string {
    const modes: Record<string, string> = {
      '1': 'Mode I (Dorian) - Final on D, dominant on A',
      '2': 'Mode II (Hypodorian) - Final on D, dominant on F',
      '3': 'Mode III (Phrygian) - Final on E, dominant on B',
      '4': 'Mode IV (Hypophrygian) - Final on E, dominant on A',
      '5': 'Mode V (Lydian) - Final on F, dominant on C',
      '6': 'Mode VI (Hypolydian) - Final on F, dominant on A',
      '7': 'Mode VII (Mixolydian) - Final on G, dominant on D',
      '8': 'Mode VIII (Hypomixolydian) - Final on G, dominant on C',
      'I': 'Mode I (Dorian) - Final on D, dominant on A',
      'II': 'Mode II (Hypodorian) - Final on D, dominant on F',
      'III': 'Mode III (Phrygian) - Final on E, dominant on B',
      'IV': 'Mode IV (Hypophrygian) - Final on E, dominant on A',
      'V': 'Mode V (Lydian) - Final on F, dominant on C',
      'VI': 'Mode VI (Hypolydian) - Final on F, dominant on A',
      'VII': 'Mode VII (Mixolydian) - Final on G, dominant on D',
      'VIII': 'Mode VIII (Hypomixolydian) - Final on G, dominant on C'
    };

    return modes[value] || `Mode ${value} (non-standard)`;
  }

  private getNabcLinesDescription(value: string): string {
    const numValue = parseInt(value, 10);
    
    if (isNaN(numValue) || numValue < 0) {
      return `Invalid nabc-lines value: ${value}. Expected non-negative integer.`;
    }
    
    switch (numValue) {
      case 0:
        return 'NABC alternation disabled. All snippets use GABC format.';
      case 1:
        return 'NABC alternation enabled. Snippets alternate between GABC and NABC (GABC, NABC, GABC, NABC, ...).';
      case 2:
        return 'NABC alternation with period 2. First snippet GABC, then alternating every 2 snippets.';
      default:
        return `NABC alternation with period ${numValue}. First snippet GABC, then alternating every ${numValue} snippets.`;
    }
  }

  private getInitialStyleDescription(value: string): string {
    switch (value) {
      case '0':
        return 'Normal initial letter (same size as body text)';
      case '1':
        return 'Large initial letter';
      case '2':
        return 'Two-line initial letter';
      default:
        return `Non-standard initial-style value: ${value}`;
    }
  }

  private analyzeGABCContent(content: string): string {
    let analysis = '**GABC Analysis:**\n\n';
    
    const pitches = content.match(/[a-m]/g);
    if (pitches) {
      analysis += `• Pitches: ${pitches.join(', ')}\n`;
      analysis += `• Pitch count: ${pitches.length}\n`;
      
      const uniquePitches = [...new Set(pitches)];
      analysis += `• Unique pitches: ${uniquePitches.join(', ')}\n`;
      
      const range = this.calculatePitchRange(pitches);
      analysis += `• Pitch range: ${range.lowest} - ${range.highest}\n`;
    }

    const shapes = content.match(/[~v<>oO\\/]/g);
    if (shapes) {
      analysis += `• Special shapes: ${shapes.join(', ')}\n`;
    }

    return analysis;
  }

  private analyzeNABCContent(content: string): string {
    let analysis = '**NABC Analysis:**\n\n';
    
    try {
      // Use our comprehensive NABC hover provider for detailed analysis
      nabcHoverProvider.setFont(NABCFontFamily.ST_GALL); // TODO: Get font from context
      
      // Try to detect and analyze NABC elements in the content
      const glyphMatches = content.match(/[a-z]{2}/g);
      if (glyphMatches) {
        analysis += '**Detected NABC elements:**\n';
        const analyzed = new Set<string>();
        
        for (const match of glyphMatches) {
          if (!analyzed.has(match)) {
            const hoverInfo = nabcHoverProvider.getHoverInfo(match);
            if (hoverInfo && typeof hoverInfo.contents === 'object' && 'value' in hoverInfo.contents) {
              const content = (hoverInfo.contents as any).value || '';
              analysis += `• \`${match}\`: ${content.split('\n')[0].replace(/[#*]/g, '')}\n`;
              analyzed.add(match);
            }
          }
        }
      }
      
      // Analyze modifiers
      const modifierMatches = content.match(/[a-z]{2}[SGM\-~>]/g);
      if (modifierMatches) {
        analysis += '\n**Glyph modifiers:**\n';
        for (const match of modifierMatches) {
          analysis += `• \`${match}\`: Glyph with modifier\n`;
        }
      }
      
      // Analyze significant letters
      const significantMatches = content.match(/ls[a-z]+\d/g);
      if (significantMatches) {
        analysis += '\n**Significant letters:**\n';
        for (const match of significantMatches) {
          const hoverInfo = nabcHoverProvider.getHoverInfo(match);
          if (hoverInfo && typeof hoverInfo.contents === 'object' && 'value' in hoverInfo.contents) {
            const content = (hoverInfo.contents as any).value || '';
            analysis += `• \`${match}\`: ${content.split('\n')[0].replace(/[#*]/g, '')}\n`;
          }
        }
      }
      
      // Analyze Tironian notes
      const tironianMatches = content.match(/lt[a-z]+\d/g);
      if (tironianMatches) {
        analysis += '\n**Tironian notes:**\n';
        for (const match of tironianMatches) {
          const hoverInfo = nabcHoverProvider.getHoverInfo(match);
          if (hoverInfo && typeof hoverInfo.contents === 'object' && 'value' in hoverInfo.contents) {
            const content = (hoverInfo.contents as any).value || '';
            analysis += `• \`${match}\`: ${content.split('\n')[0].replace(/[#*]/g, '')}\n`;
          }
        }
      }
      
      // Analyze spacing
      const spacingMatches = content.match(/[\/`]+/g);
      if (spacingMatches) {
        analysis += '\n**Spacing adjustments:**\n';
        for (const match of spacingMatches) {
          const description = match.includes('//') ? 'Large space right' :
                           match.includes('/') ? 'Inter space right' :
                           match.includes('``') ? 'Large space left' : 'Inter space left';
          analysis += `• \`${match}\`: ${description}\n`;
        }
      }
      
    } catch (error) {
      // Fallback to basic analysis
      analysis += 'Basic NABC content analysis:\n';
      analysis += `• Content length: ${content.length} characters\n`;
      analysis += `• Contains glyphs: ${/[a-z]{2}/.test(content) ? 'Yes' : 'No'}\n`;
    }
    
    return analysis;
  }

  private calculatePitchRange(pitches: string[]): { lowest: string; highest: string } {
    if (pitches.length === 0) {
      return { lowest: '', highest: '' };
    }

    const values = pitches.map(p => p.charCodeAt(0));
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return {
      lowest: String.fromCharCode(min),
      highest: String.fromCharCode(max)
    };
  }
}