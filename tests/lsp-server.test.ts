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
nabc-lines: 2;
%%
(c4) Content`;

    const parseResult = parser.parse(gabcContent);
    expect(parseResult.success).toBe(true);
    
    if (parseResult.ast) {
      const nabcConfig = parser.extractNABCConfiguration(parseResult.ast);

      expect(nabcConfig).toBeDefined();
      expect(nabcConfig.enabled).toBe(true);
      expect(nabcConfig.headerValue).toBe('2;');
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
    // Test case: pipe without nabc-lines should trigger official Gregorio error
    const gabcContent = `name: Test;
%%
(f3) Test(f|g|h) content.`;  // Pipe without nabc-lines header

    const document = TextDocument.create('test://test.gabc', 'gabc', 1, gabcContent);
    const parseResult = parser.parse(gabcContent);
    
    expect(parseResult.success).toBe(false);
    expect(parseResult.errors.length).toBeGreaterThan(0);
    
    // Check for official Gregorio error message
    const pipeError = parseResult.errors.find(e => 
      e.message.includes('You used character "|" in gabc without setting "nabc-lines" parameter')
    );
    expect(pipeError).toBeDefined();
  });
});