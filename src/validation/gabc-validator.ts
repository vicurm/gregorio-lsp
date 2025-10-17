import { TextDocument } from 'vscode-languageserver-textdocument';
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver-types';
import { GABCParser } from '../parser/gabc-parser';
import {
  GABCDocument,
  ValidationContext,
  ValidationResult,
  NABCConfiguration,
  ErrorCode,
  GABCError,
  MusicElement,
  Syllable
} from '../types';

interface ServerSettings {
  maxNumberOfProblems: number;
  enableSemanticValidation: boolean;
  enableNabcLinesValidation: boolean;
  strictAlternationChecking: boolean;
}

export class GABCValidator {
  constructor(private parser: GABCParser) {}

  public async validate(
    ast: GABCDocument,
    document: TextDocument,
    settings: ServerSettings
  ): Promise<Diagnostic[]> {
    const diagnostics: Diagnostic[] = [];

    try {
      // Extract NABC configuration from headers
      const nabcConfig = this.parser.extractNABCConfiguration(ast);

      // Validate headers
      const headerDiagnostics = this.validateHeaders(ast);
      diagnostics.push(...headerDiagnostics);

      // Validate NABC-lines alternation if enabled
      if (settings.enableNabcLinesValidation && nabcConfig.enabled) {
        const alternationDiagnostics = this.validateAlternation(ast, nabcConfig, settings.strictAlternationChecking);
        diagnostics.push(...alternationDiagnostics);
      }

      // Validate music notation
      if (settings.enableSemanticValidation) {
        const musicDiagnostics = this.validateMusicNotation(ast, nabcConfig);
        diagnostics.push(...musicDiagnostics);
      }

      // Validate syllable structure
      const syllableDiagnostics = this.validateSyllableStructure(ast);
      diagnostics.push(...syllableDiagnostics);

    } catch (error) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: ast.range,
        message: `Validation error: ${error}`,
        source: 'gregorio-lsp'
      });
    }

    return diagnostics;
  }

  private validateHeaders(ast: GABCDocument): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    
    // Check for required headers
    const requiredHeaders = ['name', 'office-part', 'mode'];
    const presentHeaders = new Set(ast.headers.map(h => h.name.toLowerCase()));

    for (const required of requiredHeaders) {
      if (!presentHeaders.has(required)) {
        diagnostics.push({
          severity: DiagnosticSeverity.Warning,
          range: ast.range,
          message: `Missing recommended header: ${required}`,
          source: 'gregorio-lsp'
        });
      }
    }

    // Validate specific header values
    for (const header of ast.headers) {
      const headerDiagnostics = this.validateSpecificHeader(header);
      diagnostics.push(...headerDiagnostics);
    }

    return diagnostics;
  }

  private validateSpecificHeader(header: any): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const name = header.name.toLowerCase();
    const value = header.value;

    switch (name) {
      case 'nabc-lines':
        const nabcValue = parseInt(value, 10);
        if (isNaN(nabcValue) || nabcValue < 0) {
          diagnostics.push({
            severity: DiagnosticSeverity.Error,
            range: header.range,
            message: `Invalid nabc-lines value: ${value}. Expected non-negative integer (0, 1, 2, ...)`,
            source: 'gregorio-lsp'
          });
        }
        break;

      case 'mode':
        const validModes = ['1', '2', '3', '4', '5', '6', '7', '8', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
        if (!validModes.includes(value)) {
          diagnostics.push({
            severity: DiagnosticSeverity.Warning,
            range: header.range,
            message: `Unusual mode value: ${value}. Expected one of: ${validModes.join(', ')}`,
            source: 'gregorio-lsp'
          });
        }
        break;

      case 'initial-style':
        const validStyles = ['0', '1', '2'];
        if (!validStyles.includes(value)) {
          diagnostics.push({
            severity: DiagnosticSeverity.Warning,
            range: header.range,
            message: `Invalid initial-style: ${value}. Expected one of: ${validStyles.join(', ')}`,
            source: 'gregorio-lsp'
          });
        }
        break;
    }

    return diagnostics;
  }

  private validateAlternation(
    ast: GABCDocument,
    nabcConfig: NABCConfiguration,
    strictChecking: boolean
  ): Diagnostic[] {
    if (!nabcConfig.enabled) {
      return [];
    }

    const alternationErrors = this.parser.validateAlternation(ast, nabcConfig);
    
    return alternationErrors.map(error => ({
      severity: strictChecking ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning,
      range: error.range,
      message: error.message,
      source: 'gregorio-lsp'
    }));
  }

  private validateMusicNotation(ast: GABCDocument, nabcConfig: NABCConfiguration): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    for (const syllable of ast.music.syllables) {
      if (syllable.music) {
        const musicDiagnostics = this.validateMusicElement(syllable.music, nabcConfig);
        diagnostics.push(...musicDiagnostics);
      }
    }

    return diagnostics;
  }

  private validateMusicElement(music: MusicElement, nabcConfig: NABCConfiguration): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const content = music.content;

    if (music.isNabc === true) {
      // Validate NABC notation
      const nabcDiagnostics = this.validateNABCNotation(music);
      diagnostics.push(...nabcDiagnostics);
    } else {
      // Validate GABC notation (default when isNabc is false or undefined)
      const gabcDiagnostics = this.validateGABCNotation(music);
      diagnostics.push(...gabcDiagnostics);
    }

    return diagnostics;
  }

  private validateNABCNotation(music: MusicElement): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const content = music.content;

    // Validate NABC patterns
    const nabcPatterns = {
      pitchDescriptor: /[1-4][a-m]/g,
      neumeDescriptor: /n[0-9a-f]/g,
      glyphDescriptor: /g[a-z]/g,
      episemat: /e[a-z]/g
    };

    // Check for valid NABC elements
    let hasValidNABC = false;
    for (const [patternName, pattern] of Object.entries(nabcPatterns)) {
      if (pattern.test(content)) {
        hasValidNABC = true;
        break;
      }
    }

    if (!hasValidNABC && content.trim()) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: music.range,
        message: 'No valid NABC patterns found in notation',
        source: 'gregorio-lsp'
      });
    }

    // Validate specific NABC syntax
    const invalidChars = content.match(/[^1-4a-mng0-9e\s\-|]/g);
    if (invalidChars) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: music.range,
        message: `Invalid characters in NABC notation: ${invalidChars.join(', ')}`,
        source: 'gregorio-lsp'
      });
    }

    return diagnostics;
  }

  private validateGABCNotation(music: MusicElement): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const content = music.content;

    // Check for quilisma usage and suggest glyph break (do this first)
    const quilismaDiagnostics = this.validateQuilismaUsage(content, music.range);
    diagnostics.push(...quilismaDiagnostics);

    // Validate GABC pitch letters (exclude valid modifiers like w, W, v, V, s, o, O, q, r, R)
    const validPitches = 'abcdefghijklm';
    const validModifiers = 'wWvVsoOqrR';
    
    // Check for invalid pitch letters (n-z except valid modifiers)
    const invalidPitchPattern = /[n-uw-z]/gi;  // Exclude 'v' and 'w' which are modifiers
    const invalidPitches = content.match(invalidPitchPattern);
    if (invalidPitches) {
      // Filter out valid modifiers
      const actuallyInvalid = invalidPitches.filter(ch => !validModifiers.includes(ch));
      if (actuallyInvalid.length > 0) {
        diagnostics.push({
          severity: DiagnosticSeverity.Error,
          range: music.range,
          message: `Invalid pitch letters in GABC notation: ${actuallyInvalid.join(', ')}`,
          source: 'gregorio-lsp'
        });
      }
    }

    return diagnostics;
  }

    /**
   * Validate quilisma usage and suggest glyph break before quilisma note
   * 
   * Rule: Add ! between the pitch immediately before the quilisma and the quilisma itself
   * 
   * Examples:
   *   (gw)    → (g!w)     - single note before quilisma
   *   (fgw)   → (fg!w)    - two notes before quilisma
   *   (fghwi) → (fg!hwi)  - quilisma on 'h', break before 'h'
   */
  private validateQuilismaUsage(content: string, range: any): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    // Pattern to match: any pitch followed by quilisma modifier (w or W)
    // This captures both simple cases like 'gw' and complex like 'fghwi'
    const quilismaPattern = /([a-m])([wW])/g;
    let match;
    
    while ((match = quilismaPattern.exec(content)) !== null) {
      const noteBeforeQuilisma = match[1];      // e.g., 'g' in 'gw' or 'h' in 'hw'
      const quilismaModifier = match[2];        // 'w' or 'W'
      const matchIndex = match.index;

      // Check if there's already a glyph break (!) immediately before this note
      const precedingChar = matchIndex > 0 ? content[matchIndex - 1] : '';
      const hasGlyphBreak = precedingChar === '!';

      if (!hasGlyphBreak) {
        // The suggestion is to add ! before the note that has quilisma
        const noteWithQuilisma = `${noteBeforeQuilisma}${quilismaModifier}`;
        
        diagnostics.push({
          severity: DiagnosticSeverity.Information,
          range: range,
          message: `Consider adding glyph break (!) before quilisma note for better rendering. Suggestion: add ! before '${noteWithQuilisma}'`,
          source: 'gregorio-lsp',
          code: 'quilisma-glyph-break'
        });
      }

      // Check if quilisma is followed by a higher note
      const noteAfterQuilismaMatch = content.substring(matchIndex + match[0].length).match(/^([a-m])/);
      if (noteAfterQuilismaMatch) {
        const noteAfter = noteAfterQuilismaMatch[1];
        const quilismaPitch = noteBeforeQuilisma.charCodeAt(0);
        const nextPitch = noteAfter.charCodeAt(0);

        if (nextPitch <= quilismaPitch) {
          diagnostics.push({
            severity: DiagnosticSeverity.Warning,
            range: range,
            message: `Quilisma should be followed by a higher note. Currently '${noteBeforeQuilisma}${quilismaModifier}' is followed by '${noteAfter}' (same or lower pitch)`,
            source: 'gregorio-lsp',
            code: 'quilisma-ascending-motion'
          });
        }
      } else {
        // Quilisma is not followed by any note
        diagnostics.push({
          severity: DiagnosticSeverity.Warning,
          range: range,
          message: `Quilisma '${noteBeforeQuilisma}${quilismaModifier}' should be followed by a higher note`,
          source: 'gregorio-lsp',
          code: 'quilisma-no-following-note'
        });
      }
    }

    return diagnostics;
  }

  private validateSyllableStructure(ast: GABCDocument): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    for (const syllable of ast.music.syllables) {
      // Check for syllables with music but no text
      if (syllable.music && !syllable.text) {
        diagnostics.push({
          severity: DiagnosticSeverity.Information,
          range: syllable.range,
          message: 'Syllable has music notation but no text',
          source: 'gregorio-lsp'
        });
      }

      // Check for syllables with text but no music
      if (syllable.text && !syllable.music) {
        diagnostics.push({
          severity: DiagnosticSeverity.Warning,
          range: syllable.range,
          message: 'Syllable has text but no music notation',
          source: 'gregorio-lsp'
        });
      }

      // Check for empty syllables
      if (!syllable.text && !syllable.music) {
        diagnostics.push({
          severity: DiagnosticSeverity.Warning,
          range: syllable.range,
          message: 'Empty syllable',
          source: 'gregorio-lsp'
        });
      }
    }

    return diagnostics;
  }
}