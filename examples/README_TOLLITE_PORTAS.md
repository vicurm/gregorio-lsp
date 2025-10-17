# Tollite Portas - NABC-lines Alternation Demonstration

## Correct Concept: Snippets vs Note Groups

**IMPORTANT**: Snippets are the parts separated by `|` **within** each note group (parentheses).

Example: `(f|un|ta)` is a note group containing 3 snippets: `f`, `un`, `ta`

## Snippet Analysis

The simplified musical excerpt:
```
(f3) Tol(ce/fgf|peGlsa6tohl|toppt2lss2lsim2)li(f|un|ta)te(f|un|ta)
```

**Snippets identified by group:**

**Group 1**: `(f3)`
- Snippet 1: `f3`

**Group 2**: `(ce/fgf|peGlsa6tohl|toppt2lss2lsim2)`
- Snippet 1: `ce/fgf`
- Snippet 2: `peGlsa6tohl` 
- Snippet 3: `toppt2lss2lsim2`

**Group 3**: `(f|un|ta)`
- Snippet 1: `f`
- Snippet 2: `un`
- Snippet 3: `ta`

**Group 4**: `(f|un|ta)` - repetition
- Snippet 1: `f`
- Snippet 2: `un`
- Snippet 3: `ta`

## Test Cases

Based on the file `tollite_portas.gabc` with different nabc-lines configurations:

### 1. Without nabc-lines header (nabc-lines: absent)
**Expected result**: All content treated as single GABC snippets, no alternation
**Expected errors**: 
- Pipe characters "|" detected without nabc-lines header
- NABC snippets (`peGlsa6tohl`, `toppt2lss2lsim2`, `un`, `ta`) contain invalid notation for GABC-only mode

### 2. Current file configuration (nabc-lines: 2)
**Expected pattern in each group**: GABC, NABC, NABC, GABC, GABC, NABC, NABC, ...

**Group 1**: `(f3)`
- Snippet 1 `f3`: GABC ✓ (index 0 in group - always GABC)

**Group 2**: `(ce/fgf|peGlsa6tohl|toppt2lss2lsim2)`
- Snippet 1 `ce/fgf`: GABC ✓ (index 0 in group - always GABC)
- Snippet 2 `peGlsa6tohl`: NABC ✓ (index 1 in group - should be NABC)
- Snippet 3 `toppt2lss2lsim2`: NABC ✓ (index 2 in group - should be NABC)

**Group 3**: `(f|un|ta)`
- Snippet 1 `f`: GABC ✓ (index 0 in group - always GABC)
- Snippet 2 `un`: NABC ✓ (index 1 in group - should be NABC)
- Snippet 3 `ta`: NABC ✓ (index 2 in group - should be NABC)

**Group 4**: `(f|un|ta)` - repetition
- Snippet 1 `f`: GABC ✓ (index 0 in group - always GABC)
- Snippet 2 `un`: NABC ✓ (index 1 in group - should be NABC)
- Snippet 3 `ta`: NABC ✓ (index 2 in group - should be NABC)

### 3. Alternative configuration test (nabc-lines: 1)  
**Expected pattern in each group**: GABC, NABC, GABC, NABC, GABC, NABC, GABC, ...

**Group 1**: `(f3)`
- Snippet 1 `f3`: GABC ✓ (index 0 in group - always GABC)

**Group 2**: `(ce/fgf|peGlsa6tohl|toppt2lss2lsim2)`
- Snippet 1 `ce/fgf`: GABC ✓ (index 0 in group - always GABC)
- Snippet 2 `peGlsa6tohl`: NABC ✓ (index 1 in group - should be NABC)
- Snippet 3 `toppt2lss2lsim2`: GABC ❌ (index 2 in group - should be GABC but is NABC)

**Group 3**: `(f|un|ta)`
- Snippet 1 `f`: GABC ✓ (index 0 in group - always GABC)
- Snippet 2 `un`: NABC ✓ (index 1 in group - should be NABC)
- Snippet 3 `ta`: GABC ❌ (index 2 in group - should be GABC but is NABC)

## NABC Snippet Identification

NABC snippets are identified by the presence of:
- Numeric characters: `1`, `2`, `3`, etc.
- NABC descriptors: `peGlsa6tohl`, `toppt2lss2lsim2`, `qlppn1`, etc.
- Pipe separators with modifiers: `un|ta`, `vi>1lsm2`, etc.
- NABC-specific symbols: backticks, underscores, etc.

## Expected Errors Summary

Based on validation scenarios:

**nabc-lines: absent** - All pipe characters and NABC patterns are errors
**nabc-lines: 1** - Incorrect alternation in groups 2 and 4 (snippet 3 should be GABC but is NABC)
**nabc-lines: 2** - All alternations are correct, no errors expected

## LSP Validation

The LSP should detect:
1. **Incorrect alternation**: Snippets that should be GABC but are NABC and vice versa
2. **Invalid syntax**: NABC characters in GABC-only context
3. **Invalid configuration**: Invalid values for nabc-lines