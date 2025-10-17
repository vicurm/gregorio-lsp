const { GABCParser } = require('../out/parser/gabc-parser');

console.log('Testing Advanced Tag Validation...\n');

// Test case 1: Properly nested tags
const properNestedTest = `name: Proper Nested;
%%
(c4) Ky<b>ri<i>e</i></b>(g)le(h)i(i)son.`;

console.log('1. Properly Nested Tags Test:');
const parser1 = new GABCParser();
const result1 = parser1.parse(properNestedTest);
console.log('Warnings found:', result1.errors.filter(d => d.severity === 2).length);
console.log('Errors found:', result1.errors.filter(d => d.severity === 1).length);
result1.errors.forEach(d => console.log(`- ${d.message}`));

// Test case 2: Cross-nested tags (improper)
const crossNestedTest = `name: Cross Nested;
%%
(c4) Ky<b>ri<i>e</b>le</i>(g)son.`;

console.log('\n2. Cross-Nested Tags Test:');
const parser2 = new GABCParser();
const result2 = parser2.parse(crossNestedTest);
console.log('Warnings found:', result2.errors.filter(d => d.severity === 2).length);
console.log('Errors found:', result2.errors.filter(d => d.severity === 1).length);
result2.errors.forEach(d => console.log(`- ${d.message}`));

// Test case 3: Tags spanning multiple syllables
const spanningTagsTest = `name: Spanning Tags;
%%
(c4) Ky<b>ri(g)e</b>(h)le(i)son.`;

console.log('\n3. Tags Spanning Multiple Syllables Test:');
const parser3 = new GABCParser();
const result3 = parser3.parse(spanningTagsTest);
console.log('Warnings found:', result3.errors.filter(d => d.severity === 2).length);
console.log('Errors found:', result3.errors.filter(d => d.severity === 1).length);
result3.errors.forEach(d => console.log(`- ${d.message}`));

// Test case 4: Complex nesting with multiple levels
const complexNestingTest = `name: Complex Nesting;
%%
(c4) Ky<b>ri<i>e<sc>le</sc></i>i</b>(g)son.`;

console.log('\n4. Complex Nesting Test:');
const parser4 = new GABCParser();
const result4 = parser4.parse(complexNestingTest);
console.log('Warnings found:', result4.errors.filter(d => d.severity === 2).length);
console.log('Errors found:', result4.errors.filter(d => d.severity === 1).length);
result4.errors.forEach(d => console.log(`- ${d.message}`));

// Test case 5: Mixed valid and invalid tags
const mixedTagsTest = `name: Mixed Tags;
%%
(c4) Ky<unknowntag>ri</unknowntag><b>e</b>(g)le(h)i(i)son.`;

console.log('\n5. Mixed Valid and Invalid Tags Test:');
const parser5 = new GABCParser();
const result5 = parser5.parse(mixedTagsTest);
console.log('Warnings found:', result5.errors.filter(d => d.severity === 2).length);
console.log('Errors found:', result5.errors.filter(d => d.severity === 1).length);
result5.errors.forEach(d => console.log(`- ${d.message}`));

console.log('\nAdvanced tag validation tests completed!');