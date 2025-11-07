#!/usr/bin/env node

/**
 * AI Service Test Runner
 * Runs the AI service tests directly without needing a dev server
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set environment variables
process.env.NODE_ENV = 'test';

console.log('🧪 WOS Links - AI Service Test Suite\n');
console.log('═'.repeat(60));
console.log('\n📋 Loading test suite...\n');

try {
  // Dynamic import of the test file
  const testModule = await import('./src/lib/ai/__tests__/ai-service.test.ts');

  console.log('✅ Test suite loaded successfully\n');
  console.log('═'.repeat(60));
  console.log('\n🚀 Running tests...\n');

  // Run all tests
  const results = await testModule.runAllTests();

  // Display results
  console.log('\n' + '═'.repeat(60));
  console.log('\n📊 TEST RESULTS SUMMARY\n');
  console.log('═'.repeat(60) + '\n');

  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⏱️  Total Time: ${results.totalTime}ms\n`);

  // Show individual test results
  console.log('═'.repeat(60));
  console.log('\n📝 DETAILED RESULTS\n');
  console.log('═'.repeat(60) + '\n');

  results.tests.forEach((test, index) => {
    const icon = test.success ? '✅' : '❌';
    const status = test.success ? 'PASSED' : 'FAILED';

    console.log(`${index + 1}. ${icon} ${test.name} - ${status}`);
    console.log(`   Time: ${test.time}ms`);

    if (test.success) {
      console.log(`   ${test.message}`);
    } else {
      console.log(`   Error: ${test.error}`);
    }

    if (test.details) {
      console.log(`   Details: ${JSON.stringify(test.details, null, 2)}`);
    }

    console.log('');
  });

  console.log('═'.repeat(60));
  console.log('\n🏁 Test run completed\n');

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);

} catch (error) {
  console.error('\n❌ Error running tests:\n');
  console.error(error);
  console.log('\n' + '═'.repeat(60) + '\n');
  process.exit(1);
}
