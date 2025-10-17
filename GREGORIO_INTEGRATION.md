# Gregorio Compiler Integration

Este documento descreve como o LSP gregorio-lsp integra as mensagens oficiais de erro do compilador Gregorio.

## Mensagens Oficiais Implementadas

### 1. Erro de Pipe sem nabc-lines

**Mensagem Oficial**: `"You used character "|" in gabc without setting "nabc-lines" parameter. Please set it in your gabc header."`

**Fonte**: `gabc-score-determination.y` linhas 871-875 do compilador Gregorio

**Código do Erro**: `invalid_pipe_without_nabc`

**Comportamento**: Detecta quando o caractere "|" é usado em arquivos GABC sem o cabeçalho `nabc-lines` definido.

### 2. Erro de NABC sem Alternação

**Mensagem**: `"NABC notation detected without proper alternation. Verify nabc-lines configuration and alternation pattern."`

**Código do Erro**: `nabc_in_gabc_only_mode`

**Comportamento**: Detecta notação NABC em contextos que deveriam conter apenas GABC.

## Implementação Técnica

### Constantes de Mensagem

```typescript
export const GREGORIO_ERROR_MESSAGES = {
  PIPE_WITHOUT_NABC_LINES: 'You used character "|" in gabc without setting "nabc-lines" parameter. Please set it in your gabc header.',
  NABC_WITHOUT_ALTERNATION: 'NABC notation detected without proper alternation. Verify nabc-lines configuration and alternation pattern.',
  // ... outras mensagens
} as const;
```

### Validação Automática

O LSP executa automaticamente a validação de alternação NABC durante o parsing:

1. **Extração de Configuração**: Identifica o valor de `nabc-lines` nos cabeçalhos
2. **Análise de Grupos**: Processa grupos de notas `(...)` individualmente  
3. **Validação de Snippets**: Verifica cada snippet separado por "|" dentro dos grupos
4. **Detecção de Padrões**: Usa padrões regex refinados para distinguir GABC de NABC

### Padrões NABC Refinados

Os padrões foram otimizados para evitar falsos positivos:

```typescript
const nabcPatterns = [
  /[a-z]{3,}[0-9]/,         // Descriptores longos: peGlsa6tohl, toppt2lss2lsim2
  /[a-z]+pt[0-9]/,          // Descriptores de ponto: toppt2
  /lss?[0-9]/,              // Espaçamento de linha: lss2, ls3
  /lsim[0-9]/,              // Simulação de linha: lsim2
  /\b(un|ta|vi)\b/,         // Modificadores NABC como palavras completas
  /[0-9][a-z]/,             // Dígito seguido de letra: descriptores de pitch NABC
  /g[a-z]{2,}/,             // Descriptores de glifo com 3+ caracteres (evita 'gf', 'ge')
];
```

## Exemplos de Uso

### Arquivo Válido (com nabc-lines)

```gabc
name: Tollite portas;
nabc-lines: 2;
%%
(f3) Tol(ce/fgf|peGlsa6tohl|toppt2lss2lsim2)li(f|un|ta)te(f|un|ta)
```

**Resultado**: ✅ Nenhum erro - alternação correta detectada

### Arquivo Inválido (pipe sem nabc-lines)

```gabc
name: Test;
%%
(f3) Test(f|g|h) content.
```

**Resultado**: ❌ Erro oficial do Gregorio detectado

## Compatibilidade

- **Gregorio Compiler**: Mensagens alinhadas com o código oficial do Gregorio
- **Especificação NABC**: Suporte completo à alternação snippet-based
- **VS Code LSP**: Integração nativa com diagnósticos do editor

## Testes

Todos os testes passam com validação das mensagens oficiais:

```bash
npm test
# ✓ should parse GABC content correctly
# ✓ should extract NABC configuration  
# ✓ should validate with proper settings
# ✓ should detect invalid NABC alternation
```