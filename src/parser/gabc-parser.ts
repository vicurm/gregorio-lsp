import Parser from 'tree-sitter';
import { Range, Position } from 'vscode-languageserver-types';
import { 
  ParseResult, 
  GABCDocument, 
  HeaderField, 
  MusicSection, 
  Syllable, 
  TextElement, 
  MusicElement, 
  ASTNode, 
  ParseError,
  NABCConfiguration,
  ErrorCode
} from '../types';

// Placeholder for tree-sitter-gregorio language
// In a real implementation, this would be the compiled tree-sitter language
const gregorioLanguage: any = null; // TODO: Load tree-sitter-gregorio

export class GABCParser {
  private parser: Parser | null = null;

  constructor() {
    try {
      this.parser = new Parser();
      if (gregorioLanguage) {
        this.parser.setLanguage(gregorioLanguage);
      }
    } catch (error) {
      // Tree-sitter not available, will use fallback parsing
      console.warn('Tree-sitter not available, using fallback parsing');
    }
  }

  public parse(text: string): ParseResult {
    try {
      // If tree-sitter-gregorio is not available, use fallback parsing
      if (!gregorioLanguage || !this.parser) {
        return this.fallbackParse(text);
      }

      const tree = this.parser.parse(text);
      
      if (tree.rootNode.hasError) {
        return {
          success: false,
          errors: this.extractParseErrors(tree.rootNode, text)
        };
      }

      const ast = this.convertToAST(tree.rootNode, text);
      
      return {
        success: true,
        ast: ast as GABCDocument,
        errors: []
      };
    } catch (error) {
      return {
        success: false,
        errors: [{
          message: `Parse error: ${error}`,
          range: this.createRange(0, 0, 0, text.length),
          severity: 1 // Error
        }]
      };
    }
  }

  private fallbackParse(text: string): ParseResult {
    try {
      const lines = text.split('\n');
      const headers: HeaderField[] = [];
      let musicStartLine = 0;

      // Parse headers
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line === '%%') {
          musicStartLine = i + 1;
          break;
        }
        
        if (line && !line.startsWith('%')) {
          const colonIndex = line.indexOf(':');
          if (colonIndex > 0) {
            const name = line.substring(0, colonIndex).trim();
            const value = line.substring(colonIndex + 1).trim();
            
            headers.push({
              type: 'header_field',
              name,
              value,
              range: this.createRange(i, 0, i, line.length)
            });
          }
        }
      }

      // Parse music section
      const musicText = lines.slice(musicStartLine).join('\n');
      const musicSection = this.parseMusicSection(musicText, musicStartLine);

      const ast: GABCDocument = {
        type: 'document',
        range: this.createRange(0, 0, lines.length - 1, lines[lines.length - 1]?.length || 0),
        headers,
        music: musicSection
      };

      return {
        success: true,
        ast,
        errors: []
      };
    } catch (error) {
      return {
        success: false,
        errors: [{
          message: `Fallback parse error: ${error}`,
          range: this.createRange(0, 0, 0, text.length),
          severity: 1
        }]
      };
    }
  }

  private parseMusicSection(musicText: string, startLine: number): MusicSection {
    const syllables: Syllable[] = [];
    
    // Simple regex-based parsing for syllables
    // This is a simplified implementation - a real parser would be more sophisticated
    const syllablePattern = /([^()]*)\(([^)]*)\)/g;
    let match;
    let position = 0;
    let lineOffset = 0;
    let currentLine = startLine;

    while ((match = syllablePattern.exec(musicText)) !== null) {
      const fullMatch = match[0];
      const textContent = match[1].trim();
      const musicContent = match[2];

      // Calculate position
      const matchStart = match.index;
      const matchEnd = matchStart + fullMatch.length;

      // Update line counting
      const textBefore = musicText.substring(position, matchStart);
      const newlines = (textBefore.match(/\n/g) || []).length;
      currentLine += newlines;
      const lineStart = textBefore.lastIndexOf('\n') + 1;
      const columnStart = matchStart - lineStart;

      const syllable: Syllable = {
        type: 'syllable',
        range: this.createRange(currentLine, columnStart, currentLine, columnStart + fullMatch.length),
        text: textContent ? {
          type: 'text_element',
          content: textContent,
          range: this.createRange(currentLine, columnStart, currentLine, columnStart + textContent.length)
        } : undefined,
        music: {
          type: 'music_element',
          content: musicContent,
          range: this.createRange(currentLine, columnStart + textContent.length + 1, currentLine, matchEnd - 1),
          isNabc: this.detectNABC(musicContent)
        }
      };

      syllables.push(syllable);
      position = matchEnd;
    }

    return {
      type: 'music_section',
      range: this.createRange(startLine, 0, currentLine, 0),
      syllables
    };
  }

  private detectNABC(musicContent: string): boolean {
    // Detect NABC notation patterns
    const nabcPatterns = [
      /[1-4][a-m]/,  // pitch descriptors
      /n[0-9]/,      // neume descriptors
      /g[a-z]/,      // glyph descriptors
      /e[a-z]/       // episema descriptors
    ];

    return nabcPatterns.some(pattern => pattern.test(musicContent));
  }

  public extractNABCConfiguration(ast: GABCDocument): NABCConfiguration {
    const nabcLinesHeader = ast.headers.find(h => h.name.toLowerCase() === 'nabc-lines');
    
    if (!nabcLinesHeader) {
      return {
        enabled: false,
        alternationPattern: 'gabc'
      };
    }

    const value = nabcLinesHeader.value.toLowerCase();
    
    return {
      enabled: true,
      headerValue: nabcLinesHeader.value,
      alternationPattern: value === '1' ? 'nabc' : 'gabc'
    };
  }

  public validateAlternation(ast: GABCDocument, nabcConfig: NABCConfiguration): ParseError[] {
    const errors: ParseError[] = [];
    
    if (!nabcConfig.enabled) {
      return errors;
    }

    let expectedNabc = nabcConfig.alternationPattern === 'nabc';

    for (const syllable of ast.music.syllables) {
      if (syllable.music) {
        const isNabc = syllable.music.isNabc || false;
        
        if (isNabc !== expectedNabc) {
          errors.push({
            message: `Expected ${expectedNabc ? 'NABC' : 'GABC'} notation but found ${isNabc ? 'NABC' : 'GABC'}`,
            range: syllable.music.range,
            severity: 1, // Error
            code: ErrorCode.ALTERNATION_VIOLATION
          } as any);
        }

        // Alternate for next syllable
        expectedNabc = !expectedNabc;
      }
    }

    return errors;
  }

  private convertToAST(node: Parser.SyntaxNode, text: string): ASTNode {
    // This would convert tree-sitter nodes to our AST format
    // Placeholder implementation
    return {
      type: node.type,
      range: this.nodeToRange(node)
    };
  }

  private extractParseErrors(node: Parser.SyntaxNode, text: string): ParseError[] {
    const errors: ParseError[] = [];
    
    if (node.hasError) {
      if (node.type === 'ERROR') {
        errors.push({
          message: 'Syntax error',
          range: this.nodeToRange(node),
          severity: 1
        });
      }

      for (const child of node.children) {
        errors.push(...this.extractParseErrors(child, text));
      }
    }

    return errors;
  }

  private nodeToRange(node: Parser.SyntaxNode): Range {
    return this.createRange(
      node.startPosition.row,
      node.startPosition.column,
      node.endPosition.row,
      node.endPosition.column
    );
  }

  private createRange(startLine: number, startChar: number, endLine: number, endChar: number): Range {
    return {
      start: Position.create(startLine, startChar),
      end: Position.create(endLine, endChar)
    };
  }
}