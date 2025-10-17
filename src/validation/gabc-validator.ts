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
        if (!['0', '1'].includes(value)) {
          diagnostics.push({
            severity: DiagnosticSeverity.Error,
            range: header.range,
            message: `Invalid nabc-lines value: ${value}. Expected '0' or '1'`,
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

    if (music.isNabc) {
      // Validate NABC notation
      const nabcDiagnostics = this.validateNABCNotation(music);
      diagnostics.push(...nabcDiagnostics);
    } else {
      // Validate GABC notation
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

    // Validate GABC pitch letters
    const validPitches = 'abcdefghijklm';
    const pitchPattern = /[a-m]/g;
    
    // Check for invalid pitch letters
    const invalidPitches = content.match(/[n-z]/g);
    if (invalidPitches) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: music.range,
        message: `Invalid pitch letters in GABC notation: ${invalidPitches.join(', ')}`,
        source: 'gregorio-lsp'
      });
    }

    // Validate neume shapes
    const validShapes = ['~', 'v', '<', '>', 'o', 'O', '\\', '/', '+'];
    for (const char of content) {
      if (!validPitches.includes(char) && 
          !validShapes.includes(char) && 
          !char.match(/[\s\-|(){}[\]]/)) {
        diagnostics.push({
          severity: DiagnosticSeverity.Warning,
          range: music.range,
          message: `Unusual character in GABC notation: ${char}`,
          source: 'gregorio-lsp'
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