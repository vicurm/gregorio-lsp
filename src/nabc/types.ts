/**
 * NABC (Neumatic Adiastematic Neume Notation) Type Definitions
 * Based on official Gregorio documentation and GregorioNabcRef.tex
 */

export enum NABCFontFamily {
  ST_GALL = 'gregall',
  ST_GALL_MODERN = 'gresgmodern',
  LAON = 'grelaon'
}

export enum NABCGlyphModifier {
  MARK = 'S',              // Modification of the mark
  GROUPING = 'G',          // Modification of grouping (neumatic break)  
  MELODIC = 'M',           // Melodic modification
  EPISEMA = '-',           // Addition of episema
  AUGMENTIVE = '>',        // Augmentive liquescence
  DIMINUTIVE = '~'         // Diminutive liquescence
}

export enum NABCSpacingType {
  LARGER_RIGHT = '//',     // Move right by nabclargerspace
  INTER_RIGHT = '/',       // Move right by nabcinterelementspace
  LARGER_LEFT = '``',      // Move left by nabclargerspace
  INTER_LEFT = '`'         // Move left by nabcinterelementspace
}

export enum NABCSubPunctisModifier {
  TRACTULUS = 't',         // Tractulus
  TRACTULUS_EPISEMA = 'u', // Tractulus with episema
  TRACTULUS_DOUBLE = 'v',  // Tractulus with double episema
  GRAVIS = 'w',           // Gravis
  LIQUESCENS_STROPHA = 'x', // Liquescens stropha
  GRAVIS_EPISEMA = 'y'    // Gravis with episema
}

export interface NABCBasicGlyph {
  code: string;
  name: string;
  description: string;
  fontFamilies: NABCFontFamily[];
  category: 'simple' | 'compound' | 'special';
  manuscriptSources?: string[];
}

export interface NABCGlyphModifierInfo {
  modifier: NABCGlyphModifier;
  description: string;
  variants?: number[]; // For numbered variants like >1, S2, etc.
  compatibleGlyphs?: string[];
}

export interface NABCSignificantLetter {
  code: string;
  fullCode: string; // Including 'ls' or 'lt' prefix
  meaning: string;
  description: string;
  fontFamilies: NABCFontFamily[];
  positions: number[]; // Valid positions 1-9 (plus 5 for Laon)
  category: 'performance' | 'pitch' | 'rhythm' | 'expression' | 'tironian';
}

export interface NABCPitchDescriptor {
  letter: string; // a-n, p
  description: string;
  relativeHeight: number; // For ordering/validation
}

export interface NABCComplexGlyph {
  components: string[]; // Basic glyph codes joined by !
  modifiers?: Array<{
    modifier: NABCGlyphModifier;
    variant?: number;
  }>;
  pitch?: string; // hX format
  subpunctis?: Array<{
    type: 'su' | 'pp';
    modifier?: NABCSubPunctisModifier;
    count: number;
  }>;
  significantLetters?: Array<{
    code: string;
    position: number;
  }>;
}

export interface NABCCompletionItem {
  label: string;
  kind: 'glyph' | 'modifier' | 'letter' | 'spacing' | 'pitch';
  detail: string;
  documentation: string;
  insertText?: string;
  fontCompatibility: NABCFontFamily[];
  category?: string;
}

export interface NABCHoverInfo {
  title: string;
  description: string;
  usage: string;
  examples?: string[];
  fontCompatibility: NABCFontFamily[];
  manuscriptSource?: string;
  relatedCodes?: string[];
}