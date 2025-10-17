# Gregorio LSP Server

A complete Language Server Protocol implementation for GABC (Gregorian chant notation) files that provides advanced semantic analysis, including support for nabc-lines alternation.

## Features

### 🎵 Complete Semantic Analysis
- **Structural parsing**: Complete syntactic analysis of GABC/NABC files
- **Header validation**: Verification of required fields and valid values
- **Musical notation analysis**: Validation of GABC neumes and NABC glyphs
- **Syllable structure**: Verification of text-music correspondence

### 🔄 NABC-lines Support
- **Dynamic alternation**: Complete support for GABC/NABC alternation based on `nabc-lines` header
- **Contextual validation**: Verification of correct alternation patterns
- **Automatic detection**: Automatic identification of NABC vs GABC notation

### 💡 IDE Features
- **Intelligent auto-completion**: Contextual suggestions for headers, neumes, and text
- **Informative hover**: Detailed information about GABC/NABC elements
- **Real-time diagnostics**: Detection of syntactic and semantic errors
- **Melodic pattern analysis**: Identification of ascending, descending, and repetitive patterns
- **Quilisma validation**: Automatic suggestions for glyph breaks and ascending motion verification

## Architecture

### Main Components

#### GABCParser (`src/parser/gabc-parser.ts`)
- Main parser with fallback to regex-based parsing
- Integration with tree-sitter-gregorio (when available)
- Automatic NABC notation detection
- NABC-lines configuration extraction and validation

#### GABCValidator (`src/validation/gabc-validator.ts`)
- Complete semantic validation
- Required headers and valid values verification
- NABC-lines alternation validation
- GABC/NABC musical notation analysis

#### GABCAnalyzer (`src/analysis/gabc-analyzer.ts`)
- Advanced semantic analysis
- Statistics and pattern extraction
- Contextual analysis for auto-completion
- Alternation consistency validation

#### GABCCompletionProvider (`src/analysis/completion-provider.ts`)
- Contextual auto-completion for headers
- GABC neume suggestions (a-m, ~, v, <, >, etc.)
- NABC glyph suggestions (1a-4m, n0-nf, ga-gz)
- Text formatting snippets

#### GABCHoverProvider (`src/analysis/hover-provider.ts`)
- Detailed header information
- Musical content analysis
- Gregorian mode documentation
- NABC pattern explanations

## Installation and Usage

### Requirements
- Node.js 16+
- TypeScript 4.9+
- VS Code (for use as extension)

### Build
```bash
npm install
npm run compile
```

### Run
```bash
npm start
```

### Development
```bash
npm run watch    # Watch mode compilation
npm run lint     # Code linting
npm run test     # Run tests
```

## Configuration

### LSP Settings

The server accepts the following settings via `workspace/configuration`:

```json
{
  "gregorioLsp": {
    "maxNumberOfProblems": 1000,
    "enableSemanticValidation": true,
    "enableNabcLinesValidation": true,
    "strictAlternationChecking": true
  }
}
```

#### Parameters:
- `maxNumberOfProblems`: Maximum number of diagnostics to be reported
- `enableSemanticValidation`: Enable complete semantic validation
- `enableNabcLinesValidation`: Enable NABC-lines alternation validation
- `strictAlternationChecking`: Strict mode for alternation checking (error vs warning)

## Usage Examples

### Basic GABC File
```gabc
name: Kyrie Eleison;
office-part: Ordinary;
mode: VI;
%%
Ky(f)ri(gh)e(h) e(h)le(gf)i(g)son.(f.)
```

### File with NABC-lines
```gabc
name: Kyrie with NABC;
office-part: Ordinary;
mode: VI;
nabc-lines: 1;
%%
Ky(f)ri(gh)e(h) *() e(h)le(gf)i(g)son.(f.) (::)
Chri(1h) n2g ste(2i) e(h)le(gf)i(g)son.(f.)
```

### Quilisma Validation

The LSP provides automatic validation for quilisma (w/W) usage:

```gabc
name: Quilisma Examples;
%%
% Good: quilisma ascending with glyph break
Good(g!wh)example(f!wi). (::)

% Information: suggests glyph break for better rendering
Need(gwh)glyph(fwi)break. (::)

% Warning: quilisma should ascend to higher note
Bad(gwf)quilisma(fwe). (::)
```

**Diagnostic Codes:**
- `quilisma-glyph-break` (Information): Suggests adding `!` before quilisma note
  - Example: `gwh` → suggestion to use `g!wh`
- `quilisma-ascending-motion` (Warning): Quilisma must be followed by higher pitch
  - Example: `gwf` warns because f ≤ g (descending/level)
- `quilisma-no-following-note` (Warning): Quilisma at end without following note
  - Example: isolated `gw` generates warning

### Supported Headers

#### Required/Recommended Headers:
- `name`: Piece name
- `office-part`: Liturgical part (Antiphon, Responsory, etc.)
- `mode`: Gregorian mode (1-8, I-VIII)

#### Special Headers:
- `nabc-lines`: Controls GABC/NABC alternation (0 = disabled, 1 = enabled)
- `initial-style`: Initial letter style (0 = normal, 1 = large, 2 = two-line)
- `annotation`: Annotation displayed above the score

## Known Limitations

1. **Tree-sitter Integration**: Currently uses fallback parsing. Complete integration with tree-sitter-gregorio is planned for future versions.

2. **Document Management**: The document management system is simplified. A complete implementation would integrate with VS Code document manager.

3. **Performance**: For very large files, parsing can be slow. Performance optimizations are planned.

## Future Development

### Planned Features:
- [ ] Complete integration with tree-sitter-gregorio
- [ ] Cache system for better performance
- [ ] Support for multiple GABC files
- [ ] Cross-reference validation
- [ ] Advanced harmonic analysis
- [ ] Export to different formats

### IDE Improvements:
- [ ] Code actions for automatic correction
- [ ] Code refactoring
- [ ] Symbol navigation
- [ ] Outline view for document structure
- [ ] Visual preview integration

## Editor Integration

### VS Code
The LSP can be integrated with VS Code through an extension that:
1. Registers the LSP server
2. Configures `.gabc` file association
3. Provides customizable settings

### Other Editors
The LSP protocol is supported by:
- Vim/Neovim (via LSP plugins)
- Emacs (via lsp-mode)
- Sublime Text
- Atom
- And many others

## Test Files

The `examples/` directory contains test files to validate functionality:
- `test.gabc`: Basic example with NABC-lines
- Planned: examples for each specific functionality

## Contributing

To contribute to the project:
1. Fork the repository
2. Create a branch for your feature
3. Implement changes with tests
4. Submit pull request

### Development Guidelines:
- Follow TypeScript conventions
- Document public APIs
- Include tests for new features
- Maintain compatibility with LSP specification

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Related Projects

This project is part of the Gregorio ecosystem:
- [gregorio.nvim](../gregorio.nvim/): Vim/Neovim plugin for GABC
- [tree-sitter-gregorio](../tree-sitter-gregorio/): Tree-sitter grammar for GABC
- [vscode-gregorio](../vscode-gregorio/): VS Code extension for GABC
- [gregorio-mode](../gregorio-mode/): Emacs mode for GABC