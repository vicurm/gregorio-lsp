import { TextDocumentPositionParams, CompletionItem, CompletionItemKind } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { GABCParser } from '../parser/gabc-parser';
import { GABCAnalyzer } from './gabc-analyzer';
import { CompletionContext } from '../types';

export class GABCCompletionProvider {
  constructor(
    private parser: GABCParser,
    private analyzer: GABCAnalyzer
  ) {}

  public async provideCompletions(params: TextDocumentPositionParams): Promise<CompletionItem[]> {
    // In a real implementation, we would get the document from the document manager
    // For now, we'll create a placeholder
    const document = TextDocument.create(
      params.textDocument.uri,
      'gabc',
      1,
      '' // In real implementation, get actual content
    );

    const completions: CompletionItem[] = [];

    try {
      const parseResult = this.parser.parse(document.getText());
      
      if (!parseResult.success || !parseResult.ast) {
        return this.getBasicCompletions();
      }

      const context = this.analyzer.getContextAt(
        parseResult.ast,
        params.position.line,
        params.position.character
      );

      if (context.inHeader) {
        completions.push(...this.getHeaderCompletions());
      } else if (context.inMusic) {
        if (context.nabcMode) {
          completions.push(...this.getNABCCompletions());
        } else {
          completions.push(...this.getGABCCompletions());
        }
      } else if (context.inText) {
        completions.push(...this.getTextCompletions());
      } else {
        completions.push(...this.getBasicCompletions());
      }

    } catch (error) {
      // Fallback to basic completions
      return this.getBasicCompletions();
    }

    return completions;
  }

  public resolveCompletion(item: CompletionItem): CompletionItem {
    // Add detailed documentation based on completion type
    if (item.data) {
      switch (item.data.type) {
        case 'header':
          item.documentation = this.getHeaderDocumentation(item.label);
          break;
        case 'gabc-neume':
          item.documentation = this.getGABCNeumeDocumentation(item.label);
          break;
        case 'nabc-glyph':
          item.documentation = this.getNABCGlyphDocumentation(item.label);
          break;
      }
    }
    
    return item;
  }

  private getBasicCompletions(): CompletionItem[] {
    return [
      ...this.getHeaderCompletions(),
      ...this.getGABCCompletions(),
      {
        label: '%%',
        kind: CompletionItemKind.Keyword,
        detail: 'Header separator',
        documentation: 'Separates header section from music notation'
      }
    ];
  }

  private getHeaderCompletions(): CompletionItem[] {
    return [
      {
        label: 'name',
        kind: CompletionItemKind.Property,
        detail: 'Chant name',
        insertText: 'name: ',
        data: { type: 'header' }
      },
      {
        label: 'office-part',
        kind: CompletionItemKind.Property,
        detail: 'Liturgical office part',
        insertText: 'office-part: ',
        data: { type: 'header' }
      },
      {
        label: 'mode',
        kind: CompletionItemKind.Property,
        detail: 'Gregorian mode',
        insertText: 'mode: ',
        data: { type: 'header' }
      },
      {
        label: 'nabc-lines',
        kind: CompletionItemKind.Property,
        detail: 'NABC alternation pattern',
        insertText: 'nabc-lines: 1',
        data: { type: 'header' }
      },
      {
        label: 'initial-style',
        kind: CompletionItemKind.Property,
        detail: 'Initial letter style',
        insertText: 'initial-style: ',
        data: { type: 'header' }
      },
      {
        label: 'annotation',
        kind: CompletionItemKind.Property,
        detail: 'Score annotation',
        insertText: 'annotation: ',
        data: { type: 'header' }
      }
    ];
  }

  private getGABCCompletions(): CompletionItem[] {
    const pitchCompletions = 'abcdefghijklm'.split('').map(pitch => ({
      label: pitch,
      kind: CompletionItemKind.Value,
      detail: `Pitch ${pitch.toUpperCase()}`,
      data: { type: 'gabc-neume' }
    }));

    const neumeShapes = [
      { label: '~', detail: 'Quilisma' },
      { label: 'v', detail: 'Virga' },
      { label: '<', detail: 'Oriscus ascendens' },
      { label: '>', detail: 'Oriscus descendens' },
      { label: 'o', detail: 'Punctum cavum' },
      { label: 'O', detail: 'Punctum cavum majus' },
      { label: '\\', detail: 'Stropha' },
      { label: '/', detail: 'Stropha aucta' }
    ].map(shape => ({
      label: shape.label,
      kind: CompletionItemKind.Operator,
      detail: shape.detail,
      data: { type: 'gabc-neume' }
    }));

    return [...pitchCompletions, ...neumeShapes];
  }

  private getNABCCompletions(): CompletionItem[] {
    const pitchDescriptors = [];
    for (let clef = 1; clef <= 4; clef++) {
      for (let pitch of 'abcdefghijklm') {
        pitchDescriptors.push({
          label: `${clef}${pitch}`,
          kind: CompletionItemKind.Value,
          detail: `NABC pitch: clef ${clef}, pitch ${pitch}`,
          data: { type: 'nabc-glyph' }
        });
      }
    }

    const neumeDescriptors = [];
    for (let i = 0; i <= 15; i++) {
      neumeDescriptors.push({
        label: `n${i.toString(16)}`,
        kind: CompletionItemKind.Function,
        detail: `NABC neume descriptor ${i.toString(16)}`,
        data: { type: 'nabc-glyph' }
      });
    }

    const glyphDescriptors = 'abcdefghijklmnopqrstuvwxyz'.split('').map(glyph => ({
      label: `g${glyph}`,
      kind: CompletionItemKind.Class,
      detail: `NABC glyph descriptor ${glyph}`,
      data: { type: 'nabc-glyph' }
    }));

    return [...pitchDescriptors, ...neumeDescriptors, ...glyphDescriptors];
  }

  private getTextCompletions(): CompletionItem[] {
    return [
      {
        label: '<i>text</i>',
        kind: CompletionItemKind.Snippet,
        detail: 'Italic text',
        insertText: '<i>${1:text}</i>',
        documentation: 'Italic formatting for text'
      },
      {
        label: '<b>text</b>',
        kind: CompletionItemKind.Snippet,
        detail: 'Bold text',
        insertText: '<b>${1:text}</b>',
        documentation: 'Bold formatting for text'
      },
      {
        label: '<sc>text</sc>',
        kind: CompletionItemKind.Snippet,
        detail: 'Small caps text',
        insertText: '<sc>${1:text}</sc>',
        documentation: 'Small capitals formatting'
      }
    ];
  }

  private getHeaderDocumentation(label: string): string {
    const docs: Record<string, string> = {
      'name': 'The name of the chant or piece. This is typically displayed as the title.',
      'office-part': 'The part of the liturgical office (e.g., Antiphon, Responsory, Hymn).',
      'mode': 'The Gregorian mode of the chant (1-8 or I-VIII).',
      'nabc-lines': 'Controls NABC snippet alternation pattern. 0 = GABC only, N > 0 = alternating period N.',
      'initial-style': 'Style of the initial letter. 0 = normal, 1 = large, 2 = two-line.',
      'annotation': 'Annotation text displayed above the staff.'
    };

    return docs[label] || `Documentation for header: ${label}`;
  }

  private getGABCNeumeDocumentation(label: string): string {
    if (label.match(/[a-m]/)) {
      const pitch = label.toUpperCase();
      return `GABC pitch notation: ${pitch}. Represents a note on the staff.`;
    }

    const neumeShapes: Record<string, string> = {
      '~': 'Quilisma: An ornamental note with a wavy appearance.',
      'v': 'Virga: A vertical stroke representing a higher pitch accent.',
      '<': 'Oriscus ascendens: A special neume indicating ascending movement.',
      '>': 'Oriscus descendens: A special neume indicating descending movement.',
      'o': 'Punctum cavum: A hollow note head.',
      'O': 'Punctum cavum majus: A larger hollow note head.',
      '\\': 'Stropha: A curved note indicating a special articulation.',
      '/': 'Stropha aucta: An augmented stropha.'
    };

    return neumeShapes[label] || `GABC neume shape: ${label}`;
  }

  private getNABCGlyphDocumentation(label: string): string {
    if (label.match(/^[1-4][a-m]$/)) {
      const clef = label[0];
      const pitch = label[1].toUpperCase();
      return `NABC pitch descriptor: Clef ${clef}, pitch ${pitch}. Specifies both clef and pitch position.`;
    }

    if (label.match(/^n[0-9a-f]$/)) {
      const descriptor = label.substring(1);
      return `NABC neume descriptor: ${descriptor}. Defines the shape and style of the neume.`;
    }

    if (label.match(/^g[a-z]$/)) {
      const glyph = label.substring(1);
      return `NABC glyph descriptor: ${glyph}. Specifies a particular glyph shape.`;
    }

    return `NABC notation: ${label}`;
  }
}