import { NABCSignificantLetter, NABCFontFamily } from './types';

/**
 * Complete catalog of NABC significant letters based on official Gregorio documentation
 * Sources: GregorioNabcRef.tex, Dom Eugène Cardine's Table of neumatic signs
 */

export const NABC_SIGNIFICANT_LETTERS: Record<string, NABCSignificantLetter> = {
  // === ST. GALL SIGNIFICANT LETTERS ===
  
  // Performance indications
  'lsal': {
    code: 'al',
    fullCode: 'lsal',
    meaning: 'altius',
    description: 'Higher, raise the pitch',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'pitch'
  },

  'lsam': {
    code: 'am',
    fullCode: 'lsam',
    meaning: 'altius mediocriter',
    description: 'Moderately higher',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'pitch'
  },

  'lsb': {
    code: 'b',
    fullCode: 'lsb',
    meaning: 'bene',
    description: 'Well, good',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'expression'
  },

  'lsc': {
    code: 'c',
    fullCode: 'lsc',
    meaning: 'celeriter',
    description: 'Quickly, fast',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'rhythm'
  },

  'lscm': {
    code: 'cm',
    fullCode: 'lscm',
    meaning: 'celeriter mediocriter',
    description: 'Moderately quickly',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'rhythm'
  },

  'lsco': {
    code: 'co',
    fullCode: 'lsco',
    meaning: 'coniunguntur',
    description: 'Connected, joined together',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'performance'
  },

  'lscw': {
    code: 'cw',
    fullCode: 'lscw',
    meaning: 'celeriter (wide form)',
    description: 'Quickly (wide form notation)',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'rhythm'
  },

  'lsd': {
    code: 'd',
    fullCode: 'lsd',
    meaning: 'deprimatur',
    description: 'Lower, depress the pitch',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'pitch'
  },

  'lse': {
    code: 'e',
    fullCode: 'lse',
    meaning: 'equaliter',
    description: 'Equally, evenly',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'performance'
  },

  'lseq': {
    code: 'eq',
    fullCode: 'lseq',
    meaning: 'equaliter',
    description: 'Equally, evenly (alternate form)',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'performance'
  },

  'lsew': {
    code: 'ew',
    fullCode: 'lsew',
    meaning: 'equaliter (wide form)',
    description: 'Equally (wide form notation)',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'performance'
  },

  'lsf': {
    code: 'f',
    fullCode: 'lsf',
    meaning: 'fastigium',
    description: 'Peak, highest point',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'pitch'
  },

  'lsfr': {
    code: 'fr',
    fullCode: 'lsfr',
    meaning: 'fragor',
    description: 'Crash, forceful sound',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'expression'
  },

  'lsi': {
    code: 'i',
    fullCode: 'lsi',
    meaning: 'inferius',
    description: 'Lower',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'pitch'
  },

  'lsim': {
    code: 'im',
    fullCode: 'lsim',
    meaning: 'inferius mediocriter',
    description: 'Moderately lower',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'pitch'
  },

  'lsl': {
    code: 'l',
    fullCode: 'lsl',
    meaning: 'levare',
    description: 'Raise, lift',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'pitch'
  },

  'lslt': {
    code: 'lt',
    fullCode: 'lslt',
    meaning: 'levare tenete',
    description: 'Raise and hold',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'performance'
  },

  'lsm': {
    code: 'm',
    fullCode: 'lsm',
    meaning: 'mediocriter',
    description: 'Moderately',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'performance'
  },

  'lsmoll': {
    code: 'moll',
    fullCode: 'lsmoll',
    meaning: 'molliter',
    description: 'Softly, gently',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'expression'
  },

  'lsp': {
    code: 'p',
    fullCode: 'lsp',
    meaning: 'parvum',
    description: 'Small, little',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'expression'
  },

  'lspar': {
    code: 'par',
    fullCode: 'lspar',
    meaning: 'paratim',
    description: 'Prepared, ready',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'performance'
  },

  'lsr': {
    code: 'r',
    fullCode: 'lsr',
    meaning: 'resupinum',
    description: 'Turned back, reversed',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'performance'
  },

  'lssc': {
    code: 'sc',
    fullCode: 'lssc',
    meaning: 'sursum celeriter',
    description: 'Upward quickly',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'performance'
  },

  'lssimil': {
    code: 'simil',
    fullCode: 'lssimil',
    meaning: 'similiter',
    description: 'Similarly, in the same manner',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'performance'
  },

  'lssimul': {
    code: 'simul',
    fullCode: 'lssimul',
    meaning: 'simul',
    description: 'Together, simultaneously',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'performance'
  },

  'lssm': {
    code: 'sm',
    fullCode: 'lssm',
    meaning: 'sursum mediocriter',
    description: 'Upward moderately',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'pitch'
  },

  'lsst': {
    code: 'st',
    fullCode: 'lsst',
    meaning: 'sursum tenere',
    description: 'Hold upward',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'performance'
  },

  'lssta': {
    code: 'sta',
    fullCode: 'lssta',
    meaning: 'statim',
    description: 'Immediately, at once',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'rhythm'
  },

  'lst': {
    code: 't',
    fullCode: 'lst',
    meaning: 'tenere',
    description: 'Hold, sustain',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'rhythm'
  },

  'lstw': {
    code: 'tw',
    fullCode: 'lstw',
    meaning: 'tenere (wide form)',
    description: 'Hold (wide form notation)',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'rhythm'
  },

  'lstb': {
    code: 'tb',
    fullCode: 'lstb',
    meaning: 'tenere bene',
    description: 'Hold well',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'performance'
  },

  'lstm': {
    code: 'tm',
    fullCode: 'lstm',
    meaning: 'tenere mediocriter',
    description: 'Hold moderately',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'performance'
  },

  'lsv': {
    code: 'v',
    fullCode: 'lsv',
    meaning: 'valde',
    description: 'Very, greatly',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'expression'
  },

  'lsvol': {
    code: 'vol',
    fullCode: 'lsvol',
    meaning: 'volubiliter',
    description: 'Rolling, with agility',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'performance'
  },

  'lsx': {
    code: 'x',
    fullCode: 'lsx',
    meaning: 'expectare',
    description: 'Wait, pause',
    fontFamilies: [NABCFontFamily.ST_GALL, NABCFontFamily.ST_GALL_MODERN],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'rhythm'
  },

  // === LAON SIGNIFICANT LETTERS ===

  'lsa': {
    code: 'a',
    fullCode: 'lsa',
    meaning: 'augete',
    description: 'Increase, augment',
    fontFamilies: [NABCFontFamily.LAON],
    positions: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    category: 'expression'
  },

  'lseq-': {
    code: 'eq-',
    fullCode: 'lseq-',
    meaning: 'equaliter',
    description: 'Equally (Laon variant)',
    fontFamilies: [NABCFontFamily.LAON],
    positions: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    category: 'performance'
  },

  'lsequ': {
    code: 'equ',
    fullCode: 'lsequ',
    meaning: 'equaliter',
    description: 'Equally (Laon variant)',
    fontFamilies: [NABCFontFamily.LAON],
    positions: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    category: 'performance'
  },

  'lsh': {
    code: 'h',
    fullCode: 'lsh',
    meaning: 'humiliter',
    description: 'Humbly, low',
    fontFamilies: [NABCFontFamily.LAON],
    positions: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    category: 'expression'
  },

  'lshn': {
    code: 'hn',
    fullCode: 'lshn',
    meaning: 'humiliter nectum',
    description: 'Humbly connected',
    fontFamilies: [NABCFontFamily.LAON],
    positions: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    category: 'performance'
  },

  'lshp': {
    code: 'hp',
    fullCode: 'lshp',
    meaning: 'humiliter parum',
    description: 'Slightly humbly',
    fontFamilies: [NABCFontFamily.LAON],
    positions: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    category: 'expression'
  },

  'lsn': {
    code: 'n',
    fullCode: 'lsn',
    meaning: 'non (tenere), negare, nectum, naturaliter',
    description: 'No, naturally, connected',
    fontFamilies: [NABCFontFamily.LAON],
    positions: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    category: 'performance'
  },

  'lsnl': {
    code: 'nl',
    fullCode: 'lsnl',
    meaning: 'non levare',
    description: "Don't raise",
    fontFamilies: [NABCFontFamily.LAON],
    positions: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    category: 'pitch'
  },

  'lsnt': {
    code: 'nt',
    fullCode: 'lsnt',
    meaning: 'non tenere',
    description: "Don't hold",
    fontFamilies: [NABCFontFamily.LAON],
    positions: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    category: 'rhythm'
  },

  'lsmd': {
    code: 'md',
    fullCode: 'lsmd',
    meaning: 'mediocriter',
    description: 'Moderately (Laon variant)',
    fontFamilies: [NABCFontFamily.LAON],
    positions: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    category: 'performance'
  },

  'lss': {
    code: 's',
    fullCode: 'lss',
    meaning: 'sursum',
    description: 'Upward',
    fontFamilies: [NABCFontFamily.LAON],
    positions: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    category: 'pitch'
  },

  'lssimp': {
    code: 'simp',
    fullCode: 'lssimp',
    meaning: 'simpliciter',
    description: 'Simply',
    fontFamilies: [NABCFontFamily.LAON],
    positions: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    category: 'expression'
  },

  'lssimpl': {
    code: 'simpl',
    fullCode: 'lssimpl',
    meaning: 'simpliciter',
    description: 'Simply (variant)',
    fontFamilies: [NABCFontFamily.LAON],
    positions: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    category: 'expression'
  },

  'lssp': {
    code: 'sp',
    fullCode: 'lssp',
    meaning: 'sursum parum',
    description: 'Slightly upward',
    fontFamilies: [NABCFontFamily.LAON],
    positions: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    category: 'pitch'
  },

  'lsth': {
    code: 'th',
    fullCode: 'lsth',
    meaning: 'tenere humiliter',
    description: 'Hold humbly',
    fontFamilies: [NABCFontFamily.LAON],
    positions: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    category: 'performance'
  }
};

// === TIRONIAN NOTES (LAON ONLY) ===
export const NABC_TIRONIAN_NOTES: Record<string, NABCSignificantLetter> = {
  'lti': {
    code: 'i',
    fullCode: 'lti',
    meaning: 'iusum',
    description: 'Commanded, ordered',
    fontFamilies: [NABCFontFamily.LAON],
    positions: [1, 2, 3, 4, 6, 7, 8, 9], // Position 5 not allowed
    category: 'tironian'
  },

  'ltdo': {
    code: 'do',
    fullCode: 'ltdo',
    meaning: 'deorsum',
    description: 'Downward',
    fontFamilies: [NABCFontFamily.LAON],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'tironian'
  },

  'ltdr': {
    code: 'dr',
    fullCode: 'ltdr',
    meaning: 'devertit',
    description: 'Turn aside, deviate',
    fontFamilies: [NABCFontFamily.LAON],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'tironian'
  },

  'ltdx': {
    code: 'dx',
    fullCode: 'ltdx',
    meaning: 'devexum',
    description: 'Sloping downward',
    fontFamilies: [NABCFontFamily.LAON],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'tironian'
  },

  'ltps': {
    code: 'ps',
    fullCode: 'ltps',
    meaning: 'prode sub eam (trade subtus)',
    description: 'Advance below it',
    fontFamilies: [NABCFontFamily.LAON],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'tironian'
  },

  'ltqm': {
    code: 'qm',
    fullCode: 'ltqm',
    meaning: 'quam mox',
    description: 'How soon, as soon as',
    fontFamilies: [NABCFontFamily.LAON],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'tironian'
  },

  'ltsb': {
    code: 'sb',
    fullCode: 'ltsb',
    meaning: 'sub',
    description: 'Under, below',
    fontFamilies: [NABCFontFamily.LAON],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'tironian'
  },

  'ltse': {
    code: 'se',
    fullCode: 'ltse',
    meaning: 'seorsum',
    description: 'Apart, separately',
    fontFamilies: [NABCFontFamily.LAON],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'tironian'
  },

  'ltsj': {
    code: 'sj',
    fullCode: 'ltsj',
    meaning: 'subjice',
    description: 'Place under, subject',
    fontFamilies: [NABCFontFamily.LAON],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'tironian'
  },

  'ltsl': {
    code: 'sl',
    fullCode: 'ltsl',
    meaning: 'saltim',
    description: 'At least',
    fontFamilies: [NABCFontFamily.LAON],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'tironian'
  },

  'ltsn': {
    code: 'sn',
    fullCode: 'ltsn',
    meaning: 'sonare',
    description: 'To sound',
    fontFamilies: [NABCFontFamily.LAON],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'tironian'
  },

  'ltsp': {
    code: 'sp',
    fullCode: 'ltsp',
    meaning: 'supra',
    description: 'Above, over',
    fontFamilies: [NABCFontFamily.LAON],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'tironian'
  },

  'ltsr': {
    code: 'sr',
    fullCode: 'ltsr',
    meaning: 'sursum',
    description: 'Upward (Tironian)',
    fontFamilies: [NABCFontFamily.LAON],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'tironian'
  },

  'ltst': {
    code: 'st',
    fullCode: 'ltst',
    meaning: 'saltate (salte)',
    description: 'Jump, leap',
    fontFamilies: [NABCFontFamily.LAON],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'tironian'
  },

  'ltus': {
    code: 'us',
    fullCode: 'ltus',
    meaning: 'ut supra',
    description: 'As above',
    fontFamilies: [NABCFontFamily.LAON],
    positions: [1, 2, 3, 4, 6, 7, 8, 9],
    category: 'tironian'
  }
};

// Combine all significant letters
export const ALL_SIGNIFICANT_LETTERS = {
  ...NABC_SIGNIFICANT_LETTERS,
  ...NABC_TIRONIAN_NOTES
};

// Helper functions
export function getSignificantLetterByCode(code: string): NABCSignificantLetter | undefined {
  return ALL_SIGNIFICANT_LETTERS[code];
}

export function getSignificantLettersByFont(font: NABCFontFamily): NABCSignificantLetter[] {
  return Object.values(ALL_SIGNIFICANT_LETTERS).filter(letter => 
    letter.fontFamilies.includes(font)
  );
}

export function getSignificantLettersByCategory(category: string): NABCSignificantLetter[] {
  return Object.values(ALL_SIGNIFICANT_LETTERS).filter(letter => 
    letter.category === category
  );
}

export function isValidPositionForLetter(letterCode: string, position: number): boolean {
  const letter = ALL_SIGNIFICANT_LETTERS[letterCode];
  return letter ? letter.positions.includes(position) : false;
}