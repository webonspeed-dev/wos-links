/**
 * AI Service Test Suite
 * Comprehensive tests for multi-provider AI service
 */

import {
  generateCompletion,
  generateEmbedding,
  getAIStats,
  getAvailableProviders,
  testAIProviders,
} from "../ai";
import {
  generateSlugSuggestions,
  generateSEOMetadata,
  categorizeContent,
  analyzeLinkContent,
  checkDuplicate,
} from "../ai-helpers";

// Test results storage
const testResults: any[] = [];

function log(category: string, test: string, status: "PASS" | "FAIL" | "WARN", message: string) {
  const result = { category, test, status, message, timestamp: new Date().toISOString() };
  testResults.push(result);

  const emoji = status === "PASS" ? "✅" : status === "FAIL" ? "❌" : "⚠️";
  console.log(`${emoji} [${category}] ${test}: ${message}`);
}

/**
 * Test 1: Provider Availability
 */
export async function testProviderAvailability() {
  console.log("\n🔍 Testing Provider Availability...\n");

  try {
    const available = getAvailableProviders();

    if (available.length === 0) {
      log("Provider", "Availability", "FAIL", "No providers available. Add at least one API key.");
      return false;
    }

    log("Provider", "Availability", "PASS", `${available.length} provider(s) available: ${available.join(", ")}`);

    // Test each provider
    const results = await testAIProviders();

    for (const [provider, isWorking] of Object.entries(results)) {
      if (isWorking) {
        log("Provider", provider, "PASS", "Provider is functional");
      } else if (available.includes(provider as any)) {
        log("Provider", provider, "FAIL", "Provider has API key but test failed");
      }
    }

    return true;
  } catch (error: any) {
    log("Provider", "Availability", "FAIL", error.message);
    return false;
  }
}

/**
 * Test 2: Basic Completion
 */
export async function testBasicCompletion() {
  console.log("\n🔍 Testing Basic Completion...\n");

  try {
    const response = await generateCompletion({
      messages: [
        { role: "user", content: "Say 'test successful' and nothing else." },
      ],
      maxTokens: 10,
    });

    if (!response.content) {
      log("Completion", "Basic", "FAIL", "No content in response");
      return false;
    }

    log("Completion", "Basic", "PASS", `Response: "${response.content}" (${response.provider}, ${response.latency}ms)`);
    return true;
  } catch (error: any) {
    log("Completion", "Basic", "FAIL", error.message);
    return false;
  }
}

/**
 * Test 3: Fallback Mechanism
 */
export async function testFallbackMechanism() {
  console.log("\n🔍 Testing Fallback Mechanism...\n");

  try {
    // This test is informational - we can't force a failure easily
    const available = getAvailableProviders();

    if (available.length > 1) {
      log("Fallback", "Configuration", "PASS", `Multiple providers available for fallback: ${available.join(", ")}`);
    } else if (available.length === 1) {
      log("Fallback", "Configuration", "WARN", "Only one provider available. Add more API keys for redundancy.");
    } else {
      log("Fallback", "Configuration", "FAIL", "No providers available");
      return false;
    }

    return true;
  } catch (error: any) {
    log("Fallback", "Configuration", "FAIL", error.message);
    return false;
  }
}

/**
 * Test 4: Slug Generation
 */
export async function testSlugGeneration() {
  console.log("\n🔍 Testing Slug Generation...\n");

  try {
    const slugs = await generateSlugSuggestions(
      "https://example.com/products/wireless-headphones-2024",
      "Premium Wireless Headphones",
      "High-quality audio with noise cancellation"
    );

    if (!slugs || slugs.length === 0) {
      log("Slugs", "Generation", "FAIL", "No slugs generated");
      return false;
    }

    if (slugs.length !== 3) {
      log("Slugs", "Generation", "WARN", `Expected 3 slugs, got ${slugs.length}`);
    }

    log("Slugs", "Generation", "PASS", `Generated: ${slugs.join(", ")}`);
    return true;
  } catch (error: any) {
    log("Slugs", "Generation", "FAIL", error.message);
    return false;
  }
}

/**
 * Test 5: SEO Metadata Generation
 */
export async function testSEOGeneration() {
  console.log("\n🔍 Testing SEO Metadata Generation...\n");

  try {
    const seo = await generateSEOMetadata(
      "https://example.com/blog/ai-marketing-2024",
      "AI is transforming digital marketing with personalization and automation."
    );

    if (!seo.title) {
      log("SEO", "Title", "FAIL", "No title generated");
      return false;
    }

    if (!seo.description) {
      log("SEO", "Description", "FAIL", "No description generated");
      return false;
    }

    if (!seo.keywords || seo.keywords.length === 0) {
      log("SEO", "Keywords", "WARN", "No keywords generated");
    }

    log("SEO", "Title", "PASS", seo.title);
    log("SEO", "Description", "PASS", seo.description.slice(0, 50) + "...");
    log("SEO", "Keywords", "PASS", seo.keywords.join(", "));
    return true;
  } catch (error: any) {
    log("SEO", "Generation", "FAIL", error.message);
    return false;
  }
}

/**
 * Test 6: Content Categorization
 */
export async function testCategorization() {
  console.log("\n🔍 Testing Content Categorization...\n");

  const testCases = [
    { url: "https://shop.example.com/product/123", expected: "product" },
    { url: "https://example.com/blog/post", expected: "blog" },
    { url: "https://app.example.com/dashboard", expected: "saas" },
  ];

  let passed = 0;

  for (const testCase of testCases) {
    try {
      const category = await categorizeContent(testCase.url);

      if (category === testCase.expected) {
        log("Category", testCase.url, "PASS", `Correctly categorized as "${category}"`);
        passed++;
      } else {
        log("Category", testCase.url, "WARN", `Expected "${testCase.expected}", got "${category}"`);
      }
    } catch (error: any) {
      log("Category", testCase.url, "FAIL", error.message);
    }
  }

  return passed === testCases.length;
}

/**
 * Test 7: Embeddings Generation
 */
export async function testEmbeddings() {
  console.log("\n🔍 Testing Embeddings Generation...\n");

  try {
    const response = await generateEmbedding({
      input: "This is a test sentence for embedding generation.",
    });

    if (!response.embeddings || response.embeddings.length === 0) {
      log("Embeddings", "Generation", "FAIL", "No embeddings generated");
      return false;
    }

    const embedding = response.embeddings[0];

    if (!Array.isArray(embedding)) {
      log("Embeddings", "Format", "FAIL", "Embedding is not an array");
      return false;
    }

    if (embedding.length === 0) {
      log("Embeddings", "Size", "FAIL", "Embedding array is empty");
      return false;
    }

    log("Embeddings", "Generation", "PASS", `Generated ${embedding.length}-dimensional vector`);
    log("Embeddings", "Provider", "PASS", `Provider: ${response.provider}`);
    return true;
  } catch (error: any) {
    log("Embeddings", "Generation", "FAIL", error.message);
    return false;
  }
}

/**
 * Test 8: Complete Link Analysis
 */
export async function testLinkAnalysis() {
  console.log("\n🔍 Testing Complete Link Analysis...\n");

  try {
    const analysis = await analyzeLinkContent(
      "https://example.com/products/gaming-laptop-2024",
      "High-Performance Gaming Laptop",
      "Powerful gaming laptop with RTX 4080 and latest Intel processor"
    );

    if (!analysis.slugs || analysis.slugs.length === 0) {
      log("Analysis", "Slugs", "FAIL", "No slugs in analysis");
      return false;
    }

    if (!analysis.category) {
      log("Analysis", "Category", "FAIL", "No category in analysis");
      return false;
    }

    if (!analysis.seo.title) {
      log("Analysis", "SEO", "FAIL", "No SEO metadata in analysis");
      return false;
    }

    log("Analysis", "Complete", "PASS", "All analysis components present");
    log("Analysis", "Slugs", "PASS", analysis.slugs.join(", "));
    log("Analysis", "Category", "PASS", analysis.category);
    return true;
  } catch (error: any) {
    log("Analysis", "Complete", "FAIL", error.message);
    return false;
  }
}

/**
 * Test 9: Performance Test
 */
export async function testPerformance() {
  console.log("\n🔍 Testing Performance...\n");

  try {
    const iterations = 3;
    const latencies: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = Date.now();

      await generateCompletion({
        messages: [{ role: "user", content: "Hi" }],
        maxTokens: 10,
      });

      const latency = Date.now() - start;
      latencies.push(latency);
    }

    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;

    if (avgLatency > 5000) {
      log("Performance", "Latency", "WARN", `Average latency ${avgLatency.toFixed(0)}ms (>5s)`);
    } else if (avgLatency > 3000) {
      log("Performance", "Latency", "PASS", `Average latency ${avgLatency.toFixed(0)}ms (acceptable)`);
    } else {
      log("Performance", "Latency", "PASS", `Average latency ${avgLatency.toFixed(0)}ms (good)`);
    }

    return true;
  } catch (error: any) {
    log("Performance", "Test", "FAIL", error.message);
    return false;
  }
}

/**
 * Test 10: Usage Statistics
 */
export async function testStatistics() {
  console.log("\n🔍 Testing Usage Statistics...\n");

  try {
    const stats = getAIStats();

    log("Stats", "Total Requests", "PASS", stats.totalRequests.toString());
    log("Stats", "Successful", "PASS", stats.successfulRequests.toString());
    log("Stats", "Failed", stats.failedRequests > 0 ? "WARN" : "PASS", stats.failedRequests.toString());
    log("Stats", "Fallback Used", stats.fallbackUsed > 0 ? "WARN" : "PASS", stats.fallbackUsed.toString());
    log("Stats", "Total Cost", "PASS", `$${stats.totalCost.toFixed(4)}`);

    return true;
  } catch (error: any) {
    log("Stats", "Retrieval", "FAIL", error.message);
    return false;
  }
}

/**
 * Run All Tests
 */
export async function runAllTests() {
  console.log("\n" + "=".repeat(60));
  console.log("🧪 WOS LINKS AI SERVICE TEST SUITE");
  console.log("=".repeat(60));

  const tests = [
    { name: "Provider Availability", fn: testProviderAvailability },
    { name: "Basic Completion", fn: testBasicCompletion },
    { name: "Fallback Mechanism", fn: testFallbackMechanism },
    { name: "Slug Generation", fn: testSlugGeneration },
    { name: "SEO Generation", fn: testSEOGeneration },
    { name: "Categorization", fn: testCategorization },
    { name: "Embeddings", fn: testEmbeddings },
    { name: "Link Analysis", fn: testLinkAnalysis },
    { name: "Performance", fn: testPerformance },
    { name: "Statistics", fn: testStatistics },
  ];

  const results = {
    total: tests.length,
    passed: 0,
    failed: 0,
    warnings: 0,
  };

  for (const test of tests) {
    try {
      const passed = await test.fn();
      if (passed) results.passed++;
      else results.failed++;
    } catch (error) {
      results.failed++;
      console.error(`❌ Test "${test.name}" threw an error:`, error);
    }
  }

  // Count warnings
  results.warnings = testResults.filter((r) => r.status === "WARN").length;

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);
  console.log("=".repeat(60) + "\n");

  return {
    results,
    details: testResults,
  };
}

// Export test results
export { testResults };
