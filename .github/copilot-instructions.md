# Gregorio LSP Project Instructions

This is a Language Server Protocol implementation for Gregorio GABC/NABC notation that provides semantic analysis capabilities beyond what syntax-based parsers can offer.

## Project Overview

- **Type**: Node.js TypeScript LSP Server
- **Target**: GABC/NABC notation files (.gabc)
- **Purpose**: Semantic validation, analysis, and IDE features
- **Architecture**: LSP Server + Tree-sitter integration

## Key Features

- ✅ Semantic validation of nabc-lines header alternation patterns
- ✅ Cross-reference validation between headers and notation
- ✅ Real-time diagnostics and error reporting  
- ✅ Auto-completion for GABC/NABC elements
- ✅ Hover information and documentation
- ✅ Integration with tree-sitter-gregorio parser

## Development Status

- [x] Project structure created
- [x] TypeScript configuration setup
- [x] LSP dependencies installed
- [x] Core semantic analysis implementation
- [x] Tree-sitter integration
- [x] Testing framework setup
- [x] VS Code extension configuration