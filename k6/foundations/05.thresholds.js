/*
 * ============================================================================
 * K6 FOUNDATIONS: PERFORMANCE THRESHOLDS AND QUALITY GATES
 * ============================================================================
 * 
 * 🎯 LEARNING GOAL: Master k6 thresholds as automated quality gates that define
 *    acceptable performance criteria and automatically fail tests when violated.
 * 
 * 📋 WHAT THIS SCRIPT TEACHES:
 *    • Setting up performance thresholds as quality gates
 *    • Using built-in metrics (http_req_failed, http_req_duration) for SLA enforcement
 *    • Creating custom metrics (Counter, Trend) with specific thresholds
 *    • Understanding pass/fail criteria for automated performance testing
 *    • Configuring threshold behaviors (abortOnFail vs continue)
 * 
 * 🏃‍♂️ HOW TO RUN THIS TEST:
 *    cd k6/foundations
 *    k6 run 05.thresholds.js
 * 
 *    # With QuickPizza running elsewhere:
 *    k6 run -e BASE_URL=https://quickpizza.grafana.com 05.thresholds.js
 * 
 *    # With dashboard for real-time monitoring:
 *    K6_WEB_DASHBOARD=true k6 run --linger 05.thresholds.js
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
 *    BUILT-IN METRICS (with thresholds):
 *    • http_req_failed: < 1% (Quality Gate: 99% success rate required)
 *    • http_req_duration p95: < 500ms (Quality Gate: 95% of users get sub-500ms response)
 *    • http_req_duration p99: < 1000ms (Quality Gate: 99% of users get sub-1s response)
 * 
 *    CUSTOM METRICS (with thresholds):
 *    • quickpizza_number_of_pizzas: Counter tracking total pizzas created
 *    • quickpizza_ingredients: Average < 8 ingredients per pizza (Quality Gate)
 * 
 * 🎛️ DASHBOARD ANALYSIS GUIDE:
 * 
 *    OVERVIEW TAB - Watch for Quality Gate Violations:
 *    ✅ Green: HTTP Request Failed Rate stays below 1%
 *    ✅ Green: P95 Response Time stays below 500ms
 *    ✅ Green: P99 Response Time stays below 1000ms
 *    ⚠️  Warning: Any metric approaching threshold limits
 *    ❌ Critical: Threshold violations (test will show FAILED status)
 * 
 *    TIMINGS TAB - Detailed Performance Breakdown:
 *    • Request Duration: Should consistently stay under p95/p99 thresholds
 *    • Request Waiting (TTFB): Server processing time for pizza generation
 *    • Request Failed Rate: Must stay below 1% threshold
 * 
 *    SUMMARY TAB - Final Quality Gate Results:
 *    • http_req_duration: Check p95 < 500ms, p99 < 1000ms
 *    • http_req_failed: Must show < 1% failure rate
 *    • Custom metrics: quickpizza_ingredients average < 8
 *    • Overall test result: PASS/FAIL based on all thresholds
 * 
 * 🚨 PERFORMANCE THRESHOLDS EXPLAINED:
 * 
 *    RELIABILITY THRESHOLD:
 *    http_req_failed: ['rate<0.01'] = Less than 1% of requests can fail
 *    → This ensures 99% success rate for system reliability
 * 
 *    USER EXPERIENCE THRESHOLDS:
 *    http_req_duration: ['p(95)<500', 'p(99)<1000']
 *    → p95 < 500ms: 95% of users get responses in under 500ms (good UX)
 *    → p99 < 1000ms: 99% of users get responses in under 1s (acceptable worst-case)
 * 
 *    BUSINESS LOGIC THRESHOLD:
 *    quickpizza_ingredients: [{ threshold: 'avg<8', abortOnFail: false }]
 *    → Average pizza complexity should be reasonable (< 8 ingredients)
 *    → abortOnFail: false = Continue test even if this threshold fails
 * 
 * 🔍 WHAT TO WATCH DURING EXECUTION:
 *    1. Threshold status in real-time (dashboard shows green/red indicators)
 *    2. Console output showing pizza names and ingredient counts
 *    3. Response times staying within acceptable ranges
 *    4. Zero or minimal error rates
 *    5. Final test result: PASSED or FAILED based on threshold compliance
 * 
 * 🎯 PERFORMANCE IMPLICATIONS:
 *    • Thresholds act as automated quality gates for CI/CD pipelines
 *    • Failed thresholds = failed test = blocked deployment
 *    • Helps maintain performance standards across releases
 *    • Provides objective pass/fail criteria for performance testing
 * 
 * 💡 PRO TIPS:
 *    • Set realistic thresholds based on actual user expectations
 *    • Use abortOnFail: true for critical thresholds to stop tests early
 *    • Monitor threshold trends over time to catch performance degradation
 *    • Combine multiple threshold types for comprehensive quality gates
 * 
 * ============================================================================
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Counter } from "k6/metrics";

// Base URL configuration - supports local and remote QuickPizza instances
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3333';

// Test configuration with performance thresholds as quality gates
export const options = {
  // Load pattern: Gradual ramp-up to steady state for consistent threshold evaluation
  stages: [
    { duration: '5s', target: 5 },   // Ramp-up: 0 → 5 VUs over 5 seconds
    { duration: '10s', target: 5 },  // Sustain: 5 VUs for 10 seconds (main test phase)
    { duration: '5s', target: 0 },   // Ramp-down: 5 → 0 VUs over 5 seconds
  ],

  // PERFORMANCE THRESHOLDS: Automated quality gates that define pass/fail criteria
  thresholds: {
    // RELIABILITY THRESHOLD: System must maintain 99% success rate
    // If more than 1% of requests fail, the entire test fails
    http_req_failed: ['rate<0.01'],

    // USER EXPERIENCE THRESHOLDS: Response time requirements for different user percentiles
    // p95 < 500ms: 95% of users must get responses within 500ms (good user experience)
    // p99 < 1000ms: 99% of users must get responses within 1 second (acceptable worst-case)
    http_req_duration: ['p(95)<500', 'p(99)<1000'],

    // BUSINESS LOGIC THRESHOLD: Custom metric for pizza complexity
    // Average ingredients per pizza should be reasonable (< 8 ingredients)
    // abortOnFail: false = Continue test even if this specific threshold fails
    quickpizza_ingredients: [{ threshold: 'avg<8', abortOnFail: false }],
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

  // VALIDATION: Ensure the API call succeeded (contributes to http_req_failed threshold)
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
  console.log('📊 Tip: Review the Summary tab for final threshold compliance.');
  // TODO: Send notification to Slack about test results
}
