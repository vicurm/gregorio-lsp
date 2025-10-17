# Comprehensive NABC Analysis - Official Gregorio Documentation

## Overview

A comprehensive analysis of NABC (Neumatic Adiastematic Neume Notation) based on official Gregorio documentation and local project implementations.

## Official NABC Language Specification (Gregorio Repository)

### Basic Structure

NABC provides the ability to describe adiastematic neumes, currently supporting:
- **St. Gallen style** (using `gregall` and `gresgmodern` fonts)
- **Laon (Metz notation family) style** (using `grelaon` font)

### Header Configuration

```gabc
nabc-lines: x;
```

Where `x` is the maximum number of consecutive NABC snippets allowed.

### Snippet Organization

NABC snippets are separated by `|` character from GABC snippets:
- `nabc-lines: 1;` creates alternating pattern: `(gabc|nabc|gabc|nabc|gabc)`
- `nabc-lines: 2;` allows patterns like: `(gabc|nabc1|nabc2|gabc|nabc1)`

### Complex Neume Descriptor Structure

Each NABC snippet consists of **complex neume descriptors**, which have this structure:

1. **Optional horizontal spacing adjustment descriptor**
2. **Complex glyph descriptor** (mandatory)
3. **Optional subpunctis and prepunctis descriptors**
4. **Optional significant letter descriptors**

## 1. Horizontal Spacing Adjustment Descriptor

Controls horizontal positioning with sequences of:

- `//` - move right by `nabclargerspace`
- `/` - move right by `nabcinterelementspace` 
- ``` (backtick backtick) - move left by `nabclargerspace`
- ``` (single backtick) - move left by `nabcinterelementspace`

## 2. Complex Glyph Descriptor

### Structure
- **Glyph descriptor** (mandatory)
- Optional additional **glyph descriptors** separated by `!` (for compound glyphs)

### Basic Glyph Descriptor Components
- **Basic glyph descriptor** (2-letter code)
- **Optional glyph modifiers**
- **Optional pitch descriptor**

## 3. Basic Glyph Descriptors

### St. Gall Family (gregall/gresgmodern fonts) - 31 Codes

| Code | Name | Description |
|------|------|-------------|
| `vi` | virga | Single vertical stroke |
| `pu` | punctum | Single dot |
| `ta` | tractulus | Small horizontal stroke |
| `gr` | gravis | Descending stroke |
| `cl` | clivis | Two-note descending |
| `pe` | pes | Two-note ascending |
| `po` | porrectus | Three-note low-high-low |
| `to` | torculus | Three-note high-low-high |
| `ci` | climacus | Descending series |
| `sc` | scandicus | Ascending series |
| `pf` | porrectus flexus | Porrectus + descending |
| `sf` | scandicus flexus | Scandicus + descending |
| `tr` | torculus resupinus | Torculus + ascending |
| `st` | stropha | Single stropha |
| `ds` | distropha | Double stropha |
| `ts` | tristropha | Triple stropha |
| `tg` | trigonus | Triangle shape |
| `bv` | bivirga | Two virgae |
| `tv` | trivirga | Three virgae |
| `pr` | pressus maior | Large pressus |
| `pi` | pressus minor | Small pressus |
| `vs` | virga strata | Horizontal virga |
| `or` | oriscus | Wavy note |
| `sa` | salicus | Oriscus + ascending |
| `pq` | pes quassus | Oriscus pes |
| `ql` | quilisma (3 loops) | Wavy ascending 3 loops |
| `qi` | quilisma (2 loops) | Wavy ascending 2 loops |
| `pt` | pes stratus | Horizontal pes |
| `ni` | nihil | Empty placeholder |

### Laon Family (grelaon font) - 29 Codes

Similar to St. Gall but with differences:
- **Added**: `un` (uncinus), `oc` (oriscus-clivis)
- **Removed**: `st` (stropha), `qi` (2-loop quilisma), `gr` (gravis - different usage)

## 4. Glyph Modifiers

Six modifier types (can include numbers for variants):

| Modifier | Description | Usage |
|----------|-------------|--------|
| `S` | Modification of the mark | Shape modification |
| `G` | Modification of grouping | Neumatic break |
| `M` | Melodic modification | Pitch alteration |
| `-` | Addition of episema | Horizontal stroke |
| `>` | Augmentive liquescence | Lengthening |
| `~` | Diminutive liquescence | Shortening |

**Examples:**
- `cl>` - augmentive liquescent clivis (ancus)
- `cl>1` - first variant of augmentive liquescent clivis
- `vi-` - virga with episema

## 5. Pitch Descriptor

Format: `h` + pitch letter (`a` through `n` and `p`)
- Default if missing: `hf`
- Same pitch should be used for all glyphs in a complex descriptor

**Examples:**
- `hg` - pitch level g
- `hj` - pitch level j

## 6. Subpunctis and Prepunctis Descriptors

### Format
`su`/`pp` + optional modifier + mandatory number

### Subpunctis (`su`)
- `su1`, `su2`, `su3`, etc. - puncta below
- Modifiers available:
  - `t` - tractulus
  - `u` - tractulus with episema  
  - `v` - tractulus with double episema
  - `w` - gravis
  - `x` - liquescens stropha
  - `y` - gravis with episema

### Prepunctis (`pp`)
- `pp1`, `pp2`, `pp3`, etc. - puncta before/above
- Used for rising sequences in compound neumes

**Examples:**
- `pesu2` - pes with two subpunctis
- `vippt3` - virga with three tractuli before it
- `peSsut2` - pes (S-modified) with two tractuli below

## 7. Significant Letter Descriptors

### Format
`ls` + shorthand + position number (1-9)

### Position Grid
```
1   2   3
4   X   6  
7   8   9
```

Where X is the neume position.

**Special case**: Laon fonts also support position `5` (inside the neume).

### Common Shorthands (St. Gall)

| Code | Meaning | Description |
|------|---------|-------------|
| `lsal` | altius | Higher |
| `lsam` | altius mediocriter | Moderately higher |
| `lsb` | bene | Well |
| `lsc` | celeriter | Quickly |
| `lscm` | celeriter mediocriter | Moderately quickly |
| `lsco` | coniunguntur | Connected |
| `lsd` | deprimatur | Lower |
| `lse` | equaliter | Equally |
| `lsf` | fastigium | Peak |
| `lsi` | inferius | Lower |
| `lsim` | inferius mediocriter | Moderately lower |
| `lsl` | levare | Raise |
| `lsm` | mediocriter | Moderately |
| `lsp` | parvum | Small |
| `lsr` | resupinum | Turned back |
| `lssc` | sursum celeriter | Upward quickly |
| `lssm` | sursum mediocriter | Upward moderately |
| `lst` | tenere | Hold |
| `lstw` | tenere (wide form) | Hold (wide) |
| `lsv` | valde | Very |
| `lsvol` | volubiliter | Rolling |
| `lsx` | expectare | Wait |

### Laon Specific Shorthands

| Code | Meaning | Description |
|------|---------|-------------|
| `lsa` | augete | Increase |
| `lseq` | equaliter | Equally |
| `lseq-` | equaliter | Equally (variant) |
| `lsequ` | equaliter | Equally (variant) |
| `lsf` | fastigium | Peak |
| `lsh` | humiliter | Humbly |
| `lshn` | humiliter nectum | Humbly connected |
| `lshp` | humiliter parum | Slightly humbly |
| `lsn` | non (tenere), negare, nectum, naturaliter | No/naturally |
| `lsnl` | non levare | Don't raise |
| `lsnt` | non tenere | Don't hold |
| `lsmd` | mediocriter | Moderately |
| `lss` | sursum | Upward |
| `lssimp` | simpliciter | Simply |
| `lssp` | sursum parum | Slightly upward |
| `lsst` | sursum tenere | Hold upward |

### Tironian Notes (Laon only)

Format: `lt` + shorthand + position (1-9, except 5)

| Code | Meaning |
|------|---------|
| `lti` | iusum |
| `ltdo` | deorsum |
| `ltdr` | devertit |
| `ltdx` | devexum |
| `ltps` | prode sub eam |
| `ltqm` | quam mox |
| `ltsb` | sub |
| `ltse` | seorsum |
| `ltsj` | subjice |
| `ltsl` | saltim |
| `ltsn` | sonare |
| `ltsp` | supra |
| `ltsr` | sursum |
| `ltst` | saltate |
| `ltus` | ut supra |

## 8. Complex Examples from Official Documentation

### Example 1: Complex NABC snippet
```
```po////pe>2lse7lsl3qlhh!vshhppt1sut2ql>ppu3
```

**Breakdown:**
- ``` - negative horizontal skip (move left)
- `po` - basic porrectus at default pitch
- `////` - horizontal skip right (2x nabclargerspace)  
- `pe>2lse7lsl3` - 3rd augmentive liquescent pes with equaliter (position 7) and levare (position 3)
- `qlhh!vshhppt1sut2` - 3-loop quilisma joined with virga strata, both at pitch hh, with prepunctis tractulus and 2 subpunctis tractuli
- `ql>ppu3` - liquescent 3-loop quilisma with 3 prepunctis tractulis with episema

### Example 2: Complete GABC with NABC
```gabc
nabc-lines: 1;
(f3) AL(ef~|ta>)le(fg/hggf|peclhgpi)lú(ef~|ta>)ia.(f.|ta-)
(,)
(ii//|bv-|gh!ivHG//|vi-hhppu2su1sut1|fhg/|to|eef.|pt) (;)
```

## 9. Font Coverage

### Gregall Font
- Primary St. Gall implementation
- Extensive glyph coverage with manuscript sources
- Supports full basic glyph set + modifiers + compound forms

### Gresgmodern Font  
- Modern St. Gall variant
- Similar coverage to gregall

### Grelaon Font
- Laon/Metz notation family
- Different glyph set (uncinus, oriscus-clivis)
- Tironian notes support
- Position 5 (inside neume) for significant letters

## 10. Implementation Notes

### Compound Glyphs
- Multiple basic glyphs joined with `!`
- Each component can have its own modifiers and pitch
- Examples: `ql!cl`, `to!cl!po`, `vi!ci`

### Manuscript Sources
- Fonts based on historical manuscripts
- Cantatorium codex 359 (St. Gall)
- Einsiedeln codex 121
- Graduale Laudunensis codex 239 (Laon)
- Various other medieval sources

### Current Limitations
- No relative pitch differences within compound glyphs in current fonts
- Artificial `ni` (nihil) for positioning letters without base glyph
- Single NABC snippet not split across lines

## 11. Validation Requirements for LSP

### Syntactic Validation
1. **Header validation**: `nabc-lines: x;` format with valid number
2. **Snippet alternation**: Respect max consecutive NABC snippets
3. **Glyph code validation**: Check against valid 2-letter codes per font
4. **Modifier validation**: Valid modifier characters with proper numbers
5. **Pitch descriptor validation**: `h` + valid pitch letter
6. **Subpunctis/prepunctis validation**: Proper format with valid modifiers
7. **Significant letter validation**: Valid shorthands + position numbers
8. **Spacing descriptor validation**: Valid spacing character sequences

### Semantic Validation  
1. **Font consistency**: Glyph codes must match selected font family
2. **Position validation**: Significant letter positions must be valid for glyph type
3. **Compound glyph validation**: Proper `!` separation and component validity
4. **Modifier compatibility**: Some modifiers may be incompatible with certain glyphs
5. **Tironian note restrictions**: Only available in Laon fonts, position 5 invalid

### Warning Cases
1. **Missing pitch descriptors** in compound glyphs
2. **Inconsistent pitches** within complex descriptors  
3. **Unusual modifier combinations**
4. **Position conflicts** in significant letters
5. **Font-specific feature usage** (e.g., Tironian notes in non-Laon fonts)

This comprehensive analysis provides the foundation for implementing robust NABC validation in the Gregorio LSP server, covering both syntactic correctness and semantic consistency with the official Gregorio specification.

## Complete NABC Code Reference

### Basic Glyph Descriptors by Font Family

#### St. Gall Family (gregall, gresgmodern) - 31 Codes

**Single Notes**:
- `vi` - virga (single vertical stroke)
- `pu` - punctum (single dot)
- `ta` - tractulus (small horizontal stroke) 
- `gr` - gravis (descending stroke)

**Two-Note Neumes**:
- `cl` - clivis (two-note descending)
- `pe` - pes (two-note ascending)

**Three-Note Neumes**:
- `po` - porrectus (three-note low-high-low)
- `to` - torculus (three-note high-low-high)

**Multi-Note Neumes**:
- `ci` - climacus (descending series)
- `sc` - scandicus (ascending series)

**Compound Neumes**:
- `pf` - porrectus flexus (porrectus + descending)
- `sf` - scandicus flexus (scandicus + descending)
- `tr` - torculus resupinus (torculus + ascending)

**Repeated Notes**:
- `st` - stropha (single stropha)
- `ds` - distropha (double stropha)
- `ts` - tristropha (triple stropha)

**Multiple Virgae**:
- `bv` - bivirga (two virgae)
- `tv` - trivirga (three virgae)

**Special Forms**:
- `tg` - trigonus (triangle shape)
- `pr` - pressus maior (large pressus)
- `pi` - pressus minor (small pressus)
- `vs` - virga strata (horizontal virga)

**Ornamental**:
- `or` - oriscus (wavy note)
- `sa` - salicus (oriscus + ascending)
- `pq` - pes quassus (oriscus pes)
- `ql` - quilisma (3 loops - wavy ascending)
- `qi` - quilisma (2 loops - wavy ascending)

**Positional**:
- `pt` - pes stratus (horizontal pes)

**Placeholder**:
- `ni` - nihil (empty placeholder)

#### Laon Family (grelaon) - 29 Codes

**All St. Gall codes EXCEPT**:
- `st` - stropha (not available)
- `qi` - quilisma 2-loop (not available)  
- `gr` - gravis (different usage pattern)

**Additional Laon-specific codes**:
- `un` - uncinus (hook-shaped note)
- `oc` - oriscus-clivis (compound oriscus + clivis)

### Glyph Modifiers (All Fonts)

- `S` - mark modification
- `G` - grouping modification (neumatic break)
- `M` - melodic modification
- `-` - episema addition
- `>` - augmentive liquescence
- `~` - diminutive liquescence

### Pitch Descriptors (All Fonts)

Format: `h[a-np]` (excludes 'o' which represents clef)

**Valid pitch letters**: `a`, `b`, `c`, `d`, `e`, `f`, `g`, `h`, `i`, `j`, `k`, `l`, `m`, `n`, `p`

### Subpunctis/Prepunctis Descriptors

**Base codes**:
- `su` - subpunctis (marks below neume)
- `pp` - prepunctis (marks above neume)

**St. Gall modifiers**: `t`, `u`, `v`, `w`, `x`, `y`
**Laon modifiers**: `n`, `q`, `z`, `x`

### Significant Letters

**Base code**: `ls`

#### St. Gall Significant Letters (48 shorthands)

**Single Letters**: `b`, `c`, `d`, `e`, `l`, `m`, `s`, `t`, `v`

**Compound Instructions**:
- `al` - altius (higher)
- `am` - altius mediocriter (higher moderately)
- `cm` - celeriter mediocriter (quickly moderately)
- `co` - coniunguntur (connected)
- `cw` - celeriter (wide form)
- `ew` - equaliter (wide form)
- `fid` - fideliter (faithfully)
- `len` - leniter (gently)
- `lb` - levare bene (raise well)
- `lc` - levare celeriter (raise quickly)
- `lm` - levare mediocriter (raise moderately)
- `moll` - molliter (softly)
- `pulcre` - pulcre (beautifully)
- `sb` - sursum bene (upward well)
- `sc` - sursum celeriter (upward quickly)
- `simil` - similiter (similarly)
- `simul` - simul (simultaneously)
- `tw` - tenere (wide form)

**Additional shorthands**: `accel`, `ap`, `aug`, `ben`, `ca`, `cel`, `cl`, `cla`, `da`, `de`, `dep`, `du`, `eq`, `fr`, `g`, `inf`, `le`, `med`, `mo`, `n`, `oc`, `pm`, `pr`, `pressus`, `rf`, `rg`, `ro`, `te`, `us`, `x`

#### Laon Significant Letters (25 shorthands)

**Basic**: `a`, `c`, `eq`, `h`, `l`, `m`, `n`, `s`, `t`

**Compound**: `eq-`, `equ`, `f`, `hn`, `hp`, `md`, `nl`, `nt`, `simp`, `simpl`, `sp`, `th`

### Tironian Letters (Laon Only)

**Base code**: `lt`

**15 shorthands**: `i`, `do`, `dr`, `dx`, `ps`, `qm`, `sb`, `se`, `sj`, `sl`, `sn`, `sp`, `sr`, `st`, `us`

### Position Numbers (All Letter Types)

**Valid positions**: `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`

**Note**: Position `5` is invalid for Tironian letters.

This complete reference enables comprehensive validation and autocomplete functionality in the Gregorio LSP server.