# Gregorio Compiler Integration

This document describes how the gregorio-lsp LSP integrates official error messages from the Gregorio compiler.

## Implemented Official Messages

### 1. Pipe Without nabc-lines Error

**Official Message**: `"You used character "|" in gabc without setting "nabc-lines" parameter. Please set it in your gabc header."`

**Source**: `gabc-score-determination.y` lines 871-875 from Gregorio compiler

**Error Code**: `invalid_pipe_without_nabc`

**Behavior**: Detects when the "|" character is used in GABC files without the `nabc-lines` header defined.

### 2. NABC Without Alternation Error

**Message**: `"NABC notation detected without proper alternation. Verify nabc-lines configuration and alternation pattern."`

**Error Code**: `nabc_in_gabc_only_mode`

**Behavior**: Detects NABC notation in contexts that should contain only GABC.

## Technical Implementation

### Message Constants

```typescript
export const GREGORIO_ERROR_MESSAGES = {
  PIPE_WITHOUT_NABC_LINES: 'You used character "|" in gabc without setting "nabc-lines" parameter. Please set it in your gabc header.',
  NABC_WITHOUT_ALTERNATION: 'NABC notation detected without proper alternation. Verify nabc-lines configuration and alternation pattern.',
  // ... other messages
} as const;
```

### Automatic Validation

The LSP automatically executes NABC alternation validation during parsing:

1. **Configuration Extraction**: Identifies the `nabc-lines` value in headers
2. **Group Analysis**: Processes note groups `(...)` individually  
3. **Snippet Validation**: Checks each snippet separated by "|" within groups
4. **Pattern Detection**: Uses refined regex patterns to distinguish GABC from NABC

### Refined NABC Patterns

The patterns were optimized to avoid false positives:

```typescript
const nabcPatterns = [
  /[a-z]{3,}[0-9]/,         // Long descriptors: peGlsa6tohl, toppt2lss2lsim2
  /[a-z]+pt[0-9]/,          // Point descriptors: toppt2
  /lss?[0-9]/,              // Line spacing: lss2, ls3
  /lsim[0-9]/,              // Line simulation: lsim2
  /\b(un|ta|vi)\b/,         // NABC modifiers as complete words
  /[0-9][a-z]/,             // Digit followed by letter: NABC pitch descriptors
  /g[a-z]{2,}/,             // Glyph descriptors with 3+ characters (avoids 'gf', 'ge')
];
```

## Usage Examples

### Valid File (with nabc-lines)

```gabc
name: Tollite portas;
nabc-lines: 2;
%%
(f3) Tol(ce/fgf|peGlsa6tohl|toppt2lss2lsim2)li(f|un|ta)te(f|un|ta)
```

**Result**: ✅ No errors - correct alternation detected

### Invalid File (pipe without nabc-lines)

```gabc
name: Test;
%%
(f3) Test(f|g|h) content.
```

**Result**: ❌ Official Gregorio error detected

## Compatibility

- **Gregorio Compiler**: Messages aligned with official Gregorio code
- **NABC Specification**: Complete support for snippet-based alternation
- **VS Code LSP**: Native integration with editor diagnostics

## Testing

All tests pass with official message validation:

```bash
npm test
# ✓ should parse GABC content correctly
# ✓ should extract NABC configuration  
# ✓ should validate with proper settings
# ✓ should detect invalid NABC alternation
```