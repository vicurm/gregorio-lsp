const { GABCParser } = require('../out/parser/gabc-parser');

console.log('Testing GABC Parser Basic Functionality...\n');

// Test 1: Basic GABC parsing
const basicTest = `name: Kyrie;
office-part: Ordinary;
%%
(c4) Ky(g)ri(h)e(i) e(j)lei(k)son.`;

console.log('1. Basic GABC Test:');
const parser1 = new GABCParser();
const result1 = parser1.parse(basicTest);
console.log('Success:', result1.success);
console.log('Syllables found:', result1.ast?.music.syllables.length);
console.log('Headers found:', result1.ast?.headers.length);
console.log('Errors:', result1.errors.length);

// Test 2: NABC alternation
const nabcTest = `name: NABC Test;
nabc-lines: 1;
%%
(c4) Ky(g|f)ri(h|g)e.`;

console.log('\n2. NABC Alternation Test:');
const parser2 = new GABCParser();
const result2 = parser2.parse(nabcTest);
console.log('Success:', result2.success);
console.log('Syllables found:', result2.ast?.music.syllables.length);
console.log('Errors:', result2.errors.length);

// Test 3: Error detection
const errorTest = `name: Error Test;
%%
(c4) Ky(invalid)ri(g)e.`;

console.log('\n3. Error Detection Test:');
const parser3 = new GABCParser();
const result3 = parser3.parse(errorTest);
console.log('Success:', result3.success);
console.log('Errors found:', result3.errors.filter(e => e.severity === 1).length);
console.log('Warnings found:', result3.errors.filter(e => e.severity === 2).length);

console.log('\nBasic parser tests completed!');