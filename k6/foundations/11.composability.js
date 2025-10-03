/*
 * ============================================================================
 * K6 FOUNDATIONS: COMPOSABILITY - HYBRID API + BROWSER TESTING
 * ============================================================================
 * 
 * 🎯 LEARNING GOAL: Master k6 composability by combining multiple testing
 *    approaches in a single test execution - API testing, browser testing,
 *    data-driven scenarios, and multi-phase load patterns working together.
 * 
 * 📋 WHAT'S NEW IN THIS SCRIPT (vs 09.data.js):
 *    • ⭐ NEW: Browser Testing - Real browser automation with Chromium
 *    • ⭐ NEW: Hybrid Testing - API + Browser scenarios running simultaneously
 *    • ⭐ NEW: Multi-Protocol Testing - HTTP API calls + Browser interactions
 *    • ⭐ NEW: Frontend Validation - UI testing alongside backend performance
 *    • ⭐ NEW: Screenshot Capture - Visual evidence of browser interactions
 *    • ⭐ NEW: Composability Pattern - Multiple k6 features working together
 * 
 * 🚀 QUICK START (Just want to run it?):
 *    cd k6/foundations
 *    k6 run 11.composability.js
 *    
 *    Watch for: API requests + Browser actions + Screenshot creation!
 * 
 * 🏃‍♂️ ADVANCED USAGE:
 *    # With QuickPizza running elsewhere:
 *    k6 run -e BASE_URL=https://quickpizza.grafana.com 11.composability.js
 * 
 *    # With dashboard for hybrid testing monitoring:
 *    K6_WEB_DASHBOARD=true k6 run --linger 11.composability.js
 * 
 * ⏱️ EXPECTED TEST EXECUTION - HYBRID MULTI-PROTOCOL TESTING:
 *    
 *    🔍 PHASE 1 - API SMOKE TEST (0s - 10s):
 *    • Duration: 10 seconds
 *    • Protocol: HTTP API calls
 *    • Virtual Users: 1 constant user
 *    • Data Usage: Random token selection from 6 available tokens
 *    • Purpose: Validate backend API functionality with authentication variety
 *    • Total Requests: ~10 HTTP requests (1 VU × 10 seconds ÷ 1s sleep)
 * 
 *    🌎 PHASE 2 - BROWSER FRONTEND TEST (0s - 15s):
 *    • Duration: 15 seconds (runs in parallel with API tests!)
 *    • Protocol: Browser automation (Chromium)
 *    • Virtual Users: 1 browser user
 *    • Actions: Page load → Header validation → Button click → Screenshot
 *    • Purpose: Validate frontend functionality and user experience
 *    • Total Interactions: ~15 browser sessions (1 VU × 15 seconds)
 * 
 *    ⚡ PHASE 3 - API STRESS TEST (10s - 30s):
 *    • Duration: 20 seconds (starts after smoke test completes)
 *    • Protocol: HTTP API calls
 *    • Virtual Users: 0 → 5 → 5 → 0 (ramping pattern)
 *    • Data Usage: Multiple VUs with independent token selection
 *    • Purpose: Backend performance validation under load
 *    • Total Requests: ~50 HTTP requests (5 VUs × 10 seconds ÷ 1s sleep)
 * 
 *    📊 TOTAL TEST EXECUTION:
 *    • Total Duration: 30 seconds (overlapping scenarios)
 *    • API Requests: ~60 HTTP requests (smoke + stress)
 *    • Browser Sessions: ~15 browser interactions
 *    • Protocols: HTTP API + Browser automation
 *    • Data Variety: 6 different authentication tokens + UI validation
 * 
 * 📊 KEY METRICS TO MONITOR:
 * 
 *    BUILT-IN METRICS (multi-protocol validation):
 *    • http_req_failed: < 1% (API reliability across all scenarios)
 *    • http_req_duration p95: < 500ms (API performance under load)
 *    • http_req_duration p99: < 1000ms (API worst-case performance)
 *    • checks: > 95% (Combined API + Browser validation success)
 * 
 *    CUSTOM METRICS (application-specific validation):
 *    • quickpizza_number_of_pizzas: Counter tracking API-generated pizzas
 *    • quickpizza_ingredients: Average < 8 ingredients per API-created pizza
 * 
 *    ⭐ HYBRID TESTING SPECIFIC OBSERVATIONS:
 *    • API metrics: Standard HTTP performance and reliability metrics
 *    • Browser metrics: Page load times, UI interaction success rates
 *    • Screenshot evidence: Visual proof of successful browser interactions
 *    • Cross-protocol validation: API backend + Browser frontend working together
 * 
 * 🎛️ DASHBOARD ANALYSIS GUIDE - HYBRID TESTING MONITORING:
 * 
 *    OVERVIEW TAB - Multi-Protocol Performance:
 *    ⏰ 0s-10s: API smoke test + Browser testing running in parallel
 *    ⏰ 0s-15s: Browser scenario continues (UI validation)
 *    ⏰ 10s-15s: API stress test begins while browser test completes
 *    ⏰ 15s-30s: API stress test continues (backend performance focus)
 *    
 *    Key indicators for hybrid testing:
 *    ✅ Green: Both API and browser scenarios succeed
 *    ✅ Green: Consistent API performance during browser testing
 *    ✅ Green: Browser interactions complete successfully
 *    ⚠️  Warning: API performance degrades during browser testing (resource contention)
 *    ⚠️  Warning: Browser tests fail while API tests succeed (frontend issues)
 *    ❌ Critical: Both API and browser scenarios failing (system-wide problems)
 * 
 *    TIMINGS TAB - Protocol-Specific Analysis:
 *    • HTTP metrics: Standard API request timing analysis
 *    • Browser metrics: Page load times, interaction delays
 *    • Resource contention: Impact of browser testing on API performance
 *    • Cross-protocol timing: Correlation between API and browser performance
 * 
 *    SUMMARY TAB - Hybrid Results Assessment:
 *    • Combined checks: Success rate across both API and browser scenarios
 *    • Protocol separation: Distinguish API metrics from browser metrics
 *    • Resource usage: Memory and CPU impact of hybrid testing
 *    • Scenario completion: All three scenarios should complete successfully
 * 
 * 🔍 COMPOSABILITY & HYBRID TESTING DEEP DIVE:
 * 
 *    https://grafana.com/docs/k6/latest/using-k6/scenarios/
 *    ⭐ COMPOSABILITY BENEFITS:
 *    • Comprehensive Testing: API backend + Browser frontend in one execution
 *    • Realistic Scenarios: How real users interact with complete systems
 *    • Efficient Execution: Multiple test types without separate test runs
 *    • Correlated Results: See how frontend and backend performance relate
 * 
 *    ⭐ HYBRID TESTING PATTERNS:
 *    • Parallel Execution: Browser and API tests run simultaneously
 *    • Protocol Diversity: HTTP APIs + Browser automation + Data-driven
 *    • Scenario Orchestration: Different start times and durations
 *    • Resource Management: Browser tests are more resource-intensive
 * 
 *    ⭐ BROWSER TESTING INTEGRATION:
 *    • Real Browser: Chromium engine for authentic user experience
 *    • UI Validation: Header text, button clicks, content verification
 *    • Visual Evidence: Screenshots for test result documentation
 *    • Frontend Performance: Page load times and interaction responsiveness
 * 
 * 🚨 QUALITY GATES - HYBRID VALIDATION:
 *    • API Reliability: < 1% failures across all API scenarios
 *    • API Performance: p95 < 500ms even during browser testing
 *    • Browser Success: All UI interactions complete successfully
 *    • Cross-Protocol: Both frontend and backend function correctly
 *    • Resource Efficiency: System handles hybrid load without degradation
 * 
 * 🔍 WHAT TO WATCH DURING EXECUTION:
 *    1. ⏰ 0s: Both API smoke and browser tests start simultaneously
 *    2. ⏰ 0s-10s: API requests + Browser page loads happening in parallel
 *    3. ⏰ 10s: API stress test begins, browser test continues
 *    4. ⏰ 15s: Browser test completes, API stress test continues
 *    5. ⏰ 15s-30s: Pure API stress testing (no browser interference)
 *    6. 📷 Screenshot: Check screenshot.png file created by browser test
 *    7. 🎯 End: Summary shows metrics from all three scenarios
 * 
 * 🎯 COMPOSABILITY TESTING BENEFITS:
 *    • Complete System Validation: Tests entire user journey (API + UI)
 *    • Realistic Load Simulation: How systems perform with mixed workloads
 *    • Efficient Test Execution: Multiple test types in single run
 *    • Correlated Analysis: Understand frontend/backend performance relationships
 *    • Comprehensive Coverage: API functionality + UI usability + Performance
 * 
 * 💡 PRO TIPS:
 *    • Browser tests are resource-intensive - monitor system resources
 *    • Use screenshots for visual validation and debugging
 *    • Consider browser test timing to avoid resource contention
 *    • Separate API and browser metrics for clearer analysis
 *    • Scale browser scenarios carefully (they use more memory/CPU)
 * 
 * 📝 IMPORTANT NOTE - COMPOSABILITY vs SINGLE-PURPOSE TESTING:
 *    COMPOSABILITY = Multiple test types in one execution (comprehensive)
 *    Example: API + Browser + Data-driven + Multi-scenario
 *    
 *    SINGLE-PURPOSE = One test type per execution (focused)
 *    Example: Only API testing OR only browser testing
 *    
 *    Composability provides comprehensive validation but requires more resources
 * 
 * ============================================================================
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Counter } from "k6/metrics";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.2/index.js";
import { SharedArray } from "k6/data";
import { browser } from "k6/browser";

// Base URL configuration - supports local and remote QuickPizza instances
const BASE_URL = __ENV.BASE_URL || "http://localhost:3333";

// ⭐ HYBRID COMPOSABILITY TEST CONFIGURATION: API + Browser + Data-driven testing
export const options = {
  // SCENARIOS: Three different test types running with orchestrated timing
  scenarios: {
    // ⭐ SCENARIO 1: API SMOKE TEST - Data-driven backend validation
    smoke: {
      exec: "getPizza",              // API function with random token selection
      executor: "constant-vus",      // Steady load executor
      vus: 1,                        // 1 virtual user (minimal API load)
      duration: "10s",               // Run for 10 seconds
      // Starts immediately (0s) - API backend validation with token variety
      // Expected: ~10 API requests with random authentication tokens
    },

    // ⭐ SCENARIO 2: BROWSER FRONTEND TEST - UI validation in parallel
    browser: {
      exec: "checkFrontend",         // Browser function for UI testing
      executor: "constant-vus",      // Steady browser load
      vus: 1,                        // 1 browser user (resource-intensive)
      duration: "15s",               // Run for 15 seconds
      options: {
        browser: {
          type: "chromium",           // ⭐ Real Chromium browser engine
          headless: false,
        },
      },
      // Starts immediately (0s) - Runs in PARALLEL with API smoke test!
      // Expected: ~15 browser interactions with screenshot capture
    },

    // ⭐ SCENARIO 3: API STRESS TEST - Performance validation under load
    stress: {
      exec: "getPizza",              // Same API function as smoke test
      executor: "ramping-vus",       // Variable load executor with stages
      stages: [                      // Load pattern for API stress testing
        { duration: "5s", target: 5 },   // Ramp-up: 0 → 5 VUs over 5 seconds
        { duration: "10s", target: 5 },  // Sustain: 5 VUs for 10 seconds
        { duration: "5s", target: 0 },   // Ramp-down: 5 → 0 VUs over 5 seconds
      ],
      startTime: "10s",             // ⭐ Delayed start: begins after smoke test
      // Starts at 10s - API performance testing while browser test completes
      // Expected: ~50 API requests with statistical token distribution
    },
  },

  // QUALITY GATES: Hybrid testing validation across all protocols and scenarios
  thresholds: {
    // API infrastructure reliability across all API scenarios (smoke + stress)
    http_req_failed: ["rate<0.01"],

    // API performance requirements during hybrid testing (API + Browser)
    http_req_duration: ["p(95)<500", "p(99)<1000"],

    // Application-specific API metrics across all token variations
    quickpizza_ingredients: [{ threshold: "avg<8", abortOnFail: false }],

    // Combined validation: API checks + Browser checks must both succeed
    checks: ["rate > 0.95"],
    // This threshold covers:
    // • API response validation (getPizza function)
    // • Browser UI validation (checkFrontend function)
    // • Cross-protocol success rate
  },
};

// CUSTOM METRICS: Application-specific measurements for hybrid testing
// These metrics track API performance during multi-protocol testing
const pizzas = new Counter("quickpizza_number_of_pizzas");
// Counter: Accumulates total pizzas created via API calls across smoke + stress scenarios
// Expected: ~60 pizzas (API scenarios only - browser scenario doesn't create pizzas)

const ingredients = new Trend("quickpizza_ingredients");
// Trend: Tracks ingredient count distribution across all API-generated pizzas
// Threshold: Average < 8 ingredients (validates API complexity during hybrid testing)

// ⭐ SHARED ARRAY: Memory-efficient data sharing for API authentication
// Used by API scenarios (smoke + stress) but not browser scenario
const tokens = new SharedArray("all tokens", function () {
  return JSON.parse(open("./data/tokens.json")).tokens;
});
// 📊 HYBRID TESTING DATA USAGE:
// • API Scenarios: Use random token selection for authentication variety
// • Browser Scenario: Uses direct page access (no API authentication needed)
// • Memory Efficiency: Shared across all API VUs regardless of scenario count
// • Cross-Protocol: Demonstrates data sharing in complex test compositions

// SETUP PHASE: Pre-test validation executed once before hybrid scenarios
export function setup() {
  console.log('🔧 Setup: Verifying QuickPizza availability before hybrid testing...');
  console.log('🔍 Hybrid Strategy: API testing + Browser testing + Data-driven authentication');
  console.log(`📊 Data Info: Loaded ${tokens.length} authentication tokens for API scenarios`);
  console.log('🌎 Browser Info: Chromium browser will be used for frontend validation');

  let res = http.get(BASE_URL);
  if (res.status !== 200) {
    throw new Error(
      `❌ Setup failed: Got unexpected status code ${res.status} when trying to setup. Exiting.`
    );
  }
  console.log('✅ Setup: QuickPizza is available for both API and browser testing.');
  console.log('🏃‍♂️ Execution Plan: Smoke API (0s) + Browser UI (0s) + Stress API (10s)');
  console.log('👀 Watch For: API requests + Browser actions + Screenshot creation!');
}

// ⭐ API TEST FUNCTION: Executed by both smoke and stress scenarios in hybrid testing
// This function handles the API portion of our composability demonstration
export function getPizza() {
  // Pizza customization parameters - consistent API payload across scenarios
  let restrictions = {
    maxCaloriesPerSlice: 500,           // Health-conscious choice (API business logic)
    mustBeVegetarian: false,            // Allow all ingredients (API flexibility)
    excludedIngredients: ["pepperoni"], // Personal preference (API filtering)
    excludedTools: ["knife"],           // Kitchen constraint (API validation)
    maxNumberOfToppings: 6,             // Complexity limit (API performance consideration)
    minNumberOfToppings: 2,             // Quality standard (API business rule)
  };

  // ⭐ DATA-DRIVEN API AUTHENTICATION: Random token selection for realistic user simulation
  const selectedToken = tokens[Math.floor(Math.random() * tokens.length)];
  // This simulates different users accessing the API during hybrid testing

  // ⭐ API CALL: Backend pizza generation during hybrid test execution
  // This runs in parallel with browser testing, demonstrating system capacity
  let res = http.post(`${BASE_URL}/api/pizza`, JSON.stringify(restrictions), {
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Token " + selectedToken,  // Dynamic authentication
    },
  });

  // API VALIDATION: Contributes to hybrid checks threshold
  // Success here validates backend API reliability during multi-protocol testing
  check(res, {
    "✅ API: Pizza creation successful": (res) => res.status === 200
  });

  // Extract API response data for logging and metrics
  const pizzaData = res.json().pizza;
  const ingredientCount = pizzaData.ingredients.length;

  // 📝 API LOGGING: Shows API activity during hybrid testing
  console.log(
    `🍕 [API-${selectedToken.substring(0, 6)}] ${pizzaData.name} (${ingredientCount} ingredients)`
  );
  // Format: [API-QivfLr] Margherita Supreme (5 ingredients)
  // Distinguishes API logs from browser logs in hybrid output

  // ⭐ UPDATE API METRICS: Track backend performance during hybrid testing
  pizzas.add(1);                    // Increment API pizza counter
  ingredients.add(ingredientCount); // Record API ingredient complexity

  // Think time simulation - consistent across both API scenarios
  sleep(1);
}

// ⭐ BROWSER TEST FUNCTION: Frontend validation running in parallel with API testing
// This function demonstrates real browser automation as part of hybrid testing
export async function checkFrontend() {
  let checkData;

  // ⭐ BROWSER INITIALIZATION: Create new Chromium page for UI testing
  const page = await browser.newPage();
  console.log('🌎 [BROWSER] Starting frontend validation...');

  try {
    // ⭐ PAGE NAVIGATION: Load QuickPizza homepage
    // This tests frontend availability while API tests run in parallel
    await page.goto(BASE_URL);
    console.log('🌎 [BROWSER] Page loaded successfully');

    // ⭐ UI ELEMENT VALIDATION: Verify homepage header content
    checkData = await page.locator("h1").textContent();
    check(page, {
      "✅ BROWSER: Homepage header correct": checkData == "Looking to break out of your pizza routine?",
    });
    console.log(`🌎 [BROWSER] Header validation: "${checkData}"`);

    // ⭐ USER INTERACTION: Click the main call-to-action button
    // This simulates real user behavior during performance testing
    await page.locator('//button[. = "Pizza, Please!"]').click();
    console.log('🌎 [BROWSER] Button clicked - generating pizza recommendation');

    // Wait for dynamic content to load (simulates real user patience)
    await page.waitForTimeout(500);

    // ⭐ VISUAL EVIDENCE: Capture screenshot for test documentation
    // This provides visual proof of successful browser interactions
    await page.screenshot({ path: "screenshot.png" });
    console.log('📷 [BROWSER] Screenshot captured: screenshot.png');

    // ⭐ DYNAMIC CONTENT VALIDATION: Verify pizza recommendations appeared
    checkData = await page.locator("div#recommendations").textContent();
    check(page, {
      "✅ BROWSER: Pizza recommendations generated": checkData != "",
    });
    console.log(`🌎 [BROWSER] Recommendations validation: ${checkData ? 'Content found' : 'No content'}`);

  } catch (error) {
    console.error(`❌ [BROWSER] Error during frontend testing: ${error.message}`);
    throw error;
  } finally {
    // ⭐ CLEANUP: Always close browser page to free resources
    await page.close();
    console.log('🌎 [BROWSER] Page closed - frontend validation complete');
  }

  // 📊 BROWSER TESTING IMPACT:
  // • Validates frontend functionality while API tests run
  // • Provides visual evidence through screenshots
  // • Tests complete user journey (page load → interaction → result)
  // • Demonstrates system capacity under mixed workloads (API + Browser)
}

// TEARDOWN PHASE: Post-test reporting executed once after all hybrid scenarios
export function teardown() {
  console.log('🏁 Hybrid composability test completed!');
  console.log('🔍 Multi-Protocol Results: API testing + Browser testing + Data-driven authentication');
  console.log('');
  console.log('📊 HYBRID TESTING ANALYSIS:');
  console.log('   • API Performance: Check HTTP metrics from smoke + stress scenarios');
  console.log('   • Browser Success: Verify UI interactions and screenshot creation');
  console.log('   • Token Distribution: Review API logs for authentication variety');
  console.log('   • Resource Usage: Monitor system impact of parallel API + Browser testing');
  console.log('');
  console.log('📷 Visual Evidence: Check screenshot.png for browser interaction proof');
  console.log('📈 Performance Analysis: Compare API performance during browser vs non-browser phases');
  console.log('🎯 Next Steps: Use this composability pattern for comprehensive system validation');
  console.log('');
  console.log('💡 COMPOSABILITY INSIGHTS:');
  console.log('   • Parallel Execution: API and Browser scenarios ran simultaneously');
  console.log('   • Resource Efficiency: Single test run covered multiple protocols');
  console.log('   • Realistic Validation: How real systems handle mixed workloads');
  console.log('   • Comprehensive Coverage: Backend APIs + Frontend UI + Authentication');
  // TODO: Send notification to Slack about hybrid test results and cross-protocol performance
}

// ⭐ CUSTOM SUMMARY HANDLER: Enhanced result formatting for hybrid testing analysis
// Provides detailed metrics and exports results for multi-protocol testing evaluation
export function handleSummary(data) {
  return {
    // ⭐ DETAILED RESULTS EXPORT: JSON file with complete hybrid test data
    "summary.json": JSON.stringify(data, null, 2),
    // Contains: API metrics, browser metrics, scenario timing, resource usage
    // Use for: Cross-protocol analysis, performance correlation, resource planning

    // ⭐ ENHANCED CONSOLE OUTPUT: Formatted summary with colors and proper indentation
    stdout: textSummary(data, { indent: " ", enableColors: true }),
    // Highlights: Combined API + Browser results, threshold pass/fail, scenario completion
    // Focus on: HTTP performance, browser success rates, hybrid resource efficiency
  };
}

