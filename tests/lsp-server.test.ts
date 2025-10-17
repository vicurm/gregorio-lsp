import { GABCValidator } from '../src/validation/gabc-validator';
import { GABCParser } from '../src/parser/gabc-parser';
import { TextDocument } from 'vscode-languageserver-textdocument';

describe('GABC LSP Server', () => {
  let validator: GABCValidator;
  let parser: GABCParser;

  beforeEach(() => {
    parser = new GABCParser();
    validator = new GABCValidator(parser);
  });

  test('should parse GABC content correctly', () => {
    const gabcContent = `name: Test;
nabc-lines: 2;
%%
(c4) Ky(f)ri(g)e(h).
(1) Ka(2)ra(3)e(4).`;

    const parseResult = parser.parse(gabcContent);

    expect(parseResult).toBeDefined();
    expect(parseResult.success).toBe(true);
    if (parseResult.ast) {
      expect(parseResult.ast.headers).toBeDefined();
      expect(parseResult.ast.music).toBeDefined();
    }
  });

  test('should extract NABC configuration', () => {
    const gabcContent = `name: Test;
nabc-lines: 1 3 5;
%%
(c4) Content`;

    const parseResult = parser.parse(gabcContent);
    expect(parseResult.success).toBe(true);
    
    if (parseResult.ast) {
      const nabcConfig = parser.extractNABCConfiguration(parseResult.ast);

      expect(nabcConfig).toBeDefined();
      expect(nabcConfig.enabled).toBe(true);
      expect(nabcConfig.headerValue).toBe('1 3 5;');
    }
  });

  test('should validate with proper settings', async () => {
    const gabcContent = `name: Test;
nabc-lines: 2;
%%
(c4) Ky(f)ri(g)e(h).
(1) Ka(2)ra(3)e(4).`;

    const document = TextDocument.create('test://test.gabc', 'gabc', 1, gabcContent);
    const parseResult = parser.parse(gabcContent);
    
    expect(parseResult.success).toBe(true);
    
    if (parseResult.ast) {
      const settings = {
        maxNumberOfProblems: 100,
        enableSemanticValidation: true,
        enableNabcLinesValidation: true,
        strictAlternationChecking: true
      };

      const diagnostics = await validator.validate(parseResult.ast, document, settings);

      expect(Array.isArray(diagnostics)).toBe(true);
    }
  });

  test('should detect invalid NABC alternation', async () => {
    const gabcContent = `name: Test;
nabc-lines: 2;
%%
(c4) Ky(f)ri(g)e(h).
(c4) Ky(f)ri(g)e(h).`;  // Linha 2 deveria ser NABC

    const document = TextDocument.create('test://test.gabc', 'gabc', 1, gabcContent);
    const parseResult = parser.parse(gabcContent);
    
    expect(parseResult.success).toBe(true);
    
    if (parseResult.ast) {
      const settings = {
        maxNumberOfProblems: 100,
        enableSemanticValidation: true,
        enableNabcLinesValidation: true,
        strictAlternationChecking: true
      };

      const diagnostics = await validator.validate(parseResult.ast, document, settings);

      expect(diagnostics.length).toBeGreaterThan(0);
      
      // Verificar se há erro relacionado à alternação NABC
      const nabcError = diagnostics.find(d => d.message.includes('NABC') || d.message.includes('alternation'));
      expect(nabcError).toBeDefined();
    }
  });
});