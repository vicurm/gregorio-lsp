import Parser from 'tree-sitter';
import { Range, Position, DiagnosticSeverity } from 'vscode-languageserver-types';
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

// NABC integration
import { 
  NABCValidator, 
  validateNABCHeader,
  detectNABCContext,
  NABCFontFamily
} from '../nabc';

// Load tree-sitter-gregorio language
let gregorioLanguage: any = null;
try {
  const path = require('path');
  // Try different paths depending on execution context
  const possiblePaths = [
    path.resolve(__dirname, '../../tree-sitter-gregorio/bindings/node'), // compiled context
    path.resolve(__dirname, '../../../tree-sitter-gregorio/bindings/node'), // test context
    path.resolve(process.cwd(), '../tree-sitter-gregorio/bindings/node') // direct context
  ];
  
  for (const gregorioPath of possiblePaths) {
    try {
      gregorioLanguage = require(gregorioPath);
      console.log('tree-sitter-gregorio loaded successfully from:', gregorioPath);
      break;
    } catch {
      continue;
    }
  }
  
  if (!gregorioLanguage) {
    throw new Error('tree-sitter-gregorio not found in any expected location');
  }
} catch (error) {
  console.warn('tree-sitter-gregorio not available, using fallback parsing:', (error as Error).message);
  gregorioLanguage = null;
}

export class GABCParser {
  private parser: Parser | null = null;
  private nabcValidator: NABCValidator | null = null;
  private treeSitterAvailable: boolean = false;

  constructor() {
    try {
      this.parser = new Parser();
      if (gregorioLanguage) {
        // Debug the language object
        console.log('Language object keys:', Object.keys(gregorioLanguage));
        console.log('Language name:', gregorioLanguage.name);
        
        this.parser.setLanguage(gregorioLanguage);
        this.treeSitterAvailable = true;
        console.log('Tree-sitter parser initialized successfully with gregorio language');
      } else {
        console.warn('gregorioLanguage not loaded, using fallback parsing');
        this.treeSitterAvailable = false;
      }
    } catch (error) {
      // Tree-sitter not available, will use fallback parsing
      console.warn('Tree-sitter not available, using fallback parsing:', (error as Error).message);
      console.warn('Language object:', gregorioLanguage ? 'loaded' : 'null');
      this.treeSitterAvailable = false;
      this.parser = null;
    }
  }

  public parse(text: string): ParseResult {
    try {
      // If tree-sitter-gregorio is not available, use fallback parsing
      if (!this.treeSitterAvailable || !this.parser) {
        return this.fallbackParse(text);
      }

      const tree = this.parser.parse(text);
      
      // Check if tree is null or has parsing errors
      if (!tree || tree.rootNode.hasError) {
        return {
          success: false,
          errors: tree ? this.extractParseErrors(tree.rootNode, text) : [
            {
              message: 'Failed to parse with tree-sitter',
              range: this.createRange(0, 0, 0, text.length),
              severity: 1
            }
          ]
        };
      }

      const ast = this.convertToAST(tree.rootNode, text);
      
      // Run comprehensive validation
      const nabcConfig = this.extractNABCConfiguration(ast as GABCDocument);
      const allErrors: ParseError[] = [];
      
      // Validate headers
      allErrors.push(...this.validateHeaders(ast as GABCDocument));
      
      // Validate NABC alternation
      allErrors.push(...this.validateAlternation(ast as GABCDocument, nabcConfig));
      
      // Validate characters and notation
      allErrors.push(...this.validateNotation(ast as GABCDocument));
      
      // Validate warnings (rendering and compatibility issues)
      allErrors.push(...this.validateWarnings(ast as GABCDocument));
      
      return {
        success: allErrors.filter(e => e.severity === 1).length === 0, // Only count errors, not warnings
        ast: ast as GABCDocument,
        errors: allErrors
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
            let value = line.substring(colonIndex + 1).trim();
            
            // Remove trailing semicolon if present
            if (value.endsWith(';')) {
              value = value.slice(0, -1).trim();
            }
            
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

      // Run comprehensive validation
      const nabcConfig = this.extractNABCConfiguration(ast);
      const allErrors: ParseError[] = [];
      
      // Validate headers
      allErrors.push(...this.validateHeaders(ast));
      
      // Validate NABC alternation
      allErrors.push(...this.validateAlternation(ast, nabcConfig));
      
      // Validate characters and notation
      allErrors.push(...this.validateNotation(ast));
      
      // Validate warnings (rendering and compatibility issues)
      allErrors.push(...this.validateWarnings(ast));

      return {
        success: allErrors.filter(e => e.severity === 1).length === 0, // Only count errors, not warnings
        ast,
        errors: allErrors
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
    
    // Enhanced regex pattern for syllables that handles more complex cases
    const syllablePattern = /([^()]*?)\(([^)]*)\)/g;
    let match;
    let position = 0;
    let currentLine = startLine;

    while ((match = syllablePattern.exec(musicText)) !== null) {
      const fullMatch = match[0];
      const textContent = match[1].trim();
      const musicContent = match[2];

      // Calculate position with proper line/column tracking
      const matchStart = match.index;
      const matchEnd = matchStart + fullMatch.length;

      // Count newlines up to this match
      const textBefore = musicText.substring(0, matchStart);
      const newlinesBefore = (textBefore.match(/\n/g) || []).length;
      const actualLine = startLine + newlinesBefore;
      
      // Calculate column position
      const lastNewlinePos = textBefore.lastIndexOf('\n');
      const columnStart = lastNewlinePos === -1 ? matchStart : matchStart - lastNewlinePos - 1;

      // Enhanced NABC detection and validation
      const isNabcContent = this.detectNABC(musicContent);
      const musicElement = {
        type: 'music_element' as const,
        content: musicContent,
        range: this.createRange(
          actualLine, 
          columnStart + (textContent ? textContent.length + 1 : 1), 
          actualLine, 
          columnStart + fullMatch.length - 1
        ),
        isNabc: isNabcContent
      };

      // Validate NABC content if detected
      if (isNabcContent) {
        const nabcValidation = this.validateNABCMusicContent(musicContent);
        if (nabcValidation.errors.length > 0) {
          // Add validation errors to the music element
          (musicElement as any).validationErrors = nabcValidation.errors;
        }
      }

      const syllable: Syllable = {
        type: 'syllable',
        range: this.createRange(actualLine, columnStart, actualLine, columnStart + fullMatch.length),
        text: textContent ? {
          type: 'text_element',
          content: textContent,
          range: this.createRange(actualLine, columnStart, actualLine, columnStart + textContent.length)
        } : undefined,
        music: musicElement
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
    // Enhanced NABC notation detection patterns
    const nabcPatterns = [
      /[1-4][a-m](?:[~^_]|(?:<sp>)|(?:<\/sp>))*/,  // pitch descriptors with modifiers
      /n[0-9A-F]+/i,                               // neume descriptors (hex support)
      /g[a-z]+/i,                                  // glyph descriptors
      /e[a-z]+/i,                                  // episema descriptors
      /[+-][0-9]+/,                                // explicit spacing
      /{[^}]+}/,                                   // markup commands
      /\[[^\]]+\]/,                                // special annotations
      /![a-z]+!/i,                                 // special markers
      /<[^>]+>/                                    // XML-like tags
    ];

    // Also check for common NABC sequences
    const nabcSequences = [
      /[1-4][a-m][1-4][a-m]/,                     // multiple pitch descriptors
      /n[0-9A-F]+[1-4][a-m]/i,                    // neume + pitch
      /g[a-z]+[1-4][a-m]/i,                       // glyph + pitch
      /@[1-4][a-m]/                               // pitch with clef
    ];

    return nabcPatterns.some(pattern => pattern.test(musicContent)) ||
           nabcSequences.some(pattern => pattern.test(musicContent));
  }

  private validateNABCMusicContent(content: string): { errors: ParseError[] } {
    const errors: ParseError[] = [];
    
    // Validate pitch descriptors
    const pitchMatches = content.match(/[1-4][a-m]/g);
    if (pitchMatches) {
      pitchMatches.forEach(match => {
        const clef = match[0];
        const pitch = match[1];
        
        // Validate clef range
        if (!/[1-4]/.test(clef)) {
          errors.push({
            message: `Invalid NABC clef '${clef}'. Must be 1-4.`,
            range: this.createRange(0, 0, 0, 0), // Position would need to be calculated properly
            severity: DiagnosticSeverity.Error
          });
        }
        
        // Validate pitch range
        if (!/[a-m]/.test(pitch)) {
          errors.push({
            message: `Invalid NABC pitch '${pitch}'. Must be a-m.`,
            range: this.createRange(0, 0, 0, 0),
            severity: DiagnosticSeverity.Error
          });
        }
      });
    }
    
    // Validate neume descriptors
    const neumeMatches = content.match(/n[0-9A-F]+/gi);
    if (neumeMatches) {
      neumeMatches.forEach(match => {
        const neumeCode = match.substring(1);
        // Validate hexadecimal format
        if (!/^[0-9A-F]+$/i.test(neumeCode)) {
          errors.push({
            message: `Invalid NABC neume descriptor '${match}'. Code must be hexadecimal.`,
            range: this.createRange(0, 0, 0, 0),
            severity: DiagnosticSeverity.Error
          });
        }
      });
    }
    
    // Validate glyph descriptors
    const glyphMatches = content.match(/g[a-z]+/gi);
    if (glyphMatches) {
      glyphMatches.forEach(match => {
        const glyphCode = match.substring(1);
        // Basic validation for glyph codes
        if (!/^[a-z]+$/i.test(glyphCode)) {
          errors.push({
            message: `Invalid NABC glyph descriptor '${match}'. Code must be alphabetic.`,
            range: this.createRange(0, 0, 0, 0),
            severity: DiagnosticSeverity.Error
          });
        }
      });
    }
    
    return { errors };
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

  public validateHeaders(ast: GABCDocument): ParseError[] {
    const errors: ParseError[] = [];
    const headerCounts = new Map<string, number>();
    
    // Check for required name header
    const nameHeader = ast.headers.find(h => h.name.toLowerCase() === 'name');
    if (!nameHeader) {
      errors.push({
        message: GREGORIO_ERROR_MESSAGES.NO_NAME_SPECIFIED,
        range: this.createRange(0, 0, 0, 0),
        severity: 2 // Warning
      });
    } else if (!nameHeader.value || nameHeader.value.trim() === '') {
      errors.push({
        message: GREGORIO_ERROR_MESSAGES.NAME_CANNOT_BE_EMPTY,
        range: nameHeader.range,
        severity: 2 // Warning
      });
    }
    
    // Check for duplicate headers
    ast.headers.forEach(header => {
      const headerName = header.name.toLowerCase();
      const count = headerCounts.get(headerName) || 0;
      headerCounts.set(headerName, count + 1);
      
      if (count > 0) {
        // Format message with header name
        const message = GREGORIO_ERROR_MESSAGES.MULTIPLE_HEADER_DEFINITIONS
          .replace('%s', header.name);
        
        errors.push({
          message,
          range: header.range,
          severity: 2 // Warning
        });
      }
    });
    
    // Check for too many annotations (max 2 in Gregorio)
    const annotationHeaders = ast.headers.filter(h => 
      h.name.toLowerCase() === 'annotation'
    );
    if (annotationHeaders.length > 2) {
      const message = GREGORIO_ERROR_MESSAGES.TOO_MANY_ANNOTATIONS
        .replace('%d', '2');
        
      annotationHeaders.slice(2).forEach(header => {
        errors.push({
          message,
          range: header.range,
          severity: 2 // Warning
        });
      });
    }

    // Validate NABC headers if present
    const nabcLinesHeader = ast.headers.find(h => 
      h.name.toLowerCase() === 'nabc-lines'
    );
    if (nabcLinesHeader) {
      const nabcDiagnostics = validateNABCHeader(
        nabcLinesHeader.value,
        nabcLinesHeader.range.start.character
      );
      
      // Convert diagnostics to ParseError format
      nabcDiagnostics.forEach(diagnostic => {
        errors.push({
          message: diagnostic.message,
          range: this.createRange(
            diagnostic.range.start.line,
            diagnostic.range.start.character,
            diagnostic.range.end.line,
            diagnostic.range.end.character
          ),
          severity: diagnostic.severity === 1 ? 1 : 2 // Error or Warning
        });
      });
    }
    
    return errors;
  }

  public validateNotation(ast: GABCDocument): ParseError[] {
    const errors: ParseError[] = [];
    
    // Get NABC configuration
    const nabcConfig = this.extractNABCConfiguration(ast);
    
    ast.music.syllables.forEach(syllable => {
      if (syllable.music) {
        const musicContent = syllable.music.content;
        
        // Validate NABC content if NABC is enabled
        if (nabcConfig.enabled) {
          errors.push(...this.validateNABCContent(syllable, nabcConfig));
        }
        
        // Validate unrecognized characters in music notation
        const invalidChars = /[^a-zA-Z0-9()\[\]{}|\/\\\-_.'`~<>:;,=+@#$% \t\n\r]/g;
        let match;
        
        while ((match = invalidChars.exec(musicContent)) !== null) {
          const message = GREGORIO_ERROR_MESSAGES.UNRECOGNIZED_CHARACTER + `: "${match[0]}"`;
          
          errors.push({
            message,
            range: syllable.music.range,
            severity: 1 // Error
          });
        }
        
        // Validate pitch letters (a-p are valid notes, q-z are generally invalid)
        // But we need to be careful with GABC notation elements
        const pitchPattern = /(?:^|[^a-zA-Z])([q-z])(?![a-zA-Z])/g;
        let pitchMatch;
        
        while ((pitchMatch = pitchPattern.exec(musicContent)) !== null) {
          const letter = pitchMatch[1];
          
          // Skip valid GABC elements that use these letters
          const context = musicContent.substring(Math.max(0, pitchMatch.index - 5), pitchMatch.index + 6);
          const skipPatterns = [
            /quilisma/i, /qu/i,  // quilisma notation
            /virga/i, /stropha/i, /oriscus/i,  // shape names  
            /vert/i, /vertical/i, // vertical elements
            /\w+[qrstuvwxyz]\w*/i // part of longer words
          ];
          
          const shouldSkip = skipPatterns.some(pattern => pattern.test(context));
          
          if (!shouldSkip) {
            const message = GREGORIO_ERROR_MESSAGES.INVALID_PITCH
              .replace('%u', '4') // Default to 4-line staff
              .replace('%c', letter);
              
            errors.push({
              message,
              range: syllable.music.range,
              severity: 1 // Error
            });
          }
        }
        
        // Validate clef notations (should be c1-c5, f1-f5)
        const clefPattern = /[cf]([0-9]+)/g;
        let clefMatch;
        
        while ((clefMatch = clefPattern.exec(musicContent)) !== null) {
          const clefLine = parseInt(clefMatch[1], 10);
          
          if (clefLine < 1 || clefLine > 5) {
            const message = GREGORIO_ERROR_MESSAGES.INVALID_CLEF_LINE
              .replace('%u', '4') // Default to 4-line staff  
              .replace('%d', clefLine.toString());
              
            errors.push({
              message,
              range: syllable.music.range,
              severity: 1 // Error
            });
          }
        }
      }
    });
    
    return errors;
  }

  private validateWarnings(ast: GABCDocument): ParseError[] {
    const warnings: ParseError[] = [];
    
    // Check for potential rendering and compatibility issues
    
    // 1. Check for line breaks or clef changes in first syllable
    if (ast.music.syllables.length > 0) {
      // Find the first syllable with actual text (skip clef-only syllables)
      const firstSyllable = ast.music.syllables.find(s => s.text && s.text.content.trim() !== '') || ast.music.syllables[0];
      
      if (firstSyllable.music) {
        const musicContent = firstSyllable.music.content;
        
        // Check for line breaks (z, Z patterns and / patterns)
        if (/\b[zZ][+-]?\b|\//.test(musicContent)) {
          warnings.push({
            message: GREGORIO_ERROR_MESSAGES.LINE_BREAK_NOT_SUPPORTED_FIRST_SYLLABLE,
            range: firstSyllable.music.range,
            severity: 1 // Error (this is actually an error, not warning)
          });
        }
        
        // Check for clef changes in first syllable (but not initial clef)
        // Look for clef changes that are not at the very beginning
        const clefChangePattern = /(?<!^[\s\(]*)[cf]b?[1-5]/;
        if (clefChangePattern.test(musicContent)) {
          warnings.push({
            message: GREGORIO_ERROR_MESSAGES.CLEF_CHANGE_NOT_SUPPORTED_FIRST_SYLLABLE,
            range: firstSyllable.music.range,
            severity: 1 // Error (this is actually an error, not warning)
          });
        }
      }
      
      // Check for elision at the beginning of score text
      if (firstSyllable.text) {
        const textContent = firstSyllable.text.content;
        
        // Look for elision patterns at the start: <e> or elision markup
        if (/^[\s]*<e>|^\s*\\textit\{/.test(textContent)) {
          warnings.push({
            message: GREGORIO_ERROR_MESSAGES.ELISION_AT_SCORE_INITIAL,
            range: firstSyllable.text.range,
            severity: 1 // Error
          });
        }
      }
    }
    
    // 2. Check for potentially problematic ambitus (very large intervals)
    ast.music.syllables.forEach(syllable => {
      if (syllable.music) {
        const musicContent = syllable.music.content;
        
        // Look for very large pitch jumps that might cause rendering issues
        const pitchPattern = /([a-p])[^a-p]*([a-p])/gi;
        let match;
        
        while ((match = pitchPattern.exec(musicContent)) !== null) {
          const pitch1 = match[1].toLowerCase();
          const pitch2 = match[2].toLowerCase();
          
          const pitchValue1 = pitch1.charCodeAt(0) - 'a'.charCodeAt(0);
          const pitchValue2 = pitch2.charCodeAt(0) - 'a'.charCodeAt(0);
          
          const ambitus = Math.abs(pitchValue2 - pitchValue1);
          
          // Warn about very large jumps (more than an octave)
          if (ambitus > 7) {
            warnings.push({
              message: GREGORIO_ERROR_MESSAGES.LARGE_AMBITUS_WARNING,
              range: syllable.music.range,
              severity: 2 // Warning
            });
            break; // Only warn once per syllable
          }
        }
      }
    });
    
    // 3. Check for style conflicts (simplified detection)
    ast.music.syllables.forEach(syllable => {
      if (syllable.text) {
        const textContent = syllable.text.content;
        
        // Look for multiple center markings
        const centerMatches = textContent.match(/<c>/g);
        if (centerMatches && centerMatches.length > 1) {
          warnings.push({
            message: GREGORIO_ERROR_MESSAGES.SYLLABLE_ALREADY_HAS_CENTER,
            range: syllable.text.range,
            severity: 2 // Warning
          });
        }
        
        // Look for protrusion conflicts (multiple pr tags)
        const protrusionMatches = textContent.match(/pr\d*/g);
        if (protrusionMatches && protrusionMatches.length > 1) {
          warnings.push({
            message: GREGORIO_ERROR_MESSAGES.SYLLABLE_ALREADY_HAS_PROTRUSION,
            range: syllable.text.range,
            severity: 2 // Warning
          });
        }
      }
    });
    
    // 4. Check for unclosed and unmatched tags across all syllables
    const tagValidationErrors = this.validateTags(ast);
    warnings.push(...tagValidationErrors);
    
    return warnings;
  }

  private validateTags(ast: GABCDocument): ParseError[] {
    const errors: ParseError[] = [];
    
    // Define valid GABC tags that can be opened and closed
    const validTags = [
      'b', 'i', 'sc', 'ul', // Text formatting
      'v', 'c', 'e', // Special text elements
      'nlba', // No line break after
      'pr', // Protrusion
      'alt' // Alternative text
    ];
    
    // Use a stack to track proper nesting (LIFO - Last In, First Out)
    const tagStack: Array<{ tag: string; syllable: Syllable; position: number }> = [];
    
    // Process each syllable's text content
    ast.music.syllables.forEach(syllable => {
      if (!syllable.text) return;
      
      const textContent = syllable.text.content;
      
      // Find all tag occurrences (both opening and closing)
      const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
      let match;
      
      while ((match = tagPattern.exec(textContent)) !== null) {
        const fullTag = match[0];
        const tagName = match[1].toLowerCase();
        const isClosing = fullTag.startsWith('</');
        const position = match.index;
        
        // Check if it's a valid tag
        if (!validTags.includes(tagName)) {
          continue; // Skip unknown tags (they might be handled elsewhere)
        }
        
        if (isClosing) {
          // Check if the last opened tag matches this closing tag
          if (tagStack.length === 0) {
            // Closing tag without any open tags
            errors.push({
              message: GREGORIO_ERROR_MESSAGES.UNMATCHED_CLOSING_TAG.replace('%s', tagName),
              range: syllable.text.range,
              severity: 1 // Error
            });
          } else {
            const lastOpenTag = tagStack[tagStack.length - 1];
            
            if (lastOpenTag.tag === tagName) {
              // Perfect match - remove from stack
              tagStack.pop();
            } else {
              // Improper nesting - try to find the matching tag in the stack
              const matchingIndex = tagStack.findIndex(open => open.tag === tagName);
              
              if (matchingIndex === -1) {
                // No matching opening tag found
                errors.push({
                  message: GREGORIO_ERROR_MESSAGES.UNMATCHED_CLOSING_TAG.replace('%s', tagName),
                  range: syllable.text.range,
                  severity: 1 // Error
                });
              } else {
                // Found matching tag but not at top of stack - improper nesting
                // Report all tags that should have been closed first as unclosed
                for (let i = tagStack.length - 1; i > matchingIndex; i--) {
                  const unclosedTag = tagStack[i];
                  errors.push({
                    message: GREGORIO_ERROR_MESSAGES.UNCLOSED_TAG.replace('%s', unclosedTag.tag),
                    range: unclosedTag.syllable.text!.range,
                    severity: 1 // Error
                  });
                }
                
                // Remove all tags from the matching one onwards
                tagStack.splice(matchingIndex);
              }
            }
          }
        } else {
          // Opening tag - push to stack
          tagStack.push({
            tag: tagName,
            syllable,
            position
          });
        }
      }
    });
    
    // Check for any remaining unclosed tags
    tagStack.forEach(openTag => {
      errors.push({
        message: GREGORIO_ERROR_MESSAGES.UNCLOSED_TAG.replace('%s', openTag.tag),
        range: openTag.syllable.text!.range,
        severity: 1 // Error
      });
    });
    
    return errors;
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



  private validateNABCContent(syllable: any, config: NABCConfiguration): ParseError[] {
    const errors: ParseError[] = [];
    
    if (!syllable.music?.content) return errors;
    
    const musicContent = syllable.music.content;
    
    // Look for NABC content (indicated by | delimiters)
    const nabcMatches = musicContent.match(/\|([^|]+)\|/g);
    
    if (nabcMatches) {
      nabcMatches.forEach((match: string) => {
        const nabcContent = match.slice(1, -1); // Remove | delimiters
        // Initialize NABC validator if not already done
        if (!this.nabcValidator) {
          this.nabcValidator = new NABCValidator({
            font: NABCFontFamily.ST_GALL,
            nabcLinesCount: 1,
            currentLineIndex: 0,
            documentUri: ''
          });
        }
        
        const nabcErrors = this.nabcValidator.validateNABCSnippet(nabcContent, 0);
        
        // Convert NABC diagnostic to ParseError
        nabcErrors.forEach((diagnostic: any) => {
          errors.push({
            message: diagnostic.message,
            range: syllable.music.range || this.createRange(0, 0, 0, 0),
            severity: diagnostic.severity
          });
        });
      });
    }
    
    return errors;
  }
}