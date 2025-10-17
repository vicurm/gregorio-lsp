const { GABCParser } = require('../out/parser/gabc-parser');

console.log('Testing Warning Validations...\n');

// Test case 1: Large ambitus warning  
const largeAmbitusTest = `name: Test;
%%
(c4) Ky(g p)ri(h)e.`;

console.log('1. Large Ambitus Test:');
const parser1 = new GABCParser();
const result1 = parser1.parse(largeAmbitusTest);
console.log('Warnings found:', result1.errors.filter(d => d.severity === 2).length);
console.log('Errors found:', result1.errors.filter(d => d.severity === 1).length);
result1.errors.forEach(d => console.log(`- ${d.message}`));

// Test case 2: Style conflict - multiple centers
const multipleCentersTest = `name: Test;
%%
(c4) Ky<c>ri<c>e(g)le(h)i(i)son.`;

console.log('\n2. Multiple Centers Test:');
const parser2 = new GABCParser();
const result2 = parser2.parse(multipleCentersTest);
console.log('Warnings found:', result2.errors.filter(d => d.severity === 2).length);
console.log('Errors found:', result2.errors.filter(d => d.severity === 1).length);
result2.errors.forEach(d => console.log(`- ${d.message}`));

// Test case 3: First syllable with line break (should be error)
const firstSyllableLineBreakTest = `name: Test;
%%
(c4) Ky(g/h)ri(i)e.`;

console.log('\n3. First Syllable Line Break Test:');
const parser3 = new GABCParser();
const result3 = parser3.parse(firstSyllableLineBreakTest);
console.log('First syllable music:', result3.ast?.music.syllables[0]?.music?.content);
console.log('Warnings found:', result3.errors.filter(d => d.severity === 2).length);
console.log('Errors found:', result3.errors.filter(d => d.severity === 1).length);
result3.errors.forEach(d => console.log(`- ${d.message}`));

// Test case 3b: First syllable with z line break
const firstSyllableZBreakTest = `name: Test Z Break;
%%
(c4) Ky(g z h)ri(i)e.`;

console.log('\n3b. First Syllable Z Line Break Test:');
const parser3b = new GABCParser();
const result3b = parser3b.parse(firstSyllableZBreakTest);
console.log('First syllable music:', result3b.ast?.music.syllables[0]?.music?.content);
console.log('Warnings found:', result3b.errors.filter(d => d.severity === 2).length);
console.log('Errors found:', result3b.errors.filter(d => d.severity === 1).length);
result3b.errors.forEach(d => console.log(`- ${d.message}`));

// Test case 4: Initial clef (should NOT trigger error)
const initialClefTest = `name: Test Clef;
%%
(c4) Ky(g)ri(h)e.`;

console.log('\n4. Initial Clef Test (should be clean):');
const parser4 = new GABCParser();
const result4 = parser4.parse(initialClefTest);
console.log('Warnings found:', result4.errors.filter(d => d.severity === 2).length);
console.log('Errors found:', result4.errors.filter(d => d.severity === 1).length);
result4.errors.forEach(d => console.log(`- ${d.message}`));

// Test case 5: Clef change in first syllable (should trigger error)
const clefChangeTest = `name: Test Clef Change;
%%
(c4) Ky(g f4 h)ri(i)e.`;

console.log('\n5. Clef Change in First Syllable Test:');
const parser5 = new GABCParser();
const result5 = parser5.parse(clefChangeTest);
console.log('First syllable music:', result5.ast?.music.syllables[0]?.music?.content);
console.log('Warnings found:', result5.errors.filter(d => d.severity === 2).length);
console.log('Errors found:', result5.errors.filter(d => d.severity === 1).length);
result5.errors.forEach(d => console.log(`- ${d.message}`));

console.log('\nWarning validation tests completed!');