#!/usr/bin/env node

const { GABCParser } = require('../out/parser/gabc-parser');
const { GABCValidator } = require('../out/validation/gabc-validator');
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Quilisma Glyph Break Suggestion\n');

// Read test file
const testFile = path.join(__dirname, '..', 'test_quilisma_suggestion.gabc');
const content = fs.readFileSync(testFile, 'utf-8');

console.log('Test GABC content:');
console.log('─'.repeat(60));
console.log(content);
console.log('─'.repeat(60));
console.log();

// Parse and validate
const parser = new GABCParser();
const validator = new GABCValidator(parser);

const ast = parser.parse(content);

if (!ast.success) {
    console.error('❌ Parse failed:', ast.errors);
    process.exit(1);
}

console.log('✅ Parse successful\n');

// Create mock document and settings
const mockDocument = {
    uri: 'file:///test.gabc',
    getText: () => content
};

const mockSettings = {
    maxNumberOfProblems: 100,
    enableSemanticValidation: true,
    enableNabcLinesValidation: false,
    strictAlternationChecking: false,
    nabc: {
        enabled: true,
        strictChecking: false,
        fontFamily: 'gregall'
    }
};

// Validate
validator.validate(ast.ast, mockDocument, mockSettings).then(diagnostics => {
    console.log(`Found ${diagnostics.length} diagnostic(s):\n`);

    // Filter quilisma suggestions
    const quilismaSuggestions = diagnostics.filter(d => d.code === 'quilisma-glyph-break');
    
    console.log(`📊 Quilisma Suggestions: ${quilismaSuggestions.length}\n`);

    quilismaSuggestions.forEach((diag, index) => {
        console.log(`${index + 1}. ${diag.message}`);
        console.log(`   Severity: ${getSeverityName(diag.severity)}`);
        console.log(`   Range: Line ${diag.range.start.line + 1}, Col ${diag.range.start.character}-${diag.range.end.character}`);
        console.log();
    });

    // Show all diagnostics
    if (diagnostics.length > quilismaSuggestions.length) {
        console.log('📋 Other Diagnostics:\n');
        const others = diagnostics.filter(d => d.code !== 'quilisma-glyph-break');
        others.forEach((diag, index) => {
            console.log(`${index + 1}. ${diag.message}`);
            console.log(`   Severity: ${getSeverityName(diag.severity)}`);
            console.log();
        });
    }

    // Verify test expectations
    console.log('─'.repeat(60));
    console.log('Test Expectations:');
    console.log('─'.repeat(60));
    
    // Expected cases:
    // 1. (gw) - suggest !w
    // 2. (eW) - suggest !W  
    // 3. (ghw) - suggest h!w
    // 4. (f!gw) - NO suggestion (already has !)
    // 5. (fgw) and (iwk) - suggest !w twice (2 suggestions)
    // 6. (fghwi) - suggest h!w
    // Total: 1 + 1 + 1 + 0 + 2 + 1 = 6 suggestions
    const expectedCount = 6;
    
    if (quilismaSuggestions.length === expectedCount) {
        console.log(`✅ PASS: Found expected ${expectedCount} quilisma suggestions`);
    } else {
        console.log(`❌ FAIL: Expected ${expectedCount} suggestions, got ${quilismaSuggestions.length}`);
        console.log('\nExpected suggestions:');
        console.log('  - Case 1: (gw) → g!w');
        console.log('  - Case 2: (eW) → e!W');
        console.log('  - Case 3: (ghw) → g!hw (h!w)');
        console.log('  - Case 4: (f!gw) → no suggestion (already has !)');
        console.log('  - Case 5: (fgw) → !w and (iwk) → !w');
        console.log('  - Case 6: (fghwi) → fg!hwi (h!w)');
    }

}).catch(error => {
    console.error('❌ Validation error:', error);
    process.exit(1);
});

function getSeverityName(severity) {
    switch (severity) {
        case 1: return 'Error';
        case 2: return 'Warning';
        case 3: return 'Information';
        case 4: return 'Hint';
        default: return 'Unknown';
    }
}
