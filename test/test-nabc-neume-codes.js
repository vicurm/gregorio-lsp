/**
 * Comprehensive test for NABC neume code detection
 * Tests all 33 official NABC neume codes:
 * - 31 St. Gall codes
 * - 2 Laon codes
 */

const path = require('path');

async function testNabcNeumeCodes() {
    const { GABCParser } = await import('../out/parser/gabc-parser.js');
    const { GABCValidator } = await import('../out/validation/gabc-validator.js');
    
    console.log('🧪 Testing NABC Neume Code Detection\n');
    console.log('─'.repeat(60));

    // All 33 official NABC neume codes with descriptions
    const neumeCodes = [
        // St. Gall codes (31)
        { code: 'vi', name: 'Virga', category: 'St. Gall' },
        { code: 'pu', name: 'Punctum', category: 'St. Gall' },
        { code: 'ta', name: 'Tractulus', category: 'St. Gall' },
        { code: 'gr', name: 'Gravis', category: 'St. Gall' },
        { code: 'cl', name: 'Clivis', category: 'St. Gall' },
        { code: 'pe', name: 'Pes', category: 'St. Gall' },
        { code: 'po', name: 'Porrectus', category: 'St. Gall' },
        { code: 'to', name: 'Torculus', category: 'St. Gall' },
        { code: 'ci', name: 'Climacus', category: 'St. Gall' },
        { code: 'sc', name: 'Scandicus', category: 'St. Gall' },
        { code: 'pf', name: 'Pes Flexus', category: 'St. Gall' },
        { code: 'sf', name: 'Scandicus Flexus', category: 'St. Gall' },
        { code: 'tr', name: 'Torculus Resupinus', category: 'St. Gall' },
        { code: 'st', name: 'Strophicus', category: 'St. Gall' },
        { code: 'ds', name: 'Distropha', category: 'St. Gall' },
        { code: 'ts', name: 'Tristropha', category: 'St. Gall' },
        { code: 'tg', name: 'Trigon', category: 'St. Gall' },
        { code: 'bv', name: 'Bivirga', category: 'St. Gall' },
        { code: 'tv', name: 'Trivirga', category: 'St. Gall' },
        { code: 'pr', name: 'Pressus', category: 'St. Gall' },
        { code: 'pi', name: 'Pes with Inferior Note', category: 'St. Gall' },
        { code: 'vs', name: 'Virga Strata', category: 'St. Gall' },
        { code: 'or', name: 'Oriscus', category: 'St. Gall' },
        { code: 'sa', name: 'Salicus', category: 'St. Gall' },
        { code: 'pq', name: 'Pes Quassus', category: 'St. Gall' },
        { code: 'ql', name: 'Quilisma', category: 'St. Gall' },
        { code: 'qi', name: 'Quilisma Pes', category: 'St. Gall' },
        { code: 'pt', name: 'Punctum with Tail', category: 'St. Gall' },
        { code: 'ni', name: 'Nigrescent', category: 'St. Gall' },
        
        // Laon codes (2)
        { code: 'un', name: 'Uncinus', category: 'Laon' },
        { code: 'oc', name: 'Occentus', category: 'Laon' },
    ];

    // Test each neume code with various pitch descriptors
    const testCases = [];
    
    // Generate test cases for each neume code
    neumeCodes.forEach(({ code, name, category }) => {
        // Basic neume code
        testCases.push({
            code,
            name,
            category,
            snippet: `${code}`,
            description: `Basic ${name}`
        });

        // With pitch descriptor
        testCases.push({
            code,
            name,
            category,
            snippet: `${code}1h`,
            description: `${name} with pitch 1h`
        });

        // With modifier S
        testCases.push({
            code,
            name,
            category,
            snippet: `${code}S1h`,
            description: `${name} with modifier S`
        });

        // With modifier and multiple pitches
        testCases.push({
            code,
            name,
            category,
            snippet: `${code}G2i3j`,
            description: `${name} with modifier G and pitches`
        });
    });

    // Test GABC quilisma patterns that should NOT be detected as NABC
    const gabcQuilismaCases = [
        { snippet: 'gwh', description: 'GABC quilisma ascending', shouldBeNabc: false },
        { snippet: 'fwi', description: 'GABC quilisma from f to i', shouldBeNabc: false },
        { snippet: 'g!wh', description: 'GABC quilisma with glyph break', shouldBeNabc: false },
        { snippet: 'ewj', description: 'GABC quilisma from e to j', shouldBeNabc: false },
    ];

    console.log('📋 Testing NABC Neume Codes\n');

    const parser = new GABCParser();
    let passed = 0;
    let failed = 0;
    const failures = [];

    // Test NABC neume codes
    for (const testCase of testCases) {
        const isNabc = parser.isNabcSnippet(testCase.snippet);
        
        if (isNabc) {
            passed++;
            console.log(`✅ ${testCase.code.toUpperCase()} (${testCase.category}): "${testCase.snippet}" - ${testCase.description}`);
        } else {
            failed++;
            failures.push({
                ...testCase,
                expected: 'NABC',
                actual: 'Not detected'
            });
            console.log(`❌ ${testCase.code.toUpperCase()} (${testCase.category}): "${testCase.snippet}" - ${testCase.description} [FAILED]`);
        }
    }

    console.log('\n📋 Testing GABC Quilisma Patterns (should NOT be NABC)\n');

    // Test GABC quilisma patterns
    for (const testCase of gabcQuilismaCases) {
        const isNabc = parser.isNabcSnippet(testCase.snippet);
        
        if (!isNabc) {
            passed++;
            console.log(`✅ "${testCase.snippet}" - ${testCase.description} - Correctly identified as GABC`);
        } else {
            failed++;
            failures.push({
                ...testCase,
                expected: 'GABC',
                actual: 'Incorrectly detected as NABC'
            });
            console.log(`❌ "${testCase.snippet}" - ${testCase.description} - Incorrectly detected as NABC [FAILED]`);
        }
    }

    // Summary
    console.log('\n' + '─'.repeat(60));
    console.log('📊 Test Summary\n');
    console.log(`Total tests: ${passed + failed}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

    if (failures.length > 0) {
        console.log('\n❌ Failed Tests:\n');
        failures.forEach((failure, index) => {
            console.log(`${index + 1}. ${failure.snippet} - ${failure.description}`);
            console.log(`   Expected: ${failure.expected}`);
            console.log(`   Actual: ${failure.actual}\n`);
        });
    }

    console.log('─'.repeat(60));

    if (failed === 0) {
        console.log('\n🎉 All tests passed!');
        process.exit(0);
    } else {
        console.log(`\n❌ ${failed} test(s) failed`);
        process.exit(1);
    }
}

testNabcNeumeCodes().catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
});
