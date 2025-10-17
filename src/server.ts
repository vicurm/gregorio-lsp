import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  InitializeResult,
  DocumentDiagnosticReportKind,
  type DocumentDiagnosticReport,
  Hover,
  HoverParams,
  WorkspaceFoldersChangeEvent,
  DidChangeConfigurationParams,
  TextDocumentChangeEvent,
  DidCloseTextDocumentParams
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { GABCParser } from './parser/gabc-parser';
import { GABCValidator } from './validation/gabc-validator';
import { GABCAnalyzer } from './analysis/gabc-analyzer';
import { GABCCompletionProvider } from './analysis/completion-provider';
import { GABCHoverProvider } from './analysis/hover-provider';

// Create a connection for the server
const connection = createConnection(ProposedFeatures.all);

// Create a text document manager
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

// Initialize core components
const parser = new GABCParser();
const validator = new GABCValidator(parser);
const analyzer = new GABCAnalyzer(parser);
const completionProvider = new GABCCompletionProvider(parser, analyzer);
const hoverProvider = new GABCHoverProvider(parser, analyzer);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

connection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities;

  // Does the client support the `workspace/configuration` request?
  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  );
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );
  hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  );

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      // Tell the client that this server supports code completion.
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: ['(', '|', '[', '<', 'n', 'g', 'e'],
      },
      // Support hover information
      hoverProvider: true,
      // Support diagnostics
      diagnosticProvider: {
        interFileDependencies: false,
        workspaceDiagnostics: false,
      },
    },
  };
  
  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true,
      },
    };
  }
  
  return result;
});

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    // Register for all configuration changes.
    connection.client.register(DidChangeConfigurationNotification.type, undefined);
  }
  
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders((_event: WorkspaceFoldersChangeEvent) => {
      connection.console.log('Workspace folder change event received.');
    });
  }
});

// The example settings
interface ExampleSettings {
  maxNumberOfProblems: number;
  enableSemanticValidation: boolean;
  enableNabcLinesValidation: boolean;
  strictAlternationChecking: boolean;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
const defaultSettings: ExampleSettings = { 
  maxNumberOfProblems: 1000, 
  enableSemanticValidation: true,
  enableNabcLinesValidation: true,
  strictAlternationChecking: true,
};
let globalSettings: ExampleSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings: Map<string, Promise<ExampleSettings>> = new Map();

connection.onDidChangeConfiguration((change: DidChangeConfigurationParams) => {
  if (hasConfigurationCapability) {
    // Reset all cached document settings
    documentSettings.clear();
  } else {
    globalSettings = <ExampleSettings>(
      (change.settings.gregorioLsp || defaultSettings)
    );
  }
  
  // Revalidate all open text documents
  documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Promise<ExampleSettings> {
  if (!hasConfigurationCapability) {
    return Promise.resolve(globalSettings);
  }
  
  let result = documentSettings.get(resource);
  if (!result) {
    result = connection.workspace.getConfiguration({
      scopeUri: resource,
      section: 'gregorioLsp'
    });
    documentSettings.set(resource, result);
  }
  
  return result;
}

// Only keep settings for open documents
documents.onDidClose((e) => {
  documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent((change: TextDocumentChangeEvent<TextDocument>) => {
  validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  // Get the settings for this document
  const settings = await getDocumentSettings(textDocument.uri);
  
  try {
    // Parse the document
    const parseResult = parser.parse(textDocument.getText());
    
    if (!parseResult.success) {
      // Send parse errors as diagnostics
      connection.sendDiagnostics({
        uri: textDocument.uri,
        diagnostics: parseResult.errors.map((error: any) => ({
          severity: 1, // Error
          range: error.range,
          message: error.message,
          source: 'gregorio-lsp'
        }))
      });
      return;
    }
    
    // Perform semantic validation
    const diagnostics = await validator.validate(
      parseResult.ast!,
      textDocument,
      settings
    );
    
    // Send the computed diagnostics to VS Code.
    connection.sendDiagnostics({ 
      uri: textDocument.uri, 
      diagnostics: diagnostics.slice(0, settings.maxNumberOfProblems)
    });
    
  } catch (error) {
    connection.console.error(`Error validating document: ${error}`);
  }
}

connection.onCompletion(
  async (_textDocumentPosition: TextDocumentPositionParams): Promise<CompletionItem[]> => {
    try {
      return await completionProvider.provideCompletions(_textDocumentPosition);
    } catch (error) {
      connection.console.error(`Error providing completions: ${error}`);
      return [];
    }
  }
);

connection.onCompletionResolve(
  (item: CompletionItem): CompletionItem => {
    return completionProvider.resolveCompletion(item);
  }
);

connection.onHover(
  async (params: HoverParams): Promise<Hover | null> => {
    try {
      return await hoverProvider.provideHover(params);
    } catch (error) {
      connection.console.error(`Error providing hover: ${error}`);
      return null;
    }
  }
);

connection.languages.diagnostics.on(async (params) => {
  const document = documents.get(params.textDocument.uri);
  if (document !== undefined) {
    return <DocumentDiagnosticReport>{
      kind: DocumentDiagnosticReportKind.Full,
      items: await validateAndGetDiagnostics(document)
    };
  } else {
    return <DocumentDiagnosticReport>{
      kind: DocumentDiagnosticReportKind.Full,
      items: []
    };
  }
});

async function validateAndGetDiagnostics(textDocument: TextDocument) {
  const settings = await getDocumentSettings(textDocument.uri);
  
  try {
    const parseResult = parser.parse(textDocument.getText());
    
    if (!parseResult.success) {
      return parseResult.errors.map((error: any) => ({
        severity: 1, // Error
        range: error.range,
        message: error.message,
        source: 'gregorio-lsp'
      }));
    }
    
    return await validator.validate(parseResult.ast!, textDocument, settings);
    
  } catch (error) {
    connection.console.error(`Error in diagnostics: ${error}`);
    return [];
  }
}

// Make the text document manager listen on the connection
documents.listen(connection);

// Listen on the connection
connection.listen();

connection.onExit(() => {
  // Gracefully shutdown the server
});