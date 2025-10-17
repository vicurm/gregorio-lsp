import { Range, Diagnostic, DiagnosticSeverity } from 'vscode-languageserver-types';

// AST Node Types
export interface ASTNode {
  type: string;
  range: Range;
  children?: ASTNode[];
}

export interface GABCDocument extends ASTNode {
  type: 'document';
  headers: HeaderField[];
  music: MusicSection;
}

export interface HeaderField extends ASTNode {
  type: 'header_field';
  name: string;
  value: string;
}

export interface MusicSection extends ASTNode {
  type: 'music_section';
  syllables: Syllable[];
}

export interface Syllable extends ASTNode {
  type: 'syllable';
  text?: TextElement;
  music?: MusicElement;
}

export interface TextElement extends ASTNode {
  type: 'text_element';
  content: string;
}

export interface MusicElement extends ASTNode {
  type: 'music_element';
  content: string;
  isNabc?: boolean;
}

// Parse Result Types
export interface ParseResult {
  success: boolean;
  ast?: GABCDocument;
  errors: ParseError[];
}

export interface ParseError {
  message: string;
  range: Range;
  severity: DiagnosticSeverity;
}

// NABC-lines Configuration
export interface NABCConfiguration {
  enabled: boolean;
  headerValue?: string;
  alternationPattern: 'gabc' | 'nabc';
}

// Validation Types
export interface ValidationContext {
  document: GABCDocument;
  nabcConfig: NABCConfiguration;
  enableSemanticValidation: boolean;
  enableNabcLinesValidation: boolean;
  strictAlternationChecking: boolean;
}

export interface ValidationResult {
  diagnostics: Diagnostic[];
  warnings: Diagnostic[];
}

// Analysis Types
export interface SemanticInfo {
  headers: Map<string, HeaderField>;
  nabcConfig: NABCConfiguration;
  syllableCount: number;
  musicElements: MusicElement[];
  textElements: TextElement[];
}

export interface CompletionContext {
  position: Range;
  currentElement?: ASTNode;
  nabcMode: boolean;
  inHeader: boolean;
  inMusic: boolean;
  inText: boolean;
}

export interface HoverInfo {
  content: string;
  range: Range;
}

// GABC/NABC Specific Types
export interface GABCNeume {
  pitch: string;
  shape: string;
  modifiers: string[];
}

export interface NABCGlyph {
  descriptor: string;
  modifiers: string[];
  pitch?: string;
}

export interface AlternationPattern {
  gabc: RegExp;
  nabc: RegExp;
}

// Error Types
export enum ErrorCode {
  PARSE_ERROR = 'parse_error',
  INVALID_HEADER = 'invalid_header',
  INVALID_NABC_LINES = 'invalid_nabc_lines',
  ALTERNATION_VIOLATION = 'alternation_violation',
  INVALID_NEUME = 'invalid_neume',
  INVALID_NABC_GLYPH = 'invalid_nabc_glyph',
  MISSING_TEXT = 'missing_text',
  MISSING_MUSIC = 'missing_music',
  INCONSISTENT_ALTERNATION = 'inconsistent_alternation'
}

export interface GABCError extends ParseError {
  code: ErrorCode;
  context?: any;
}