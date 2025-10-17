#!/usr/bin/env node

const { GABCParser } = require('../out/parser/gabc-parser');
const { GABCValidator } = require('../out/validation/gabc-validator');
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Quilisma Ascending Motion Validation\n');

// Read test file
const testFile = path.join(__dirname, '..', 'test_quilisma_ascending.gabc');
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
    nabc: {
        enabled: false,
        strictChecking: false,
        fontFamily: 'gregall'
    }
};

// Validate
validator.validate(ast.ast, mockDocument, mockSettings).then(diagnostics => {
    console.log(`Found ${diagnostics.length} diagnostic(s):\n`);

    // Filter by type
    const glyphBreakSuggestions = diagnostics.filter(d => d.code === 'quilisma-glyph-break');
    const ascendingWarnings = diagnostics.filter(d => d.code === 'quilisma-ascending-motion');
    const noFollowingNoteWarnings = diagnostics.filter(d => d.code === 'quilisma-no-following-note');
    const others = diagnostics.filter(d => 
        !['quilisma-glyph-break', 'quilisma-ascending-motion', 'quilisma-no-following-note'].includes(d.code)
    );

    console.log(`📊 Quilisma Glyph Break Suggestions: ${glyphBreakSuggestions.length}`);
    glyphBreakSuggestions.forEach((diag, index) => {
        console.log(`  ${index + 1}. ${diag.message}`);
    });
    console.log();

    console.log(`⚠️  Quilisma Ascending Motion Warnings: ${ascendingWarnings.length}`);
    ascendingWarnings.forEach((diag, index) => {
        console.log(`  ${index + 1}. ${diag.message}`);
    });
    console.log();

    console.log(`⚠️  Quilisma No Following Note Warnings: ${noFollowingNoteWarnings.length}`);
    noFollowingNoteWarnings.forEach((diag, index) => {
        console.log(`  ${index + 1}. ${diag.message}`);
    });
    console.log();

    if (others.length > 0) {
        console.log('📋 Other Diagnostics:');
        others.forEach((diag, index) => {
            console.log(`  ${index + 1}. ${diag.message} [${getSeverityName(diag.severity)}]`);
        });
        console.log();
    }

    // Verify test expectations
    console.log('─'.repeat(60));
    console.log('Test Expectations:');
    console.log('─'.repeat(60));
    
    const expectedGlyphBreaks = 9; // First line: gwh, gwi, gwj; Second line: gw, gwf, gwe; Third line: gwh, gwf, gwi
    const expectedAscendingWarnings = 4; // gwf (f < g), gwe (e < g), gwf (f < g), gw (no following note)
    
    let allPassed = true;

    if (glyphBreakSuggestions.length === expectedGlyphBreaks) {
        console.log(`✅ PASS: Found expected ${expectedGlyphBreaks} glyph break suggestions`);
    } else {
        console.log(`❌ FAIL: Expected ${expectedGlyphBreaks} glyph break suggestions, got ${glyphBreakSuggestions.length}`);
        allPassed = false;
    }

    if (ascendingWarnings.length + noFollowingNoteWarnings.length === expectedAscendingWarnings) {
        console.log(`✅ PASS: Found expected ${expectedAscendingWarnings} ascending motion warnings`);
    } else {
        console.log(`❌ FAIL: Expected ${expectedAscendingWarnings} ascending warnings, got ${ascendingWarnings.length + noFollowingNoteWarnings.length}`);
        allPassed = false;
    }

    console.log();
    if (allPassed) {
        console.log('🎉 All tests passed!');
        process.exit(0);
    } else {
        console.log('❌ Some tests failed');
        process.exit(1);
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
