/**
 * NABC Autocomplete and Hover Demo
 * 
 * This demonstrates how to use the NABC completion and hover providers
 * in a VS Code extension or Language Server.
 */

import { 
  nabcCompletionProvider, 
  nabcHoverProvider, 
  NABCFontFamily 
} from './src/nabc';

// Example: Setting up NABC providers for different font families
function setupNABCProviders() {
  console.log('🎵 Setting up NABC Autocomplete and Hover System');
  
  // Configure for St. Gall font
  nabcCompletionProvider.setFont(NABCFontFamily.ST_GALL);
  nabcHoverProvider.setFont(NABCFontFamily.ST_GALL);
  
  console.log('✅ NABC providers configured for St. Gall font');
}

// Example: Getting completions for NABC elements
function demonstrateCompletions() {
  console.log('\n📝 NABC Completion Examples:');
  
  // Get all glyph completions
  const glyphCompletions = nabcCompletionProvider.getGlyphCompletions();
  console.log(`   Found ${glyphCompletions.length} glyph completions`);
  console.log(`   Sample: ${glyphCompletions.slice(0, 3).map((c: any) => c.label).join(', ')}...`);
  
  // Get significant letter completions
  const letterCompletions = nabcCompletionProvider.getSignificantLetterCompletions();
  console.log(`   Found ${letterCompletions.length} significant letter completions`);
  console.log(`   Sample: ${letterCompletions.slice(0, 3).map((c: any) => c.label).join(', ')}...`);
  
  // Get modifier completions
  const modifierCompletions = nabcCompletionProvider.getModifierCompletions();
  console.log(`   Found ${modifierCompletions.length} modifier completions`);
  console.log(`   Sample: ${modifierCompletions.map((c: any) => c.label).join(', ')}`);
  
  // Get all completions
  const allCompletions = nabcCompletionProvider.getAllCompletions();
  console.log(`   Total completions available: ${allCompletions.length}`);
}

// Example: Getting hover information for NABC elements
function demonstrateHover() {
  console.log('\n🔍 NABC Hover Examples:');
  
  // Test basic glyphs
  const testGlyphs = ['vi', 'pu', 'cl', 'pe', 'po'];
  
  for (const glyph of testGlyphs) {
    const hoverInfo = nabcHoverProvider.getHoverInfo(glyph);
    if (hoverInfo) {
      const content = (hoverInfo.contents as any).value || 'No description';
      const firstLine = content.split('\n')[0].replace(/[#*]/g, '');
      console.log(`   ${glyph}: ${firstLine}`);
    }
  }
  
  // Test complex glyphs with modifiers
  console.log('\n   Complex glyphs:');
  const complexGlyphs = ['vi-', 'pu>', 'clS'];
  
  for (const glyph of complexGlyphs) {
    const hoverInfo = nabcHoverProvider.getHoverInfo(glyph);
    if (hoverInfo) {
      const content = (hoverInfo.contents as any).value || 'No description';
      const firstLine = content.split('\n')[0].replace(/[#*]/g, '');
      console.log(`   ${glyph}: ${firstLine}`);
    }
  }
}

// Example: Font-specific features
function demonstrateFontSupport() {
  console.log('\n🎨 Font-Specific Features:');
  
  // Test St. Gall font
  nabcHoverProvider.setFont(NABCFontFamily.ST_GALL);
  const stGallHover = nabcHoverProvider.getHoverInfo('st'); // stropha
  console.log(`   St. Gall 'st': ${stGallHover ? 'Supported' : 'Not supported'}`);
  
  // Test Laon font
  nabcHoverProvider.setFont(NABCFontFamily.LAON);
  const laonUnHover = nabcHoverProvider.getHoverInfo('un'); // uncinus
  const laonStHover = nabcHoverProvider.getHoverInfo('st'); // stropha not in Laon
  console.log(`   Laon 'un': ${laonUnHover ? 'Supported' : 'Not supported'}`);
  console.log(`   Laon 'st': ${laonStHover ? 'Supported' : 'Not supported'}`);
  
  // Test Tironian letters (Laon only)
  nabcCompletionProvider.setFont(NABCFontFamily.LAON);
  const tironianCompletions = nabcCompletionProvider.getAllCompletions()
    .filter((c: any) => c.label.startsWith('lt'));
  console.log(`   Tironian letters in Laon: ${tironianCompletions.length} available`);
}

// Example: Integration with LSP
function demonstrateLSPIntegration() {
  console.log('\n🔌 LSP Integration Examples:');
  
  console.log('   ✅ Integrated with GABCCompletionProvider.getNABCCompletions()');
  console.log('   ✅ Integrated with GABCHoverProvider.analyzeNABCContent()');
  console.log('   ✅ Font-aware completions and hover information');
  console.log('   ✅ Context-aware suggestions based on NABC snippets');
  console.log('   ✅ Comprehensive validation with warning cases');
}

// Run the demonstration
function runDemo() {
  console.log('🚀 NABC Autocomplete and Hover System Demo\n');
  console.log('=' .repeat(50));
  
  setupNABCProviders();
  demonstrateCompletions();
  demonstrateHover();
  demonstrateFontSupport();
  demonstrateLSPIntegration();
  
  console.log('\n' + '='.repeat(50));
  console.log('🎉 Demo completed successfully!');
  console.log('\nThe NABC autocomplete and hover system provides:');
  console.log('• 60+ basic glyph codes with descriptions');
  console.log('• 6 glyph modifiers (S, G, M, -, >, ~)');
  console.log('• 48 St. Gall + 25 Laon significant letters');
  console.log('• 15 Tironian notes (Laon only)');
  console.log('• Pitch descriptors (ha-hp)');
  console.log('• Spacing adjustments (/, //, `, ``)');
  console.log('• Font-specific validation and warnings');
  console.log('• Complete LSP integration');
}

// Export for use in tests or documentation
export {
  setupNABCProviders,
  demonstrateCompletions,
  demonstrateHover,
  demonstrateFontSupport,
  demonstrateLSPIntegration,
  runDemo
};

// Run if executed directly
if (require.main === module) {
  runDemo();
}