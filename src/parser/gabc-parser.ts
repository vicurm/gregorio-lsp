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
  ErrorCode,
  GREGORIO_ERROR_MESSAGES
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
      
      // Run NABC alternation validation
      const nabcConfig = this.extractNABCConfiguration(ast as GABCDocument);
      const alternationErrors = this.validateAlternation(ast as GABCDocument, nabcConfig);
      
      return {
        success: alternationErrors.length === 0,
        ast: ast as GABCDocument,
        errors: alternationErrors
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

      // Run NABC alternation validation
      const nabcConfig = this.extractNABCConfiguration(ast);
      const alternationErrors = this.validateAlternation(ast, nabcConfig);

      return {
        success: alternationErrors.length === 0,
        ast,
        errors: alternationErrors
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

    const value = parseInt(nabcLinesHeader.value, 10);
    
    return {
      enabled: value > 0,
      headerValue: nabcLinesHeader.value,
      alternationPattern: value > 0 ? 'nabc' : 'gabc'
    };
  }

  public validateAlternation(ast: GABCDocument, nabcConfig: NABCConfiguration): ParseError[] {
    const errors: ParseError[] = [];
    
    const alternationPeriod = parseInt((nabcConfig.headerValue || '0').replace(/;$/, ''), 10);
    
    for (const syllable of ast.music.syllables) {
      if (syllable.music) {
        const noteGroups = this.parseNoteGroups(syllable.music.content);
        
        // Special case: when nabc-lines is absent/0, "|" characters are invalid
        if (alternationPeriod === 0) {
          for (const group of noteGroups) {
            if (group.snippets.length > 1) {
              errors.push({
                message: GREGORIO_ERROR_MESSAGES.PIPE_WITHOUT_NABC_LINES,
                range: syllable.music.range,
                severity: 1, // Error
                code: ErrorCode.INVALID_PIPE_WITHOUT_NABC
              } as any);
            }
            
            // Also check for NABC patterns in GABC-only mode
            for (const snippet of group.snippets) {
              if (this.isNabcSnippet(snippet)) {
                errors.push({
                  message: GREGORIO_ERROR_MESSAGES.NABC_WITHOUT_ALTERNATION,
                  range: syllable.music.range,
                  severity: 1, // Error
                  code: ErrorCode.NABC_IN_GABC_ONLY_MODE
                } as any);
              }
            }
          }
        } else {
          // Normal alternation validation when nabc-lines is specified
          for (const group of noteGroups) {
            const snippets = group.snippets;
            
            for (let i = 0; i < snippets.length; i++) {
              const shouldBeNabc = this.shouldSnippetBeNabc(i, alternationPeriod);
              const isNabc = this.isNabcSnippet(snippets[i]);
              
              if (shouldBeNabc !== isNabc) {
                errors.push({
                  message: `Expected ${shouldBeNabc ? 'NABC' : 'GABC'} notation but found ${isNabc ? 'NABC' : 'GABC'} in group snippet ${i + 1}`,
                  range: syllable.music.range,
                  severity: 1, // Error
                  code: ErrorCode.ALTERNATION_VIOLATION
                } as any);
              }
            }
          }
        }
      }
    }

    return errors;
  }

  private parseNoteGroups(musicContent: string): { snippets: string[] }[] {
    // The musicContent passed here is already the content of a single group (inside parentheses)
    // We need to split it by "|" to get individual snippets
    const groups: { snippets: string[] }[] = [];
    
    let snippets: string[];
    
    if (musicContent.includes('|')) {
      // Split by | to get individual snippets within the group
      snippets = musicContent.split('|');
    } else {
      // Single snippet in this group
      snippets = [musicContent];
    }
    
    groups.push({ snippets });
    
    return groups;
  }

  private parseSnippets(musicContent: string): string[] {
    // Legacy method - extract all snippets across all groups
    // Used for compatibility with existing code
    const snippets: string[] = [];
    const groups = this.parseNoteGroups(musicContent);
    
    for (const group of groups) {
      snippets.push(...group.snippets);
    }
    
    return snippets;
  }

  private shouldSnippetBeNabc(snippetIndex: number, alternationPeriod: number): boolean {
    // When nabc-lines is absent or 0, all content is GABC and "|" characters are invalid
    if (alternationPeriod === 0) {
      return false; // All content treated as single GABC snippet
    }
    
    // Per-group alternation logic (nabc-lines starts from 1):
    // - Snippet 0 (first in any group): always GABC
    // - For nabc-lines: 1 -> GABC, NABC, GABC, NABC, ... (alternates every 1)
    // - For nabc-lines: 2 -> GABC, NABC, NABC, GABC, GABC, NABC, NABC, ... (alternates every 2)
    // - For nabc-lines: N -> First snippet GABC, then alternating blocks of N
    
    if (snippetIndex === 0) {
      return false; // First snippet in any group is always GABC
    }
    
    // Calculate which block we're in after the first snippet
    // For alternationPeriod=1: blocks are size 1, so index 1->NABC, 2->GABC, 3->NABC...
    // For alternationPeriod=2: blocks are size 2, so index 1,2->NABC, 3,4->GABC, 5,6->NABC...
    const blockIndex = Math.floor((snippetIndex - 1) / alternationPeriod);
    return blockIndex % 2 === 0; // Even blocks (0, 2, 4...) are NABC, odd blocks (1, 3, 5...) are GABC
  }

  private isNabcSnippet(snippet: string): boolean {
    if (!snippet || snippet.trim() === '') {
      return false; // Empty snippets are neutral
    }
    
    // NABC snippets contain specific NABC notation patterns:
    // - Long descriptors like 'peGlsa6tohl', 'toppt2lss2lsim2', 'qlppn1'
    // - Modifiers like 'un', 'ta', 'vi', etc. 
    // - NABC-specific symbols: backticks, underscores, certain combinations
    // 
    // Important: Avoid patterns that match regular GABC notation like 'ce', 'gf', etc.
    
    const nabcPatterns = [
      /[a-z]{3,}[0-9]/,         // Long descriptors with numbers (peGlsa6tohl, toppt2lss2lsim2)
      /[a-z]+pt[0-9]/,          // Point descriptors (toppt2)
      /lss?[0-9]/,              // Line spacing (lss2, ls3)
      /lsim[0-9]/,              // Line simulation (lsim2)
      /qlhh/,                   // NABC quilisma patterns
      /talse[0-9]/,             // NABC ornament descriptors
      /clShi|clhi/,             // NABC clivis patterns
      /st>hi/,                  // NABC step patterns
      /vi>[0-9]/,               // NABC virga patterns
      /pf[0-9]/,                // NABC punctum patterns
      /``+/,                    // Multiple backticks
      /\b(un|ta|vi)\b/,         // Common NABC modifiers as whole words
      /[0-9][a-z]/,             // Digit followed by letter (NABC pitch descriptors)
      /g[a-z]{2,}/,             // Glyph descriptors with 3+ chars (avoid 'gf', 'ge', etc.)
    ];

    return nabcPatterns.some(pattern => pattern.test(snippet));
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