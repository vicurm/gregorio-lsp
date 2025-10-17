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
  // Parse errors
  PARSE_ERROR = 'parse_error',
  UNRECOGNIZED_CHARACTER = 'unrecognized_character',
  
  // Header errors
  INVALID_HEADER = 'invalid_header',
  MISSING_NAME = 'missing_name',
  EMPTY_NAME = 'empty_name',
  MULTIPLE_HEADERS = 'multiple_headers',
  TOO_MANY_ANNOTATIONS = 'too_many_annotations',
  
  // NABC errors
  INVALID_NABC_LINES = 'invalid_nabc_lines',
  INVALID_PIPE_WITHOUT_NABC = 'invalid_pipe_without_nabc',
  NABC_IN_GABC_ONLY_MODE = 'nabc_in_gabc_only_mode',
  ALTERNATION_VIOLATION = 'alternation_violation',
  INCONSISTENT_ALTERNATION = 'inconsistent_alternation',
  
  // Notation errors
  INVALID_NEUME = 'invalid_neume',
  INVALID_NABC_GLYPH = 'invalid_nabc_glyph',
  INVALID_PITCH = 'invalid_pitch',
  INVALID_CLEF_LINE = 'invalid_clef_line',
  
  // Structure errors
  MISSING_TEXT = 'missing_text',
  MISSING_MUSIC = 'missing_music',
  UNCLOSED_BRACKET = 'unclosed_bracket',
  INVALID_BRACKET = 'invalid_bracket',
  
  // Style errors
  INVALID_STYLE = 'invalid_style',
  STYLE_CONFLICT = 'style_conflict',
  
  // Score integrity errors
  INVALID_SCORE = 'invalid_score',
  FIRST_SYLLABLE_ERROR = 'first_syllable_error',
  
  // Warning types (non-fatal but problematic)
  MISSING_NAME_WARNING = 'missing_name_warning',
  DUPLICATE_PROTRUSION = 'duplicate_protrusion',
  DUPLICATE_CENTER = 'duplicate_center',
  CENTER_AFTER_PROTRUSION = 'center_after_protrusion',
  CENTER_WITHOUT_START = 'center_without_start',
  LARGE_AMBITUS_WARNING = 'large_ambitus_warning',
  ELISION_AT_SCORE_START = 'elision_at_score_start',
  LINEBREAK_FIRST_SYLLABLE = 'linebreak_first_syllable',
  CLEF_CHANGE_FIRST_SYLLABLE = 'clef_change_first_syllable',
  UNCLOSED_TAG = 'unclosed_tag',
  UNMATCHED_CLOSING_TAG = 'unmatched_closing_tag'
}

// Official Gregorio Compiler Error Messages
export const GREGORIO_ERROR_MESSAGES = {
  // Core NABC errors
  PIPE_WITHOUT_NABC_LINES: 'You used character "|" in gabc without setting "nabc-lines" parameter. Please set it in your gabc header.',
  NABC_WITHOUT_ALTERNATION: 'NABC notation detected without proper alternation. Verify nabc-lines configuration and alternation pattern.',
  
  // Character and parsing errors
  UNRECOGNIZED_CHARACTER: 'unrecognized character',
  
  // Header validation errors
  NO_NAME_SPECIFIED: 'no name specified, put `name:...\' at the beginning of the file, can be dangerous with some output formats',
  NAME_CANNOT_BE_EMPTY: 'name can\'t be empty',
  TOO_MANY_ANNOTATIONS: 'too many definitions of annotation found, only the first %d will be taken',
  MULTIPLE_HEADER_DEFINITIONS: 'several %s definitions found, only the last will be taken into consideration',
  
  // Pitch and clef errors  
  INVALID_PITCH: 'invalid pitch for %u lines: %c',
  INVALID_CLEF_LINE: 'invalid clef line for %u lines: %d',
  
  // Slur and bracket errors
  UNCLOSED_LEFT_BRACKET: 'unclosed left bracket',
  CANNOT_ADD_LEFT_BRACKET: 'cannot add a left bracket before closing the previous one',
  CANNOT_ADD_RIGHT_BRACKET: 'cannot add a right bracket without a matching left bracket',
  BRACKETS_WITHOUT_NOTES: 'cannot add brackets without notes between them',
  
  // Style and centering errors
  STYLE_ALREADY_STARTED: 'style already started: %s',
  STYLE_NOT_STARTED: 'style not started: %s',
  SYLLABLE_ALREADY_HAS_CENTER: 'syllable already has center; ignoring additional center',
  CENTER_NOT_ALLOWED_AFTER_PROTRUSION: 'center not allowed after protrusion; ignored',
  NOT_WITHIN_SYLLABLE_CENTER: 'not within a syllable center',
  
  // Protrusion warnings
  SYLLABLE_ALREADY_HAS_PROTRUSION: 'syllable already has protrusion; pr tag ignored',
  CLOSING_CENTER_BEFORE_PROTRUSION: 'closing open syllable center before protrusion',
  
  // Rendering and compatibility warnings
  LARGE_AMBITUS_WARNING: 'Encountered the need to switch DET_END_OF_CURRENT to DET_END_OF_BOTH because of overly large ambitus',
  
  // Score integrity errors  
  INVALID_SCORE: 'unable to determine a valid score from file',
  LINE_BREAK_NOT_SUPPORTED_FIRST_SYLLABLE: 'line break is not supported on the first syllable',
  CLEF_CHANGE_NOT_SUPPORTED_FIRST_SYLLABLE: 'clef change is not supported on the first syllable',
  ELISION_AT_SCORE_INITIAL: 'score initial may not be in an elision',
  
  // Tag validation errors
  UNCLOSED_TAG: 'unclosed tag: <%s>',
  UNMATCHED_CLOSING_TAG: 'unmatched closing tag: </%s>',
} as const;

export interface GABCError extends ParseError {
  code: ErrorCode;
  context?: any;
}