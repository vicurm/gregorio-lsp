#!/usr/bin/env node
/**
 * Cliente de teste simples para o Gregorio LSP Server
 * Testa funcionalidades básicas como parsing e validação
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class LSPTestClient {
  constructor() {
    this.server = null;
    this.messageId = 0;
    this.responses = new Map();
  }

  async startServer() {
    const serverPath = path.join(__dirname, 'out', 'server.js');
    
    console.log('🚀 Iniciando servidor LSP...');
    this.server = spawn('node', [serverPath, '--stdio'], {
      stdio: ['pipe', 'pipe', 'inherit']
    });

    this.server.stdout.on('data', (data) => {
      try {
        const messages = data.toString().split('\n').filter(line => line.trim());
        messages.forEach(msg => this.handleServerMessage(msg));
      } catch (error) {
        console.error('Erro ao processar resposta do servidor:', error);
      }
    });

    this.server.on('error', (error) => {
      console.error('❌ Erro no servidor:', error);
    });

    // Inicializar conexão LSP
    await this.sendRequest('initialize', {
      processId: process.pid,
      rootUri: `file://${__dirname}`,
      capabilities: {
        textDocument: {
          publishDiagnostics: {}
        }
      }
    });

    await this.sendNotification('initialized', {});
    console.log('✅ Servidor LSP inicializado');
  }

  handleServerMessage(message) {
    if (!message.trim()) return;
    
    try {
      // Remover cabeçalho Content-Length se presente
      const jsonStart = message.indexOf('{');
      if (jsonStart === -1) return;
      
      const jsonMsg = message.substring(jsonStart);
      const parsed = JSON.parse(jsonMsg);
      
      if (parsed.id && this.responses.has(parsed.id)) {
        const { resolve } = this.responses.get(parsed.id);
        this.responses.delete(parsed.id);
        resolve(parsed);
      } else if (parsed.method === 'textDocument/publishDiagnostics') {
        this.handleDiagnostics(parsed.params);
      }
    } catch (error) {
      // Ignorar mensagens mal formadas (normais durante handshake LSP)
    }
  }

  handleDiagnostics(params) {
    console.log(`\n📋 Diagnósticos para ${params.uri}:`);
    if (params.diagnostics.length === 0) {
      console.log('   ✅ Nenhum erro encontrado');
    } else {
      params.diagnostics.forEach((diag, i) => {
        const severity = ['', 'ERROR', 'WARNING', 'INFO', 'HINT'][diag.severity] || 'UNKNOWN';
        console.log(`   ${i + 1}. [${severity}] Linha ${diag.range.start.line + 1}: ${diag.message}`);
      });
    }
  }

  async sendRequest(method, params) {
    return new Promise((resolve, reject) => {
      const id = ++this.messageId;
      const message = {
        jsonrpc: '2.0',
        id,
        method,
        params
      };

      this.responses.set(id, { resolve, reject });
      
      const content = JSON.stringify(message);
      const header = `Content-Length: ${Buffer.byteLength(content)}\r\n\r\n`;
      
      this.server.stdin.write(header + content);
      
      // Timeout de 5 segundos
      setTimeout(() => {
        if (this.responses.has(id)) {
          this.responses.delete(id);
          reject(new Error('Timeout na requisição'));
        }
      }, 5000);
    });
  }

  async sendNotification(method, params) {
    const message = {
      jsonrpc: '2.0',
      method,
      params
    };

    const content = JSON.stringify(message);
    const header = `Content-Length: ${Buffer.byteLength(content)}\r\n\r\n`;
    
    this.server.stdin.write(header + content);
  }

  async testFile(filePath) {
    const uri = `file://${path.resolve(filePath)}`;
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n🔍 Testando arquivo: ${path.basename(filePath)}`);
    
    // Abrir documento
    await this.sendNotification('textDocument/didOpen', {
      textDocument: {
        uri,
        languageId: 'gabc',
        version: 1,
        text: content
      }
    });

    // Esperar um pouco para o servidor processar
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Fechar documento
    await this.sendNotification('textDocument/didClose', {
      textDocument: { uri }
    });
  }

  async shutdown() {
    console.log('\n🔄 Encerrando servidor...');
    if (this.server) {
      await this.sendRequest('shutdown', null);
      await this.sendNotification('exit', null);
      this.server.kill();
    }
    console.log('✅ Teste concluído');
  }
}

async function runTests() {
  const client = new LSPTestClient();
  
  try {
    await client.startServer();
    
    // Testar arquivos de exemplo
    const exampleFiles = [
      './examples/test.gabc',
      './examples/kyrie_alternation_valid.gabc',
      './examples/kyrie_alternation_errors.gabc'
    ].filter(file => fs.existsSync(file));

    for (const file of exampleFiles) {
      await client.testFile(file);
    }
    
  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  } finally {
    await client.shutdown();
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { LSPTestClient };