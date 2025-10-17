# Comprehensive GABC File Structure Analysis

## Overview

A comprehensive analysis of GABC file structure based on official Gregorio documentation (GregorioRef) and implementation specifications. This document serves as the authoritative reference for LSP semantic validation and parsing.

**Document Version**: 1.0.0  
**Based on**: Gregorio Project Official Documentation  
**Purpose**: LSP semantic analysis and validation

---

## Table of Contents

1. [File Structure Overview](#file-structure-overview)
2. [Header Section](#header-section)
3. [Body Section](#body-section)
4. [Text Notation](#text-notation)
5. [Musical Notation](#musical-notation)
6. [Special Elements](#special-elements)
7. [Validation Rules](#validation-rules)

---

## 1. File Structure Overview

### Basic Structure

A GABC file consists of two main sections separated by `%%`:

```gabc
[HEADER SECTION]
%%
[BODY SECTION]
```

### Formal Definition

```bnf
gabc-file ::= header-section separator body-section
separator ::= "%%"
header-section ::= header-field*
body-section ::= score-element+
```

### Example

```gabc
name: Populus Sion;
mode: 2;
annotation: Ant.;
%%
Po(eh/hi)pu(h)lus(h) Si(hi)on(hgh)
```

---

## 2. Header Section

### 2.1 Header Structure

Headers consist of key-value pairs with the format:

```
key: value;
```

### 2.2 Multi-line Values

For values spanning multiple lines:
- Omit the semicolon at the end of the first line
- End with double semicolon `;;`

```gabc
commentary: This is a long commentary
that spans multiple lines
and needs more space;;
```

### 2.3 Mandatory Headers

Only one header is mandatory:

#### `name` (MANDATORY)
- **Purpose**: Name of the piece, typically the incipit (first few words)
- **Format**: Text string
- **Examples**:
  - `name: Kyrie X Alme Pater;`
  - `name: Sanctus XI;`
  - `name: Populus Sion;`

### 2.4 Special Meaning Headers

These headers have special processing by Gregorio:

#### `gabc-copyright`
- **Purpose**: Copyright notice for the GABC file itself
- **Format**: License identifier + copyright holder + year + URL
- **Example**: `gabc-copyright: CC0-1.0 by Elie Roux, 2009 <http://creativecommons.org/publicdomain/zero/1.0/>;`

#### `score-copyright`
- **Purpose**: Copyright notice for the source score
- **Format**: Copyright statement
- **Example**: `score-copyright: (C) Abbaye de Solesmes, 1934;`

#### `author`
- **Purpose**: Original composer (often unknown for traditional chant)
- **Format**: Text string
- **Example**: `author: Unknown;`

#### `language`
- **Purpose**: Language of the lyrics (affects vowel centering rules)
- **Format**: Language code or name
- **Supported**: Latin (default), English (en), Polish (pl), Czech (cs), Slovak (sk), Slavic
- **Example**: `language: Latin;`

#### `oriscus-orientation`
- **Purpose**: Control oriscus orientation behavior
- **Values**: `legacy` (manual orientation required)
- **Example**: `oriscus-orientation: legacy;`

#### `mode`
- **Purpose**: Modal classification (1-8 typically)
- **Format**: Arabic number (converted to Roman numerals in output)
- **Placement**: Appears above initial unless `annotation` or `\greannotation` defined
- **Examples**:
  - `mode: 6;`
  - `mode: 1;`

#### `mode-modifier`
- **Purpose**: Additional mode designation (e.g., "transposed")
- **Format**: TeX code
- **Condition**: Only typeset if mode is typeset
- **Example**: `mode-modifier: transposed;`

#### `mode-differentia`
- **Purpose**: Psalm tone variant designation
- **Format**: TeX code
- **Condition**: Only typeset if mode is typeset
- **Example**: `mode-differentia: g;`

#### `annotation`
- **Purpose**: Text above the initial letter
- **Usage**: One or two fields (first = upper line, second = lower line)
- **Format**: Plain text or TeX markup
- **Examples**:
  ```gabc
  annotation: Ad Magnif.;
  annotation: VIII G;
  ```
  ```gabc
  annotation: {\color{red}Ad Magnif.};
  annotation: {\color{red}VIII G};
  ```

#### `staff-lines`
- **Purpose**: Number of staff lines
- **Range**: 2 to 5
- **Default**: 4
- **Example**: `staff-lines: 4;`

#### `nabc-lines`
- **Purpose**: NABC alternation pattern control
- **Format**: Integer (maximum consecutive NABC snippets)
- **Pattern**: `nabc-lines: 1;` → `(gabc|nabc|gabc|nabc|...)`
- **Pattern**: `nabc-lines: 2;` → `(gabc|nabc1|nabc2|gabc|nabc1|nabc2|...)`
- **Example**: `nabc-lines: 1;`
- **See**: [NABC_COMPREHENSIVE_ANALYSIS.md](./NABC_COMPREHENSIVE_ANALYSIS.md) for details

### 2.5 Suggested Headers (No Special Processing)

These headers are metadata for cataloging and reference:

#### `office-part`
- **Purpose**: Liturgical category (Latin)
- **Values**: `antiphona`, `hymnus`, `responsorium breve`, `responsorium prolixum`, `introitus`, `graduale`, `tractus`, `offertorium`, `communio`, `kyrie`, `gloria`, `credo`, `sanctus`, `benedictus`, `agnus dei`
- **Example**: `office-part: antiphona;`

#### `occasion`
- **Purpose**: Liturgical occasion (Latin)
- **Examples**:
  - `occasion: Dominica II Adventus;`
  - `occasion: Commune doctorum;`
  - `occasion: Feria secunda;`

#### `meter`
- **Purpose**: Metrical pattern for hymns
- **Format**: Syllable counts per line (dot-separated)
- **Example**: `meter: 8.8.8.8;` (4 lines of 8 syllables each)

#### `commentary`
- **Purpose**: Source of text (biblical references, etc.)
- **Format**: Text string
- **Example**: `commentary: Ps. 95: 11-13;`

#### `arranger`
- **Purpose**: Modern arranger name (person or institution)
- **Examples**:
  - `arranger: Solesmes;`
  - `arranger: John Smith;`

#### `date`
- **Purpose**: Composition or attestation date
- **Format**: Latin style (e.g., `XI. s.` for 11th century)
- **Examples**:
  - `date: XI. s.;`
  - `date: ca. 1100;`

#### `manuscript`
- **Purpose**: Manuscript identification
- **Example**: `manuscript: Montpellier H.159;`

#### `manuscript-reference`
- **Purpose**: Unique piece reference (e.g., CAO number)
- **Format**: System prefix + reference
- **Example**: `manuscript-reference: CAO 4325;`

#### `manuscript-storage-place`
- **Purpose**: Manuscript location
- **Example**: `manuscript-storage-place: Bibliothèque Nationale, Paris;`

#### `book`
- **Purpose**: Source book for transcription
- **Example**: `book: Liber Usualis;`

#### `transcriber`
- **Purpose**: Name of person who created GABC file
- **Example**: `transcriber: Elie Roux;`

#### `transcription-date`
- **Purpose**: Date GABC file created
- **Format**: YYYYMMDD
- **Example**: `transcription-date: 20090129;`

#### `user-notes`
- **Purpose**: Arbitrary additional notes
- **Format**: Free text
- **Example**: `user-notes: This piece requires special attention to tempo;`

### 2.6 Header Validation Rules

1. **Mandatory**: `name` must be present
2. **Format**: Each header must follow `key: value;` pattern
3. **Multi-line**: Multi-line values must end with `;;`
4. **Uniqueness**: Most headers should appear only once
5. **Exception**: `annotation` may appear twice (upper and lower line)
6. **NABC**: If `nabc-lines` present, body must follow alternation pattern

---

## 3. Body Section

### 3.1 Basic Structure

The body section begins after `%%` and contains the actual score notation.

### 3.2 Score Elements

A score element consists of:

```
text(notes)
```

Where:
- `text` = syllable or punctuation
- `notes` = musical notation in parentheses

### 3.3 Clef Notation

Clefs are specified at the beginning or when changing:

#### Format
```
(clef)
```

#### Clef Components
- **Letter**: `c` (do clef) or `f` (fa clef)
- **Optional**: `b` (flat on clef)
- **Number**: Line number (1-5, bottom to top)

#### Examples
```gabc
(c4)    % Do clef on 4th line
(f3)    % Fa clef on 3rd line
(cb4)   % Do clef on 4th line with flat
```

#### Double Clefs (v4.1+)
```gabc
(c4@c2)  % Two clefs (stacked or side-by-side)
```

### 3.4 Word and Syllable Separation

- **Space** between words: `Po(eh)pu(h)lus(h) Si(hi)on(hgh)`
- **No space** within words: `Po(eh)pu(h)lus(h)`
- **Hyphenation**: Automatic in output

---

## 4. Text Notation

### 4.1 Basic Text Rules

- Text precedes notes: `syl(notes)`
- Empty syllable for bar only: `(::)`
- Punctuation with bar: `jus:(g) (:)` not `jus(g) :(:)`

### 4.2 Text Centering

#### Automatic Vowel Detection
Gregorio automatically centers neumes over vowels based on language rules.

#### Manual Vowel Specification
Use braces to override automatic detection:
```gabc
e{ve}r(e)  % Centers over "ve" instead of "e"
```

#### Alternative Centering Rules
In TeX document:
```latex
\gresetlyriccentering{syllable}    % Center whole syllable
\gresetlyriccentering{firstletter} % Center first letter
\gresetlyriccentering{vowel}       % Default: center on vowel
```

#### Language-Specific Rules
Defined in `gregorio-vowels.dat`:
- **Latin**: Default
- **English**: `language: en;`
- **Polish**: `language: pl;`
- **Czech**: `language: cs;`
- **Slovak**: `language: sk;`
- **Slavic**: Various aliases

### 4.3 Initial Letter

- **Automatic**: First letter of first syllable
- **Control**: `\gresetinitiallines{n}` in TeX (n=0 disables)
- **Hyphen**: Automatic for single-letter syllables (can disable)

### 4.4 Special Characters

#### Unicode Support
Direct entry of unicode characters: `ǽ`, `œ́`, etc.

#### Special Markup Tags
```gabc
<sp>R/</sp>   % Barred R (℟ Response)
<sp>V/</sp>   % Barred V (℣ Versicle)
<sp>A/</sp>   % Barred A
<sp>'ae</sp>  % ǽ (a with acute and ligature)
```

#### TeX Code Tags
```gabc
<v>{\ae}</v>  % TeX code for æ
```

#### Custom Special Characters
In TeX document:
```latex
\gresetspecial{'y}{ý}  % Define <sp>'y</sp> as ý
```

### 4.5 Text Styling

Markup tags for styled text:

```gabc
<i>text</i>     % Italic
<b>text</b>     % Bold
<ul>text</ul>   % Underline (not in Plain TeX)
<c>text</c>     % Colored (gregoriocolor)
<sc>text</sc>   % Small capitals
```

**Example**:
```gabc
<i>Ps.</i>(::)
```

---

## 5. Musical Notation

### 5.1 Pitch Notation

#### Pitch Letters
13 possible pitches: `a` through `m`

- **Lowercase** (`a-m`): punctum quadratum (square note)
- **Uppercase** (`A-M`): punctum inclinatum (diamond note)

#### Pitch Correspondence
```
Staff line (4-line staff):
Top (4):    m
           l k
Mid (3):    j
           i h
(2):        g
           f e
Bottom (1): d
           c b a
```

**Note**: Letter-to-pitch mapping is independent of clef position.

### 5.2 One-Note Neumes

#### Basic Shapes
```gabc
g       % punctum quadratum (square)
G       % punctum inclinatum (diamond)
```

#### Note Modifiers
```gabc
go      % oriscus (auto direction)
go0     % oriscus pointing down
go1     % oriscus pointing up
gs      % stropha
gw      % quilisma
```

#### Punctum Inclinatum Variants
```gabc
G0      % Descending series shape
G1      % Ascending series shape
G2      % Unison series shape
```

### 5.3 Complex Neumes

#### Formation
Simply concatenate pitch letters:
```gabc
ef      % Two-note ascending
ge      % Two-note descending
fgh     % Three-note ascending
```

#### Quilisma in Neumes
Add `w` after the quilisma pitch:
```gabc
fgwh    % Scandicus with quilisma on g
```

#### Automatic Glyph Selection
Gregorio automatically determines neume shapes based on pitch sequences.

### 5.4 Virga

#### Automatic Virgae
Added automatically to note groups that require them.

#### Manual Control
```gabc
gv      % Force virga on right
gV      % Force virga on left
@efg    % Suppress automatic virga for this group
```

### 5.5 Separation Bars

Using punctuation characters:

```gabc
(,)     % Quarter bar (comma)
(;)     % Half bar (semicolon)
(:)     % Full bar (colon)
(::)    % Final bar (double colon)
```

#### Bar Between Syllables
Treat bar as separate syllable:
```gabc
jus(g) (::) Di(g)
```

#### Bar with Text Punctuation
Place punctuation with preceding word:
```gabc
jus:(g) (:)    % Correct
% NOT: jus(g) :(:)
```

### 5.6 Advanced Notation Elements

#### Alterations
```gabc
gx      % Natural
gy      % Sharp
g#      % Sharp (alternative)
```

#### Custos
```gabc
g+      % Custos at pitch g
z0      % Invisible custos (for spacing)
```

#### Spacing
```gabc
/       % Small space
//      % Larger space
!       % Break line hint
/0      % No space
```

#### Horizontal Episema
```gabc
g_h     % Horizontal episema over g and h
```

#### Augmentum Duplex (Double Dot)
```gabc
g..     % Augmentum duplex
```

---

## 6. Special Elements

### 6.1 NABC Integration

When `nabc-lines` header is present, the body follows alternation patterns:

```gabc
nabc-lines: 1;
%%
(c4) Po(eh|vi-pecl)pu(h|ta)lus(h|ta)
```

**Pattern**: `(gabc|nabc|gabc|nabc|...)`

See [NABC_COMPREHENSIVE_ANALYSIS.md](./NABC_COMPREHENSIVE_ANALYSIS.md) for complete NABC specification.

### 6.2 Choral Signs

Above-note indicators:

```gabc
g'      % Vertical episema (ictus)
g_      % Horizontal episema (start)
_g      % Horizontal episema (end)
g_h     % Continuous horizontal episema
```

### 6.3 Rhythm Signs

```gabc
g.      % Mora (dot)
g..     % Augmentum duplex
g'      % Vertical episema
g'0     % No vertical episema (suppress)
```

### 6.4 Above-Lines Text

```gabc
g[alt:text]         % Text above note
g[alt:*]           % Asterisk above
g[alt:cross]       % Cross symbol above
```

### 6.5 Translation Text

```gabc
g[alt:translation text]
```

---

## 7. Validation Rules

### 7.1 Header Validation

#### Mandatory Rules
1. ✅ `name` header MUST be present
2. ✅ Each header MUST follow `key: value;` format
3. ✅ Multi-line values MUST end with `;;`
4. ✅ Headers MUST appear before `%%` separator

#### Optional Rules
1. ⚠️ `annotation` may appear at most twice
2. ⚠️ `mode` should be 1-8 (but any text allowed)
3. ⚠️ `transcription-date` should match YYYYMMDD format
4. ⚠️ `staff-lines` should be 2-5

### 7.2 NABC Validation

When `nabc-lines` header is present:

1. ✅ Body MUST follow alternation pattern
2. ✅ NABC snippets MUST use valid descriptors
3. ✅ Odd positions: GABC notation
4. ✅ Even positions (up to `nabc-lines`): NABC notation

**Example**:
```gabc
nabc-lines: 1;
%%
(c4) Po(eh|vi)pu(h|ta)lus(h|ta)
     % eh = GABC, vi = NABC, h = GABC, ta = NABC
```

### 7.3 Body Validation

#### Structure Rules
1. ✅ Body MUST start with clef: `(c4)` or `(f3)`
2. ✅ Notes MUST be in parentheses: `text(notes)`
3. ✅ Pitches MUST be `a-m` (lowercase) or `A-M` (uppercase)
4. ✅ Bars MUST use valid separators: `,`, `;`, `:`, `::`

#### Text Rules
1. ✅ Text before notes: `syl(notes)` not `(notes)syl`
2. ✅ Spaces separate words
3. ✅ Empty syllable for bars: `(::)` acceptable

#### Musical Rules
1. ✅ Clef line number MUST match `staff-lines` (default 4)
2. ✅ Pitch sequences form valid neumes
3. ✅ Modifiers follow valid syntax: `go`, `gw`, `gs`, `gv`

### 7.4 Semantic Validation

#### Cross-Reference Validation
1. ✅ If `mode` present, value should be reasonable (1-8 typical)
2. ✅ If `language` present, should match known language
3. ✅ If `nabc-lines` present, body alternation must match
4. ✅ If `staff-lines` present, clef line numbers must be valid

#### Consistency Validation
1. ⚠️ Syllable count should roughly match note groups
2. ⚠️ Text language should match `language` header
3. ⚠️ Mode annotation should match `mode` header

---

## 8. Complete Example

### Minimal Valid GABC

```gabc
name: Example;
%%
(c4) Ex(e)am(f)ple(g)
```

### Complete GABC with All Features

```gabc
name: Populus Sion;
gabc-copyright: CC0-1.0 by Transcriber, 2024;
score-copyright: Public Domain;
office-part: antiphona;
occasion: Dominica II Adventus;
meter: ;
commentary: Is. 30:19, 30;
arranger: ;
author: ;
date: XI. s.;
manuscript: ;
manuscript-reference: CAO 4325;
manuscript-storage-place: ;
book: Liber Usualis;
transcriber: John Smith;
transcription-date: 20240117;
mode: 2;
mode-modifier: ;
mode-differentia: g;
annotation: Ant.;
annotation: II D;
staff-lines: 4;
language: Latin;
%%
(c4) PO(eh/hi)pu(h)lus(h) <i>Si</i>(hi)on,(hgh.) (;) 
ec(hihi)ce(e) <b>Dó</b>(ef)mi(f)nus(f) <sc>vé</sc>(f)ni(f)et(fe) 
ad(e) sal(egff)ván(fe)das(e.) (,) 
gen(f)tes:(ef..) (:) 
et(f) au(fe)dí(f)tam(fe) fá(e.f!gwh/hi)ci(h)et(h) 
Dó(hg)mi(hi)nus(i.) (,) 
gló(kjki)ri(i)am(i) vo(i)cis(hg) su(hiih)æ(gf..) (;) 
in(f) læ(hg)tí(hi)ti(kjki)a(i) <ul>cor</ul>(ih)dis(ij) 
ves(kjki)tri.(i.) (::)
```

### GABC with NABC Extension

```gabc
name: Example with NABC;
mode: 1;
nabc-lines: 1;
%%
(c4) Po(eh|vi-pecl)pu(h|ta)lus(h|ta) 
Si(hi|pe-pevi-peto)on(hgh|to-tocl)
```

---

## 9. References

### Official Documentation
- **GregorioRef**: https://gregorio-project.github.io/gabc/
- **Gregorio Project**: https://gregorio-project.github.io/
- **GABC Details**: https://gregorio-project.github.io/gabc/details.html
- **Legal Issues**: https://gregorio-project.github.io/legalissues.html

### Related Documents
- [NABC_COMPREHENSIVE_ANALYSIS.md](./NABC_COMPREHENSIVE_ANALYSIS.md) - NABC extension specification
- [LSP Implementation](../src/semanticAnalyzer.ts) - Semantic validation implementation

### Community Resources
- **GABC Summary**: https://gregorio-project.github.io/gabc/summary-gabc.pdf
- **Cheat Sheet**: http://gregoriochant.org/dokuwiki/doku.php/cheat_sheet
- **ABC Notation**: http://abcnotation.com/ (inspiration for GABC)

---

## 10. Implementation Notes for LSP

### Priority 1: Critical Validation
- ✅ Verify `name` header presence
- ✅ Validate `%%` separator exists
- ✅ Check header format: `key: value;`
- ✅ Validate clef at body start
- ✅ Check NABC alternation pattern when `nabc-lines` present

### Priority 2: Enhanced Validation
- ⚠️ Validate pitch letters `a-m` / `A-M`
- ⚠️ Check bar syntax: `,`, `;`, `:`, `::`
- ⚠️ Verify text-note pairing: `text(notes)`
- ⚠️ Validate mode range (1-8 typical)
- ⚠️ Check staff-lines range (2-5)

### Priority 3: Semantic Analysis
- 🔍 Cross-reference mode with annotation
- 🔍 Validate language codes
- 🔍 Check date formats
- 🔍 Verify NABC descriptor syntax
- 🔍 Analyze syllable-note correspondence

### Priority 4: Completion Support
- 💡 Header key suggestions
- 💡 Common header value completions
- 💡 Pitch letter completions
- 💡 NABC descriptor completions
- 💡 Bar separator completions

### Priority 5: Hover Information
- 📖 Header field documentation
- 📖 Musical notation explanations
- 📖 NABC descriptor meanings
- 📖 Special character references

---

## Appendix A: Header Quick Reference

| Header | Required | Type | Example |
|--------|----------|------|---------|
| `name` | ✅ Yes | Text | `name: Kyrie X;` |
| `mode` | ⚠️ Special | 1-8 or text | `mode: 6;` |
| `annotation` | ⚠️ Special | Text (max 2) | `annotation: Ant.;` |
| `nabc-lines` | ⚠️ Special | Integer | `nabc-lines: 1;` |
| `staff-lines` | ⚠️ Special | 2-5 | `staff-lines: 4;` |
| `language` | ⚠️ Special | Language code | `language: Latin;` |
| `gabc-copyright` | ⚠️ Special | License | `gabc-copyright: CC0-1.0...;` |
| `office-part` | ❌ No | Text | `office-part: antiphona;` |
| `transcriber` | ❌ No | Text | `transcriber: John Smith;` |
| All others | ❌ No | Various | See section 2.5 |

---

## Appendix B: Pitch Reference Chart

```
Clef: c4 (do clef on 4th line)

Staff:  Note:  Letter:
─────── (m)    m
        (l)    l
─────── (k)    k
        (j)    j
─────── (i)    i
        (h)    h
─────── (g)    g
        (f)    f
─────── (e)    e
        (d)    d
        (c)    c
        (b)    b
        (a)    a
```

---

## Appendix C: Complete Bar Reference

| Symbol | GABC | Name | Usage |
|--------|------|------|-------|
| `,` | `(,)` | Quarter bar | Minor pause, within phrase |
| `;` | `(;)` | Half bar | Medium pause, phrase end |
| `:` | `(:)` | Full bar | Major pause, section end |
| `::` | `(::)` | Final bar | Piece end |
| `virgula` | `(`)` | Virgula | Alternative pause mark |
| `divisio minimis` | `(,)` | Minimal division | Shortest pause |
| `divisio minor` | `(;)` | Minor division | Short pause |
| `divisio maior` | `(:)` | Major division | Long pause |
| `divisio finalis` | `(::)` | Final division | End pause |

---

## Document Metadata

**Version**: 1.0.0  
**Last Updated**: 2024-10-17  
**Author**: Gregorio LSP Project  
**Based On**: Gregorio Project Official Documentation  
**Status**: Complete

**Changelog**:
- 2024-10-17: Initial comprehensive document created
- Based on GregorioRef documentation analysis
- Integrated with NABC_COMPREHENSIVE_ANALYSIS.md
- Designed for LSP semantic validation implementation
