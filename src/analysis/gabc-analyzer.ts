import { GABCParser } from '../parser/gabc-parser';
import {
  GABCDocument,
  SemanticInfo,
  HeaderField,
  NABCConfiguration,
  MusicElement,
  TextElement,
  Syllable,
  ASTNode
} from '../types';

export class GABCAnalyzer {
  constructor(private parser: GABCParser) {}

  public analyze(ast: GABCDocument): SemanticInfo {
    const headers = this.extractHeaders(ast);
    const nabcConfig = this.parser.extractNABCConfiguration(ast);
    const musicElements = this.extractMusicElements(ast);
    const textElements = this.extractTextElements(ast);
    
    return {
      headers,
      nabcConfig,
      syllableCount: ast.music.syllables.length,
      musicElements,
      textElements
    };
  }

  public findElementAt(ast: GABCDocument, line: number, character: number): ASTNode | undefined {
    // Find the AST node at the given position
    return this.findNodeAtPosition(ast, line, character);
  }

  public getContextAt(ast: GABCDocument, line: number, character: number) {
    const element = this.findElementAt(ast, line, character);
    const nabcConfig = this.parser.extractNABCConfiguration(ast);
    
    return {
      currentElement: element,
      nabcMode: this.isInNABCContext(element, nabcConfig),
      inHeader: this.isInHeader(element),
      inMusic: this.isInMusic(element),
      inText: this.isInText(element)
    };
  }

  public getSyllableStatistics(ast: GABCDocument) {
    const syllables = ast.music.syllables;
    
    return {
      total: syllables.length,
      withText: syllables.filter(s => s.text).length,
      withMusic: syllables.filter(s => s.music).length,
      withBoth: syllables.filter(s => s.text && s.music).length,
      empty: syllables.filter(s => !s.text && !s.music).length,
      nabcSyllables: syllables.filter(s => s.music?.isNabc).length,
      gabcSyllables: syllables.filter(s => s.music && !s.music.isNabc).length
    };
  }

  public getHeaderInfo(ast: GABCDocument, headerName: string): HeaderField | undefined {
    return ast.headers.find(h => h.name.toLowerCase() === headerName.toLowerCase());
  }

  public getAllMelodies(ast: GABCDocument) {
    return ast.music.syllables
      .map(s => s.music?.content)
      .filter(content => content)
      .join(' ');
  }

  public getAllText(ast: GABCDocument) {
    return ast.music.syllables
      .map(s => s.text?.content)
      .filter(content => content)
      .join(' ');
  }

  public validateAlternationConsistency(ast: GABCDocument): {
    isConsistent: boolean;
    expectedPattern: 'gabc' | 'nabc';
    violations: Array<{ syllable: Syllable; expected: boolean; actual: boolean }>;
  } {
    const nabcConfig = this.parser.extractNABCConfiguration(ast);
    const violations: Array<{ syllable: Syllable; expected: boolean; actual: boolean }> = [];
    
    if (!nabcConfig.enabled) {
      return {
        isConsistent: true,
        expectedPattern: 'gabc',
        violations: []
      };
    }

    let expectedNabc = nabcConfig.alternationPattern === 'nabc';

    for (const syllable of ast.music.syllables) {
      if (syllable.music) {
        const actualNabc = syllable.music.isNabc || false;
        
        if (actualNabc !== expectedNabc) {
          violations.push({
            syllable,
            expected: expectedNabc,
            actual: actualNabc
          });
        }

        expectedNabc = !expectedNabc;
      }
    }

    return {
      isConsistent: violations.length === 0,
      expectedPattern: nabcConfig.alternationPattern,
      violations
    };
  }

  public extractMelodyPatterns(ast: GABCDocument) {
    const patterns = {
      ascending: [] as MusicElement[],
      descending: [] as MusicElement[],
      repeated: [] as MusicElement[],
      complex: [] as MusicElement[]
    };

    for (const syllable of ast.music.syllables) {
      if (syllable.music) {
        const pattern = this.analyzeMelodyPattern(syllable.music);
        patterns[pattern].push(syllable.music);
      }
    }

    return patterns;
  }

  private extractHeaders(ast: GABCDocument): Map<string, HeaderField> {
    const headers = new Map<string, HeaderField>();
    
    for (const header of ast.headers) {
      headers.set(header.name.toLowerCase(), header);
    }
    
    return headers;
  }

  private extractMusicElements(ast: GABCDocument): MusicElement[] {
    return ast.music.syllables
      .map(s => s.music)
      .filter((music): music is MusicElement => music !== undefined);
  }

  private extractTextElements(ast: GABCDocument): TextElement[] {
    return ast.music.syllables
      .map(s => s.text)
      .filter((text): text is TextElement => text !== undefined);
  }

  private findNodeAtPosition(node: ASTNode, line: number, character: number): ASTNode | undefined {
    // Check if position is within this node's range
    const range = node.range;
    
    if (line < range.start.line || line > range.end.line) {
      return undefined;
    }
    
    if (line === range.start.line && character < range.start.character) {
      return undefined;
    }
    
    if (line === range.end.line && character > range.end.character) {
      return undefined;
    }

    // Check children first (more specific matches)
    if (node.children) {
      for (const child of node.children) {
        const found = this.findNodeAtPosition(child, line, character);
        if (found) {
          return found;
        }
      }
    }

    return node;
  }

  private isInNABCContext(element: ASTNode | undefined, nabcConfig: NABCConfiguration): boolean {
    if (!element || !nabcConfig.enabled) {
      return false;
    }
    
    return element.type === 'music_element' && 
           'isNabc' in element && 
           (element as any).isNabc === true;
  }

  private isInHeader(element: ASTNode | undefined): boolean {
    return element?.type === 'header_field';
  }

  private isInMusic(element: ASTNode | undefined): boolean {
    return element?.type === 'music_element' || 
           element?.type === 'syllable';
  }

  private isInText(element: ASTNode | undefined): boolean {
    return element?.type === 'text_element';
  }

  private analyzeMelodyPattern(music: MusicElement): 'ascending' | 'descending' | 'repeated' | 'complex' {
    const content = music.content;
    
    if (!content || content.length < 2) {
      return 'complex';
    }

    // Extract pitch letters
    const pitches = content.match(/[a-m]/g);
    if (!pitches || pitches.length < 2) {
      return 'complex';
    }

    // Convert to numeric values for comparison
    const values = pitches.map(p => p.charCodeAt(0) - 'a'.charCodeAt(0));
    
    let ascending = 0;
    let descending = 0;
    let repeated = 0;

    for (let i = 1; i < values.length; i++) {
      if (values[i] > values[i - 1]) {
        ascending++;
      } else if (values[i] < values[i - 1]) {
        descending++;
      } else {
        repeated++;
      }
    }

    const total = ascending + descending + repeated;
    
    if (repeated / total > 0.5) {
      return 'repeated';
    } else if (ascending / total > 0.7) {
      return 'ascending';
    } else if (descending / total > 0.7) {
      return 'descending';
    } else {
      return 'complex';
    }
  }
}