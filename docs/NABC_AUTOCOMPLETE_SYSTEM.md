# NABC Autocomplete and Hover System

This document demonstrates the NABC (Neumatic Adiastematic Neume Notation) autocomplete and hover system implemented for the Gregorio LSP server.

## Features Overview

### 🎼 **Complete NABC Support**
- **31 St. Gall glyphs** (gregall/gresgmodern fonts)
- **29 Laon glyphs** (grelaon font) + uncinus, oriscus-clivis
- **25+ significant letters** + Tironian notes for Laon
- **6 modifier types** with variants (S, G, M, -, >, ~)
- **Font-aware validation** and completions
- **Semantic analysis** with warnings

### 🔧 **Integration Capabilities**
- Real-time autocomplete as you type
- Hover information with detailed descriptions
- Context-aware suggestions based on current font
- Validation with error highlighting
- Manuscript source references

## Usage Examples

### Basic Glyph Completion

When typing in a NABC snippet, the system provides intelligent completions:

```gabc
nabc-lines: 1;
(f3) AL(ef~|ta>)le(fg/hggf|pe█
```

**Autocomplete suggestions for "pe":**
- `pe` - **pes** - Two-note ascending neume (podatus)
- `peS` - **pes with mark modification** 
- `peG` - **pes with grouping modification**
- `pe>` - **pes with augmentive liquescence**
- `pe-` - **pes with episema**

### Complex Glyph with Modifiers

```gabc
(f3) Gloria(gh|cl>1lse7█
```

**Hover over "cl>1":**
```
### clivis with augmentive liquescence

**Code:** `cl>1`

Base glyph: **clivis** (`cl`)

Two-note descending neume

**Modifier:** Augmentive liquescence (variant 1)
```

### Significant Letters Completion

```gabc
(f3) Kyrie(gh|vilsc█
```

**Autocomplete for "lsc":**
- `lsc2` - **celeriter** - Quickly, fast (position 2)
- `lsc3` - **celeriter** - Quickly, fast (position 3)  
- `lsc6` - **celeriter** - Quickly, fast (position 6)

**Hover over "lsc3":**
```
### celeriter

**Code:** `lsc3`

Quickly, fast

**Category:** rhythm
**Font families:** gregall, gresgmodern
**Valid positions:** 1, 2, 3, 4, 6, 7, 8, 9
```

### Compound Glyphs

```gabc
(f3) Sanctus(gh|ql!cl>ppt1█
```

**Hover over "ql!cl>ppt1":**
```
### Complex Compound Glyph

**Components:** 
- **quilisma** (`ql`) - Wavy ascending neume with 3 loops
- **clivis** (`cl`) - Two-note descending neume

**Modifiers:** Augmentive liquescence (>)
**Prepunctis:** 1 tractulus before the neume

**Manuscript sources:** C148A, C26A, C40V
```

### Font-Specific Features

#### Laon Font Features
```gabc
nabc-lines: 1;
(c4) Veni(fg|un█
```

**Laon-specific completions:**
- `un` - **uncinus** - Hook-shaped neume (Laon only)
- `oc` - **oriscus-clivis** - Oriscus + clivis (Laon only)

**Tironian Notes (Laon only):**
- `lti1` - **iusum** - Commanded, ordered
- `ltdo2` - **deorsum** - Downward
- `ltsp3` - **supra** - Above, over

### Validation and Warnings

#### Error Detection
```gabc
(f3) Test(gh|xyz█  // ❌ Unknown glyph code: xyz
```

#### Font Compatibility Warnings  
```gabc
% Font: grelaon
nabc-lines: 1;
(c4) Test(fg|qi█  // ⚠️ Glyph 'qi' not available in grelaon font
```

#### Semantic Warnings
```gabc
(f3) Test(gh|cl>-█  // ℹ️ Liquescence and episema rarely used together
```

## Implementation Details

### Type System
```typescript
interface NABCBasicGlyph {
  code: string;              // "cl", "pe", "vi"
  name: string;              // "clivis", "pes", "virga" 
  description: string;       // Human-readable description
  fontFamilies: NABCFontFamily[];  // Compatibility
  category: 'simple' | 'compound' | 'special';
  manuscriptSources?: string[];    // Historical references
}
```

### Completion Provider
```typescript
export class NABCCompletionProvider {
  getGlyphCompletions(): CompletionItem[]
  getModifierCompletions(): CompletionItem[]
  getSignificantLetterCompletions(): CompletionItem[]
  getSpacingCompletions(): CompletionItem[]
  getPitchCompletions(): CompletionItem[]
}
```

### Hover Provider
```typescript
export class NABCHoverProvider {
  getHoverInfo(element: string): Hover | null
  parseComplexGlyph(element: string): Hover | null
}
```

### Validation System
```typescript
export class NABCValidator {
  validateNABCSnippet(snippet: string): Diagnostic[]
  validateComplexNeume(neume: NABCComplexGlyph): void
  validateSemanticConstraints(neume: NABCComplexGlyph): void
}
```

## Advanced Features

### Spacing Adjustments
```gabc
(f3) Text(gh|``po////pe>█
```
- `//` - Large space right
- `/` - Inter-element space right  
- ```` - Large space left
- ``` - Inter-element space left

### Subpunctis and Prepunctis
```gabc
(f3) Text(gh|pesu2sut1ppt3█
```
- `su2` - 2 subpunctis (below)
- `sut1` - 1 subpunctis tractulus  
- `ppt3` - 3 prepunctis tractulis

### Pitch Descriptors
```gabc
(f3) Text(gh|clhhpe>hh█
```
- `hh` - Pitch level h for both glyphs
- `ha` through `hp` - All pitch levels supported

## Configuration

### Font Selection
The system automatically detects font family from:
1. Font annotations in GABC headers
2. Explicit font declarations
3. Filename conventions
4. Defaults to St. Gall (`gregall`)

### Validation Levels
- **Errors:** Syntax violations, unknown codes
- **Warnings:** Font incompatibility, unusual patterns  
- **Information:** Semantic suggestions, best practices

## Manuscript Sources

All glyphs include references to historical manuscripts:
- **St. Gall:** Cantatorium codex 359, Einsiedeln 121
- **Laon:** Graduale Laudunensis codex 239
- **Other:** Bamberg lit. 6, various medieval sources

## Benefits

1. **Accuracy:** Based on official Gregorio documentation
2. **Completeness:** All 60+ glyphs, modifiers, letters documented
3. **Intelligence:** Context-aware, font-specific suggestions
4. **Education:** Manuscript sources and historical context
5. **Productivity:** Faster NABC notation entry with fewer errors

This system transforms NABC notation from a complex manual process into an assisted, intelligent workflow while maintaining full compatibility with the official Gregorio typesetting system.