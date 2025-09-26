/*
 * ============================================================================
 * K6 FOUNDATIONS: CHECKS WITH THRESHOLDS - BUSINESS LOGIC QUALITY GATES
 * ============================================================================
 * 
 * 🎯 LEARNING GOAL: Master k6 checks combined with thresholds to create comprehensive
 *    quality gates that validate both performance AND business logic correctness.
 * 
 * 📋 WHAT'S NEW IN THIS SCRIPT (vs 05.thresholds.js):
 *    • ⭐ NEW: Checks threshold - validates business logic success rate
 *    • ⭐ NEW: Multi-layered quality gates (HTTP + Performance + Business Logic)
 *    • ⭐ NEW: Functional correctness validation beyond HTTP status codes
 *    • Understanding the difference between HTTP success and business success
 *    • Creating robust quality gates for CI/CD pipelines
 * 
 * 🏃‍♂️ HOW TO RUN THIS TEST:
 *    cd k6/foundations
 *    k6 run 06.checks-with-thresholds.js
 * 
 *    # With QuickPizza running elsewhere:
 *    k6 run -e BASE_URL=https://quickpizza.grafana.com 06.checks-with-thresholds.js
 * 
 *    # With dashboard for real-time monitoring:
 *    K6_WEB_DASHBOARD=true k6 run --linger 06.checks-with-thresholds.js
 * 
 * ⏱️ EXPECTED TEST EXECUTION:
 *    • Duration: 20 seconds total (5s ramp-up + 10s sustained + 5s ramp-down)
 *    • Virtual Users: 5 concurrent users maximum
 *    • Load Pattern: Gradual ramp-up to steady state, then graceful shutdown
 *    • Total Requests: ~50 HTTP requests (5 VUs × 10 seconds ÷ 1s sleep)
 *    • Request Rate: ~5 requests/second during sustained phase
 * 
 * 📊 KEY METRICS TO MONITOR:
 * 
 *    BUILT-IN METRICS (inherited from previous test):
 *    • http_req_failed: < 1% (Infrastructure reliability gate)
 *    • http_req_duration p95: < 500ms (User experience gate)
 *    • http_req_duration p99: < 1000ms (Worst-case performance gate)
 * 
 *    ⭐ NEW METRIC - BUSINESS LOGIC VALIDATION:
 *    • checks: > 95% (Business logic correctness gate)
 *      → Ensures 95% of all check() assertions pass
 *      → Validates functional correctness beyond HTTP success
 *      → Catches application bugs that HTTP metrics miss
 * 
 *    CUSTOM METRICS (inherited from previous test):
 *    • quickpizza_number_of_pizzas: Counter tracking total pizzas created
 *    • quickpizza_ingredients: Average < 8 ingredients per pizza
 * 
 * 🎛️ DASHBOARD ANALYSIS GUIDE:
 * 
 *    OVERVIEW TAB - Multi-Layered Quality Gate Monitoring:
 *    ✅ Green: HTTP Request Failed Rate stays below 1% (Infrastructure OK)
 *    ✅ Green: P95 Response Time stays below 500ms (Performance OK)
 *    ✅ Green: P99 Response Time stays below 1000ms (Worst-case OK)
 *    ⭐ NEW: ✅ Green: Check success rate stays above 95% (Business Logic OK)
 *    ⚠️  Warning: Any metric approaching threshold limits
 *    ❌ Critical: Any threshold violation = FAILED test
 * 
 *    SUMMARY TAB - ⭐ NEW Checks Metric:
 *    Look for: checks.........................: 96.23% ✓ 187 ✗ 7
 *    • 96.23%: Percentage of successful check assertions
 *    • ✓ 187: Number of passed checks
 *    • ✗ 7: Number of failed checks
 *    • Threshold: PASS (96.23% > 95% required)
 * 
 * 🔍 HTTP SUCCESS vs BUSINESS SUCCESS - Critical Understanding:
 * 
 *    SCENARIO 1 - HTTP Success, Business Failure:
 *    • Server returns HTTP 200 ✅
 *    • Response contains invalid pizza data ❌
 *    • Without checks threshold: Test PASSES (misleading!)
 *    • With checks threshold: Test FAILS (correct!)
 * 
 *    SCENARIO 2 - Both HTTP and Business Success:
 *    • Server returns HTTP 200 ✅
 *    • Response contains valid pizza data ✅
 *    • Result: Test PASSES (confident deployment!)
 * 
 *    SCENARIO 3 - HTTP Failure:
 *    • Server returns HTTP 500 ❌
 *    • No response data to validate ❌
 *    • Result: Test FAILS on HTTP threshold (infrastructure issue)
 * 
 * 🚨 QUALITY GATE LAYERS EXPLAINED:
 * 
 *    LAYER 1 - Infrastructure Reliability:
 *    http_req_failed: ['rate<0.01'] = 99% HTTP success required
 *    → Ensures network, DNS, server availability
 * 
 *    LAYER 2 - Performance Requirements:
 *    http_req_duration: ['p(95)<500', 'p(99)<1000']
 *    → Ensures acceptable response times for user experience
 * 
 *    ⭐ LAYER 3 - Business Logic Correctness (NEW):
 *    checks: ["rate > 0.95"] = 95% check assertions must pass
 *    → Ensures application returns correct, valid data
 *    → Validates pizza creation logic works properly
 *    → Catches data corruption, API contract violations
 * 
 *    LAYER 4 - Application-Specific Metrics:
 *    quickpizza_ingredients: [{ threshold: 'avg<8', abortOnFail: false }]
 *    → Ensures business rules are followed (pizza complexity)
 * 
 * 🔍 WHAT TO WATCH DURING EXECUTION:
 *    1. Console output showing pizza names and ingredient counts
 *    2. ⭐ NEW: Check assertions passing/failing in real-time
 *    3. All threshold indicators in dashboard (4 layers of validation)
 *    4. Final test result: PASSED only if ALL layers pass
 *    5. Summary tab showing detailed check statistics
 * 
 * 🎯 BUSINESS LOGIC VALIDATION BENEFITS:
 *    • Catches application bugs that HTTP metrics miss
 *    • Provides confidence in functional correctness
 *    • Enables safe automated deployments
 *    • Validates API contract compliance
 *    • Ensures end-to-end system correctness
 * 
 * 💡 PRO TIPS:
 *    • 95% check threshold allows for some flakiness (realistic)
 *    • 100% check threshold is too strict for production systems
 *    • Use descriptive check names for easy debugging
 *    • Combine multiple validation layers for comprehensive quality gates
 *    • Monitor check failure patterns to identify systemic issues
 * 
 * 📝 IMPORTANT NOTE - CHECKS vs THRESHOLDS:
 *    CHECKS = Individual test assertions (what you validate)
 *    Example: check(res, { "status is 200": (res) => res.status === 200 })
 *    
 *    THRESHOLDS = Pass/fail rules on metrics (quality gates for entire test)
 *    Example: checks: ["rate > 0.95"] = 95% of all check assertions must pass
 *    
 *    In this test: You have 1 check per request, so the threshold means
 *    "95% of status code checks must be 200" for the test to PASS.
 * 
 * ============================================================================
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Counter } from "k6/metrics";

// Base URL configuration - supports local and remote QuickPizza instances
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3333';

// Test configuration with multi-layered quality gates
export const options = {
  // Load pattern: Gradual ramp-up for consistent threshold evaluation
  stages: [
    { duration: '5s', target: 5 },   // Ramp-up: 0 → 5 VUs over 5 seconds
    { duration: '10s', target: 5 },  // Sustain: 5 VUs for 10 seconds (main test phase)
    { duration: '5s', target: 0 },   // Ramp-down: 5 → 0 VUs over 5 seconds
  ],

  // MULTI-LAYERED QUALITY GATES: Comprehensive pass/fail criteria
  thresholds: {
    // LAYER 1: Infrastructure Reliability (inherited from previous test)
    // System must maintain 99% HTTP success rate
    http_req_failed: ['rate<0.01'],

    // LAYER 2: Performance Requirements (inherited from previous test)
    // Response time requirements for different user percentiles
    http_req_duration: ['p(95)<500', 'p(99)<1000'],

    // LAYER 4: Application-Specific Metrics (inherited from previous test)
    // Average ingredients per pizza should be reasonable
    quickpizza_ingredients: [{ threshold: 'avg<8', abortOnFail: false }],

    // ⭐ LAYER 3: Business Logic Correctness (NEW!)
    // 95% of all check() assertions must pass for test to succeed
    // This validates functional correctness beyond HTTP success
    checks: ["rate > 0.95"]
  },
};

// CUSTOM METRICS: Application-specific measurements beyond standard HTTP metrics
// Counter: Tracks cumulative count of pizzas created during the test
const pizzas = new Counter('quickpizza_number_of_pizzas');

// Trend: Tracks distribution of ingredients per pizza (min, max, avg, percentiles)
const ingredients = new Trend('quickpizza_ingredients');

// SETUP PHASE: Pre-test validation to ensure QuickPizza is available
export function setup() {
  console.log('🔧 Setup: Verifying QuickPizza availability...');
  let res = http.get(BASE_URL)
  if (res.status !== 200) {
    throw new Error(`❌ Setup failed: Got unexpected status code ${res.status} when trying to setup. Exiting.`)
  }
  console.log('✅ Setup: QuickPizza is available and responding');
}

// MAIN TEST FUNCTION: Executed by each virtual user in each iteration
export default function () {
  // Pizza customization parameters - realistic user preferences
  let restrictions = {
    maxCaloriesPerSlice: 500,           // Health-conscious choice
    mustBeVegetarian: false,            // Allow all ingredients
    excludedIngredients: ["pepperoni"], // Personal preference exclusion
    excludedTools: ["knife"],           // Kitchen tool limitation
    maxNumberOfToppings: 6,             // Reasonable complexity limit
    minNumberOfToppings: 2              // Minimum for interesting pizza
  }

  // API call to generate custom pizza based on restrictions
  let res = http.post(`${BASE_URL}/api/pizza`, JSON.stringify(restrictions), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'token abcdef0123456789', // Demo authentication
    },
  });

  // ⭐ BUSINESS LOGIC VALIDATION: This check contributes to the checks threshold!
  // Unlike previous tests, this check result directly affects test pass/fail
  // If this check fails frequently (>5%), the entire test will FAIL due to checks threshold
  check(res, {
    "✅ Pizza creation successful": (res) => res.status === 200
  });

  // Extract pizza data for logging and custom metrics
  const pizzaData = res.json().pizza;
  const ingredientCount = pizzaData.ingredients.length;

  // Log pizza details for test visibility and debugging
  console.log(`🍕 Created: ${pizzaData.name} (${ingredientCount} ingredients)`);

  // UPDATE CUSTOM METRICS: Track business-specific measurements
  pizzas.add(1);                    // Increment pizza counter
  ingredients.add(ingredientCount); // Record ingredient count for trend analysis

  // Simulate user think time between requests (1 second pause)
  sleep(1);
}

// TEARDOWN PHASE: Post-test cleanup and reporting
export function teardown() {
  console.log('🏁 Test completed! Check threshold results above.');
  console.log('📊 Key insight: This test validates BOTH performance AND business logic correctness.');
  console.log('⭐ NEW: Notice the "checks" metric in the summary - this is your business logic quality gate!');
  console.log('💡 Tip: A failed checks threshold means your application logic has issues, even if HTTP performance is good.');
  // TODO: Send notification to Slack about test results including checks threshold status
}
