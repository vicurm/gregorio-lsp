const { GABCParser } = require('../out/parser/gabc-parser');

console.log('Testing Tag Validation...\n');

// Test case 1: Unclosed bold tag
const unclosedBoldTest = `name: Unclosed Bold;
%%
(c4) Ky<b>ri(g)e(h).`;

console.log('1. Unclosed Bold Tag Test:');
const parser1 = new GABCParser();
const result1 = parser1.parse(unclosedBoldTest);
console.log('Warnings found:', result1.errors.filter(d => d.severity === 2).length);
console.log('Errors found:', result1.errors.filter(d => d.severity === 1).length);
result1.errors.forEach(d => console.log(`- ${d.message}`));

// Test case 2: Unmatched closing tag
const unmatchedClosingTest = `name: Unmatched Closing;
%%
(c4) Ky</b>ri(g)e(h).`;

console.log('\n2. Unmatched Closing Tag Test:');
const parser2 = new GABCParser();
const result2 = parser2.parse(unmatchedClosingTest);
console.log('Warnings found:', result2.errors.filter(d => d.severity === 2).length);
console.log('Errors found:', result2.errors.filter(d => d.severity === 1).length);
result2.errors.forEach(d => console.log(`- ${d.message}`));

// Test case 3: Properly matched tags (should be clean)
const properTagsTest = `name: Proper Tags;
%%
(c4) Ky<b>ri</b>(g)e<i>le</i>(h)i(i)son.`;

console.log('\n3. Properly Matched Tags Test:');
const parser3 = new GABCParser();
const result3 = parser3.parse(properTagsTest);
console.log('Warnings found:', result3.errors.filter(d => d.severity === 2).length);
console.log('Errors found:', result3.errors.filter(d => d.severity === 1).length);
result3.errors.forEach(d => console.log(`- ${d.message}`));

// Test case 4: Multiple unclosed tags
const multipleUnclosedTest = `name: Multiple Unclosed;
%%
(c4) Ky<b>ri<i>e(g)le(h)i(i)son.`;

console.log('\n4. Multiple Unclosed Tags Test:');
const parser4 = new GABCParser();
const result4 = parser4.parse(multipleUnclosedTest);
console.log('Warnings found:', result4.errors.filter(d => d.severity === 2).length);
console.log('Errors found:', result4.errors.filter(d => d.severity === 1).length);
result4.errors.forEach(d => console.log(`- ${d.message}`));

// Test case 5: Nested tags with improper closing
const nestedTagsTest = `name: Nested Tags;
%%
(c4) Ky<b>ri<i>e</b>le</i>(g)son.`;

console.log('\n5. Nested Tags with Improper Closing Test:');
const parser5 = new GABCParser();
const result5 = parser5.parse(nestedTagsTest);
console.log('Warnings found:', result5.errors.filter(d => d.severity === 2).length);
console.log('Errors found:', result5.errors.filter(d => d.severity === 1).length);
result5.errors.forEach(d => console.log(`- ${d.message}`));

// Test case 6: Special GABC tags (nlba, pr, etc.)
const specialTagsTest = `name: Special Tags;
%%
(c4) Ky<nlba>ri</nlba>(g)e<pr>le</pr>(h)i(i)son.`;

console.log('\n6. Special GABC Tags Test:');
const parser6 = new GABCParser();
const result6 = parser6.parse(specialTagsTest);
console.log('Warnings found:', result6.errors.filter(d => d.severity === 2).length);
console.log('Errors found:', result6.errors.filter(d => d.severity === 1).length);
result6.errors.forEach(d => console.log(`- ${d.message}`));

console.log('\nTag validation tests completed!');