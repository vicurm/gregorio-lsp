import { NABCBasicGlyph, NABCFontFamily } from './types';

/**
 * Complete catalog of NABC basic glyphs based on official Gregorio documentation
 * Sources: GregorioNabcRef.tex, Cardine's Gregorian Semiology tables
 */

export const NABC_BASIC_GLYPHS: Record<string, NABCBasicGlyph> = {
  // === ST. GALL FAMILY GLYPHS (31 total) ===
  
  // Simple neumes
  'vi': {
    code: 'vi',
    name: 'virga',
    description: 'Single vertical stroke ascending',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN, NABCFontFamily.LAON],
    category: 'simple',
    manuscriptSources: ['C78O', 'C82R', 'E262S']
  },

  'pu': {
    code: 'pu',
    name: 'punctum',
    description: 'Single dot or point',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN, NABCFontFamily.LAON],
    category: 'simple',
    manuscriptSources: ['C137A']
  },

  'ta': {
    code: 'ta',
    name: 'tractulus',
    description: 'Small horizontal stroke',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN, NABCFontFamily.LAON],
    category: 'simple',
    manuscriptSources: ['C25U', 'E262S']
  },

  'gr': {
    code: 'gr',
    name: 'gravis',
    description: 'Descending stroke',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    category: 'simple',
    manuscriptSources: ['H271L', 'H270S']
  },

  // Two-note neumes
  'cl': {
    code: 'cl',
    name: 'clivis',
    description: 'Two-note descending neume',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN, NABCFontFamily.LAON],
    category: 'compound',
    manuscriptSources: ['C78O', 'C26A', 'C25U']
  },

  'pe': {
    code: 'pe',
    name: 'pes',
    description: 'Two-note ascending neume (also called podatus)',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN, NABCFontFamily.LAON],
    category: 'compound',
    manuscriptSources: ['C80Q', 'C80Q', 'C64Q']
  },

  // Three-note neumes  
  'po': {
    code: 'po',
    name: 'porrectus',
    description: 'Three-note neume: low-high-low pattern',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN, NABCFontFamily.LAON],
    category: 'compound',
    manuscriptSources: ['C139B', 'C82R', 'G20I']
  },

  'to': {
    code: 'to',
    name: 'torculus',
    description: 'Three-note neume: high-low-high pattern',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN, NABCFontFamily.LAON],
    category: 'compound',
    manuscriptSources: ['C78O', 'C39B', 'C74B']
  },

  // Multi-note neumes
  'ci': {
    code: 'ci',
    name: 'climacus',
    description: 'Descending series of notes (3 or more)',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN, NABCFontFamily.LAON],
    category: 'compound',
    manuscriptSources: ['C26A', 'G73P', 'C74B']
  },

  'sc': {
    code: 'sc',
    name: 'scandicus',
    description: 'Ascending series of notes (3 or more)',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN, NABCFontFamily.LAON],
    category: 'compound',
    manuscriptSources: ['G11P', 'C123C', 'C154A']
  },

  // Compound neumes
  'pf': {
    code: 'pf',
    name: 'porrectus flexus',
    description: 'Porrectus followed by descending note',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN, NABCFontFamily.LAON],
    category: 'compound',
    manuscriptSources: ['C27E', 'C58D', 'C61I']
  },

  'sf': {
    code: 'sf',
    name: 'scandicus flexus',
    description: 'Scandicus followed by descending note',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN, NABCFontFamily.LAON],
    category: 'compound',
    manuscriptSources: ['C67D', 'E248V']
  },

  'tr': {
    code: 'tr',
    name: 'torculus resupinus',
    description: 'Torculus followed by ascending note',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN, NABCFontFamily.LAON],
    category: 'compound',
    manuscriptSources: ['C82V', 'C60S', 'C27Q']
  },

  // Stropha family
  'st': {
    code: 'st',
    name: 'stropha',
    description: 'Single stropha (apostropha)',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    category: 'simple',
    manuscriptSources: ['C80Q']
  },

  'ds': {
    code: 'ds',
    name: 'distropha',
    description: 'Two strophae',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN, NABCFontFamily.LAON],
    category: 'compound',
    manuscriptSources: ['C134B', 'C148V']
  },

  'ts': {
    code: 'ts',
    name: 'tristropha',
    description: 'Three strophae',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN, NABCFontFamily.LAON],
    category: 'compound',
    manuscriptSources: ['C80Q', 'C44D', 'C150L']
  },

  // Special neumes
  'tg': {
    code: 'tg',
    name: 'trigonus',
    description: 'Triangle-shaped neume',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN, NABCFontFamily.LAON],
    category: 'special',
    manuscriptSources: ['C80Q', 'C81E', 'C139B']
  },

  // Virga family
  'bv': {
    code: 'bv',
    name: 'bivirga',
    description: 'Two virgae',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN, NABCFontFamily.LAON],
    category: 'compound',
    manuscriptSources: ['C26D', 'C82B']
  },

  'tv': {
    code: 'tv',
    name: 'trivirga',
    description: 'Three virgae',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN, NABCFontFamily.LAON],
    category: 'compound',
    manuscriptSources: ['C118C']
  },

  // Pressus family
  'pr': {
    code: 'pr',
    name: 'pressus maior',
    description: 'Large pressus (pressed neume)',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN, NABCFontFamily.LAON],
    category: 'special',
    manuscriptSources: ['E339S', 'C122I', 'C145L']
  },

  'pi': {
    code: 'pi',
    name: 'pressus minor',
    description: 'Small pressus (pressed neume)',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN, NABCFontFamily.LAON],
    category: 'special',
    manuscriptSources: ['C122I', 'C26A', 'C59D']
  },

  // Special forms
  'vs': {
    code: 'vs',
    name: 'virga strata',
    description: 'Horizontal virga (lying virga)',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN, NABCFontFamily.LAON],
    category: 'simple',
    manuscriptSources: ['C27E', 'C26A', 'C95D']
  },

  'or': {
    code: 'or',
    name: 'oriscus',
    description: 'Wavy or oscillating note',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN, NABCFontFamily.LAON],
    category: 'special',
    manuscriptSources: ['C80Q']
  },

  // Oriscus compounds
  'sa': {
    code: 'sa',
    name: 'salicus',
    description: 'Oriscus followed by ascending notes',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN, NABCFontFamily.LAON],
    category: 'compound',
    manuscriptSources: ['C107A', 'G30E', 'C27E']
  },

  'pq': {
    code: 'pq',
    name: 'pes quassus',
    description: 'Pes with oriscus (shaken pes)',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN, NABCFontFamily.LAON],
    category: 'compound',
    manuscriptSources: ['C148V', 'C84T', 'C52T']
  },

  // Quilisma family
  'ql': {
    code: 'ql',
    name: 'quilisma (3 loops)',
    description: 'Wavy ascending neume with 3 loops',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN, NABCFontFamily.LAON],
    category: 'special',
    manuscriptSources: ['C80Q', 'C148A', 'C40V']
  },

  'qi': {
    code: 'qi',
    name: 'quilisma (2 loops)',
    description: 'Wavy ascending neume with 2 loops',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    category: 'special',
    manuscriptSources: ['C103C', 'H28Q', 'C28A']
  },

  'pt': {
    code: 'pt',
    name: 'pes stratus',
    description: 'Horizontal pes (lying pes)',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN, NABCFontFamily.LAON],
    category: 'compound',
    manuscriptSources: ['G140O']
  },

  // Special placeholder
  'ni': {
    code: 'ni',
    name: 'nihil',
    description: 'Empty placeholder for positioning letters without base glyph',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN, NABCFontFamily.LAON],
    category: 'special'
  },

  // === LAON-SPECIFIC GLYPHS ===
  
  'un': {
    code: 'un',
    name: 'uncinus',
    description: 'Hook-shaped neume specific to Laon notation',
    fontFamilies: [NABCFontFamily.LAON],
    category: 'simple',
    manuscriptSources: ['L82O', 'L24D', 'L112O']
  },

  'oc': {
    code: 'oc',
    name: 'oriscus-clivis',
    description: 'Oriscus combined with clivis, specific to Laon notation',
    fontFamilies: [NABCFontFamily.LAON],
    category: 'compound',
    manuscriptSources: ['L78H', 'L56D', 'L11Q']
  }
};

// Helper functions for glyph lookup and validation
export function getGlyphByCode(code: string): NABCBasicGlyph | undefined {
  return NABC_BASIC_GLYPHS[code];
}

export function isValidGlyphForFont(code: string, font: NABCFontFamily): boolean {
  const glyph = NABC_BASIC_GLYPHS[code];
  return glyph ? glyph.fontFamilies.includes(font) : false;
}

export function getGlyphsByCategory(category: 'simple' | 'compound' | 'special'): NABCBasicGlyph[] {
  return Object.values(NABC_BASIC_GLYPHS).filter(glyph => glyph.category === category);
}

export function getGlyphsByFont(font: NABCFontFamily): NABCBasicGlyph[] {
  return Object.values(NABC_BASIC_GLYPHS).filter(glyph => glyph.fontFamilies.includes(font));
}