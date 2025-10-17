/**
 * Edge case tests for quilisma validation
 * Tests complex scenarios including:
 * - Multiple consecutive quilismas
 * - Quilisma at word boundaries
 * - Quilisma with various modifiers
 * - Mixed GABC/NABC with quilisma
 */

const path = require('path');

async function testQuilismaEdgeCases() {
    const { GABCParser } = await import('../out/parser/gabc-parser.js');
    const { GABCValidator } = await import('../out/validation/gabc-validator.js');
    
    console.log('🧪 Testing Quilisma Edge Cases\n');
    console.log('─'.repeat(60));

    const testCases = [
        {
            name: 'Multiple consecutive quilismas',
            gabc: `name: Multiple Quilismas;
%%
Test(gwh)ing(hwi)quilisma(iwj). (::)`,
            expectedGlyphBreaks: 3,
            expectedAscendingWarnings: 0,
            description: 'All quilismas ascending correctly'
        },
        {
            name: 'Quilisma with uppercase W',
            gabc: `name: Uppercase Quilisma;
%%
Test(gWh)ing(fWi). (::)`,
            expectedGlyphBreaks: 2,
            expectedAscendingWarnings: 0,
            description: 'Uppercase W should be treated same as lowercase w'
        },
        {
            name: 'Quilisma at syllable boundaries',
            gabc: `name: Syllable Boundaries;
%%
First(gw)() se(h)cond(i). (::)`,
            expectedGlyphBreaks: 1,
            expectedAscendingWarnings: 1,
            description: 'Quilisma followed by syllable break'
        },
        {
            name: 'Multiple quilismas same syllable',
            gabc: `name: Same Syllable;
%%
Com(gwhfwi)plex. (::)`,
            expectedGlyphBreaks: 2,
            expectedAscendingWarnings: 0,
            description: 'Multiple quilismas in single notation group'
        },
        {
            name: 'Quilisma with all descending',
            gabc: `name: All Descending;
%%
Bad(gwf)worse(fwe)worst(ewd). (::)`,
            expectedGlyphBreaks: 3,
            expectedAscendingWarnings: 3,
            description: 'All quilismas incorrectly descending'
        },
        {
            name: 'Quilisma at bar line',
            gabc: `name: Bar Line;
%%
Test(gw)(::)Next(hi). (::)`,
            expectedGlyphBreaks: 1,
            expectedAscendingWarnings: 1,
            description: 'Quilisma before bar line without following note'
        },
        {
            name: 'Quilisma with glyph breaks already present',
            gabc: `name: Existing Breaks;
%%
Good(g!wh)example(f!wi). (::)`,
            expectedGlyphBreaks: 0,
            expectedAscendingWarnings: 0,
            description: 'Should not suggest breaks when already present'
        },
        {
            name: 'Mixed ascending and descending',
            gabc: `name: Mixed;
%%
Good(gwh)bad(gwf)good(gwi)bad(gwe). (::)`,
            expectedGlyphBreaks: 4,
            expectedAscendingWarnings: 2,
            description: 'Mix of correct and incorrect quilisma usage'
        },
        {
            name: 'Quilisma with extreme pitches',
            gabc: `name: Extreme Pitches;
%%
Low(awb)high(lwm). (::)`,
            expectedGlyphBreaks: 2,
            expectedAscendingWarnings: 0,
            description: 'Quilisma at extreme pitch ranges'
        },
        {
            name: 'Quilisma with same pitch following',
            gabc: `name: Same Pitch;
%%
Test(gwg)same. (::)`,
            expectedGlyphBreaks: 1,
            expectedAscendingWarnings: 1,
            description: 'Quilisma followed by same pitch should warn'
        },
        {
            name: 'Empty syllables with quilisma',
            gabc: `name: Empty Syllables;
%%
Test(gw)()()more. (::)`,
            expectedGlyphBreaks: 1,
            expectedAscendingWarnings: 1,
            description: 'Quilisma followed by empty syllables'
        },
        {
            name: 'Long melisma with quilismas',
            gabc: `name: Long Melisma;
%%
Me(gwhfwijhwkgwl)lis(ma). (::)`,
            expectedGlyphBreaks: 4,
            expectedAscendingWarnings: 0,
            description: 'Long melismatic passage with multiple quilismas'
        },
    ];

    let totalPassed = 0;
    let totalFailed = 0;
    const failures = [];

    for (const testCase of testCases) {
        console.log(`\n📝 Test: ${testCase.name}`);
        console.log(`   ${testCase.description}`);
        console.log('─'.repeat(60));
        
        try {
            const parser = new GABCParser();
            const validator = new GABCValidator();
            
            const parseResult = await parser.parse(testCase.gabc, 'test.gabc');
            
            if (!parseResult || !parseResult.success || !parseResult.ast) {
                console.log('❌ Parse failed');
                totalFailed++;
                failures.push({ name: testCase.name, reason: 'Parse failed' });
                continue;
            }
            
            const ast = parseResult.ast;
            console.log('✅ Parse successful');
            
            const diagnostics = await validator.validate(ast, testCase.gabc);
            
            console.log(`   Total diagnostics: ${diagnostics.length}`);
            if (diagnostics.length > 0) {
                diagnostics.forEach(d => console.log(`     - ${d.code}: ${d.message}`));
            }
            
            const glyphBreakSuggestions = diagnostics.filter(d => d.code === 'quilisma-glyph-break');
            const ascendingWarnings = diagnostics.filter(d => 
                d.code === 'quilisma-ascending-motion' || d.code === 'quilisma-no-following-note'
            );
            
            console.log(`   Glyph break suggestions: ${glyphBreakSuggestions.length} (expected: ${testCase.expectedGlyphBreaks})`);
            console.log(`   Ascending warnings: ${ascendingWarnings.length} (expected: ${testCase.expectedAscendingWarnings})`);
            
            const glyphBreakMatch = glyphBreakSuggestions.length === testCase.expectedGlyphBreaks;
            const ascendingMatch = ascendingWarnings.length === testCase.expectedAscendingWarnings;
            
            if (glyphBreakMatch && ascendingMatch) {
                console.log('✅ PASS: All expectations met');
                totalPassed++;
            } else {
                console.log('❌ FAIL: Expectations not met');
                totalFailed++;
                failures.push({
                    name: testCase.name,
                    expected: {
                        glyphBreaks: testCase.expectedGlyphBreaks,
                        ascendingWarnings: testCase.expectedAscendingWarnings
                    },
                    actual: {
                        glyphBreaks: glyphBreakSuggestions.length,
                        ascendingWarnings: ascendingWarnings.length
                    }
                });
            }
            
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
            totalFailed++;
            failures.push({ name: testCase.name, reason: error.message });
        }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary\n');
    console.log(`Total tests: ${totalPassed + totalFailed}`);
    console.log(`✅ Passed: ${totalPassed}`);
    console.log(`❌ Failed: ${totalFailed}`);
    console.log(`Success rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);

    if (failures.length > 0) {
        console.log('\n❌ Failed Tests:\n');
        failures.forEach((failure, index) => {
            console.log(`${index + 1}. ${failure.name}`);
            if (failure.reason) {
                console.log(`   Reason: ${failure.reason}`);
            } else {
                console.log(`   Expected: ${JSON.stringify(failure.expected)}`);
                console.log(`   Actual: ${JSON.stringify(failure.actual)}`);
            }
            console.log();
        });
    }

    console.log('='.repeat(60));

    if (totalFailed === 0) {
        console.log('\n🎉 All edge case tests passed!');
        process.exit(0);
    } else {
        console.log(`\n❌ ${totalFailed} test(s) failed`);
        process.exit(1);
    }
}

testQuilismaEdgeCases().catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
});
