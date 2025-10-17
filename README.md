# Gregorio LSP Server

Um servidor LSP (Language Server Protocol) completo para arquivos GABC (Gregorian chant notation) que implementa análise semântica avançada, incluindo suporte para alternação NABC-lines.

## Funcionalidades

### 🎵 Análise Semântica Completa
- **Parsing estrutural**: Análise sintática completa de arquivos GABC/NABC
- **Validação de headers**: Verificação de campos obrigatórios e valores válidos
- **Análise de notação musical**: Validação de neumas GABC e glífos NABC
- **Estrutura de sílabas**: Verificação de correspondência entre texto e música

### 🔄 Suporte para NABC-lines
- **Alternação dinâmica**: Suporte completo para alternação GABC/NABC baseada no header `nabc-lines`
- **Validação contextual**: Verificação de padrões de alternação corretos
- **Detecção automática**: Identificação automática de notação NABC vs GABC

### 💡 Funcionalidades de IDE
- **Autocompletar inteligente**: Sugestões contextuais para headers, neumas e texto
- **Hover informativo**: Informações detalhadas sobre elementos GABC/NABC
- **Diagnósticos em tempo real**: Detecção de erros sintáticos e semânticos
- **Análise de padrões melódicos**: Identificação de padrões ascendentes, descendentes e repetitivos

## Arquitetura

### Componentes Principais

#### GABCParser (`src/parser/gabc-parser.ts`)
- Parser principal com fallback para parsing regex-based
- Integração com tree-sitter-gregorio (quando disponível)
- Detecção automática de notação NABC
- Extração e validação de configuração NABC-lines

#### GABCValidator (`src/validation/gabc-validator.ts`)
- Validação semântica completa
- Verificação de headers obrigatórios e valores válidos
- Validação de alternação NABC-lines
- Análise de notação musical GABC/NABC

#### GABCAnalyzer (`src/analysis/gabc-analyzer.ts`)
- Análise semântica avançada
- Extração de estatísticas e padrões
- Análise contextual para autocompletar
- Validação de consistência de alternação

#### GABCCompletionProvider (`src/analysis/completion-provider.ts`)
- Autocompletar contextual para headers
- Sugestões de neumas GABC (a-m, ~, v, <, >, etc.)
- Sugestões de glífos NABC (1a-4m, n0-nf, ga-gz)
- Snippets para formatação de texto

#### GABCHoverProvider (`src/analysis/hover-provider.ts`)
- Informações detalhadas sobre headers
- Análise de conteúdo musical
- Documentação de modos gregorianos
- Explicação de padrões NABC

## Instalação e Uso

### Requisitos
- Node.js 16+
- TypeScript 4.9+
- VS Code (para uso como extensão)

### Compilação
```bash
npm install
npm run compile
```

### Execução
```bash
npm start
```

### Desenvolvimento
```bash
npm run watch    # Compilação em modo watch
npm run lint     # Verificação de código
npm run test     # Execução de testes (quando implementados)
```

## Configuração

### Configurações do LSP

O servidor aceita as seguintes configurações via `workspace/configuration`:

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

#### Parâmetros:
- `maxNumberOfProblems`: Número máximo de diagnósticos a serem reportados
- `enableSemanticValidation`: Habilita validação semântica completa
- `enableNabcLinesValidation`: Habilita validação de alternação NABC-lines
- `strictAlternationChecking`: Modo rigoroso para verificação de alternação (erro vs warning)

## Exemplos de Uso

### Arquivo GABC Básico
```gabc
name: Kyrie Eleison;
office-part: Ordinary;
mode: VI;
%%
Ky(f)ri(gh)e(h) e(h)le(gf)i(g)son.(f.)
```

### Arquivo com NABC-lines
```gabc
name: Kyrie com NABC;
office-part: Ordinary;
mode: VI;
nabc-lines: 1;
%%
Ky(f)ri(gh)e(h) *() e(h)le(gf)i(g)son.(f.) (::)
Chri(1h) n2g ste(2i) e(h)le(gf)i(g)son.(f.)
```

### Headers Suportados

#### Headers Obrigatórios/Recomendados:
- `name`: Nome da peça
- `office-part`: Parte litúrgica (Antiphon, Responsory, etc.)
- `mode`: Modo gregoriano (1-8, I-VIII)

#### Headers Especiais:
- `nabc-lines`: Controla alternação GABC/NABC (0 = desabilitado, 1 = habilitado)
- `initial-style`: Estilo da letra inicial (0 = normal, 1 = grande, 2 = duas linhas)
- `annotation`: Anotação exibida acima da partitura

## Limitações Conhecidas

1. **Tree-sitter Integration**: Atualmente usa fallback parsing. A integração completa com tree-sitter-gregorio está planejada para versões futuras.

2. **Document Management**: O sistema de gerenciamento de documentos é simplificado. Uma implementação completa integraria com o VS Code document manager.

3. **Performance**: Para arquivos muito grandes, o parsing pode ser lento. Otimizações de performance estão planejadas.

## Desenvolvimento Futuro

### Funcionalidades Planejadas:
- [ ] Integração completa com tree-sitter-gregorio
- [ ] Sistema de cache para melhor performance
- [ ] Suporte para múltiplos arquivos GABC
- [ ] Validação de referências cruzadas
- [ ] Análise harmônica avançada
- [ ] Exportação para diferentes formatos

### Melhorias de IDE:
- [ ] Code actions para correção automática
- [ ] Refatoração de código
- [ ] Navegação de símbolos
- [ ] Outline view para estrutura do documento
- [ ] Integração com preview visual

## Integração com Editores

### VS Code
O LSP pode ser integrado ao VS Code através de uma extensão que:
1. Registra o servidor LSP
2. Configura associação de arquivos `.gabc`
3. Fornece configurações personalizáveis

### Outros Editores
O protocolo LSP é suportado por:
- Vim/Neovim (via plugins LSP)
- Emacs (via lsp-mode)
- Sublime Text
- Atom
- E muitos outros

## Arquivos de Teste

O diretório `examples/` contém arquivos de teste para validar funcionalidades:
- `test.gabc`: Exemplo básico com NABC-lines
- Planejados: exemplos para cada funcionalidade específica

## Contribuição

Para contribuir com o projeto:
1. Fork o repositório
2. Crie uma branch para sua funcionalidade
3. Implemente mudanças com testes
4. Envie pull request

### Diretrizes de Desenvolvimento:
- Seguir convenções TypeScript
- Documentar APIs públicas
- Incluir testes para novas funcionalidades
- Manter compatibilidade com LSP specification

## Licença

Este projeto está licenciado sob a MIT License - veja o arquivo LICENSE para detalhes.

## Relacionados

Este projeto faz parte do ecossistema Gregorio:
- [gregorio.nvim](../gregorio.nvim/): Plugin Vim/Neovim para GABC
- [tree-sitter-gregorio](../tree-sitter-gregorio/): Grammar tree-sitter para GABC
- [vscode-gregorio](../vscode-gregorio/): Extensão VS Code para GABC
- [gregorio-mode](../gregorio-mode/): Modo Emacs para GABC