const { GABCParser } = require('../out/parser/gabc-parser');

console.log('Testing Complete Validation Pipeline...\n');

// Comprehensive test with multiple types of issues
const comprehensiveTest = `name: Comprehensive Test;
%%
(c4) Ky<b>ri(g p/h)</b>e<i>le(i)i<c>son<c>(j|k).`;

console.log('Comprehensive Validation Test:');
console.log('Input GABC:');
console.log(comprehensiveTest);
console.log('\nValidation Results:');

const parser = new GABCParser();
const result = parser.parse(comprehensiveTest);

console.log('Success:', result.success);
console.log('Total issues:', result.errors.length);

// Separate by type
const errors = result.errors.filter(e => e.severity === 1);
const warnings = result.errors.filter(e => e.severity === 2);

console.log('\nERRORS (Severity 1):');
errors.forEach((err, index) => {
  console.log(`${index + 1}. ${err.message}`);
});

console.log('\nWARNINGS (Severity 2):');
warnings.forEach((warn, index) => {
  console.log(`${index + 1}. ${warn.message}`);
});

console.log('\nExpected Issues:');
console.log('- Large ambitus warning: g->p (9 semitones)');
console.log('- Line break error in first syllable: /');
console.log('- Multiple centers warning: <c>');
console.log('- NABC alternation error: | without nabc-lines');

console.log('\nComplete validation pipeline test completed!');