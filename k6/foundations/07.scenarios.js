/*
 * ============================================================================
 * K6 FOUNDATIONS: SCENARIOS - MULTI-PHASE LOAD TESTING
 * ============================================================================
 * 
 * 🎯 LEARNING GOAL: Master k6 scenarios to create sophisticated multi-phase
 *    load tests that combine different testing strategies in a single execution.
 * 
 * 📋 WHAT'S NEW IN THIS SCRIPT (vs 06.checks-with-thresholds.js):
 *    • ⭐ NEW: Scenarios - Multiple test phases with different load patterns
 *    • ⭐ NEW: Executors - Different load generation strategies (constant-vus, ramping-vus)
 *    • ⭐ NEW: startTime - Delayed execution for sequential test phases
 *    • ⭐ NEW: Named functions - Custom function names instead of default export
 *    • ⭐ NEW: handleSummary() - Custom test result formatting and export
 *    • ⭐ NEW: textSummary - External library for enhanced result presentation
 * 
 * 🏃‍♂️ HOW TO RUN THIS TEST:
 *    cd k6/foundations
 *    k6 run 07.scenarios.js
 * 
 *    # With QuickPizza running elsewhere:
 *    k6 run -e BASE_URL=https://quickpizza.grafana.com 07.scenarios.js
 * 
 *    # With dashboard for real-time monitoring:
 *    K6_WEB_DASHBOARD=true k6 run --linger 07.scenarios.js
 * 
 * ⏱️ EXPECTED TEST EXECUTION - TWO SEQUENTIAL PHASES:
 *    
 *    🔍 PHASE 1 - SMOKE TEST (0s - 10s):
 *    • Duration: 10 seconds
 *    • Virtual Users: 1 constant user
 *    • Load Pattern: Steady minimal load
 *    • Purpose: Basic functionality validation
 *    • Total Requests: ~10 HTTP requests (1 VU × 10 seconds ÷ 1s sleep)
 *    • Request Rate: ~1 request/second
 * 
 *    ⚡ PHASE 2 - STRESS TEST (10s - 30s):
 *    • Duration: 20 seconds (starts after smoke test completes)
 *    • Virtual Users: 0 → 5 → 5 → 0 (ramping pattern)
 *    • Load Pattern: Gradual ramp-up, sustain, ramp-down
 *    • Purpose: Performance validation under load
 *    • Total Requests: ~50 HTTP requests (5 VUs × 10 seconds ÷ 1s sleep)
 *    • Request Rate: ~5 requests/second during peak
 * 
 *    📊 TOTAL TEST EXECUTION:
 *    • Total Duration: 30 seconds (10s smoke + 20s stress)
 *    • Total Requests: ~60 HTTP requests combined
 *    • Peak Load: 5 concurrent users (stress phase only)
 * 
 * 📊 KEY METRICS TO MONITOR:
 * 
 *    BUILT-IN METRICS (inherited from previous tests):
 *    • http_req_failed: < 1% (Infrastructure reliability across both phases)
 *    • http_req_duration p95: < 500ms (User experience across both phases)
 *    • http_req_duration p99: < 1000ms (Worst-case performance across both phases)
 *    • checks: > 95% (Business logic correctness across both phases)
 * 
 *    CUSTOM METRICS (inherited from previous tests):
 *    • quickpizza_number_of_pizzas: Counter tracking total pizzas across both phases
 *    • quickpizza_ingredients: Average < 8 ingredients per pizza across both phases
 * 
 * 🎛️ DASHBOARD ANALYSIS GUIDE - MULTI-PHASE MONITORING:
 * 
 *    OVERVIEW TAB - Watch Phase Transitions:
 *    ⏰ 0s-10s: Low steady load (1 VU, smoke test)
 *    ⏰ 10s-15s: Load ramp-up begins (stress test starts)
 *    ⏰ 15s-25s: Peak load sustained (5 VUs, main stress phase)
 *    ⏰ 25s-30s: Load ramp-down (graceful test completion)
 *    
 *    Key indicators:
 *    ✅ Green: Consistent performance across both phases
 *    ⚠️  Warning: Performance degradation during stress phase
 *    ❌ Critical: Failures during smoke test (basic functionality broken)
 * 
 *    TIMINGS TAB - Phase-Specific Performance Analysis:
 *    • Compare response times between smoke (low load) and stress (high load) phases
 *    • Look for performance degradation as load increases
 *    • Identify if system handles load transitions gracefully
 * 
 *    ⭐ NEW: SUMMARY TAB - Combined Phase Results:
 *    • All metrics aggregate results from BOTH scenarios
 *    • Thresholds apply to combined results across all phases
 *    • Custom summary.json file generated with detailed phase breakdown
 * 
 * 🔍 SCENARIO EXECUTION PATTERNS:
 * 
 *    https://grafana.com/docs/k6/latest/using-k6/scenarios/executors/
 *    ⭐ SMOKE SCENARIO (Functional Validation):
 *    • Executor: constant-vus (steady load)
 *    • Purpose: Verify basic functionality before stress testing
 *    • Pattern: 1 VU for 10 seconds (minimal, consistent load)
 *    • Success Criteria: Zero errors, reasonable response times
 * 
 *    ⭐ STRESS SCENARIO (Performance Validation):
 *    • Executor: ramping-vus (variable load with stages)
 *    • Purpose: Validate system performance under increasing load
 *    • Pattern: Ramp up → Sustain → Ramp down
 *    • Success Criteria: Maintains performance thresholds under load
 *    • startTime: "10s" = Waits for smoke test to complete first
 * 
 * 🚨 QUALITY GATES - COMBINED VALIDATION:
 *    All thresholds apply to COMBINED results from both scenarios:
 *    • Infrastructure reliability across all phases
 *    • Performance consistency from low to high load
 *    • Business logic correctness under all conditions
 *    • Application-specific metrics across test duration
 * 
 * 🔍 WHAT TO WATCH DURING EXECUTION:
 *    1. ⏰ 0s-10s: Smoke test running (1 VU, should be error-free)
 *    2. ⏰ 10s: Stress test begins (watch for load transition)
 *    3. ⏰ 10s-15s: Load ramping up (performance should remain stable)
 *    4. ⏰ 15s-25s: Peak load (main performance validation period)
 *    5. ⏰ 25s-30s: Load ramping down (graceful completion)
 *    6. 🎯 End: Custom summary with phase breakdown and JSON export
 * 
 * 🎯 SCENARIOS BENEFITS:
 *    • Combine multiple testing strategies in one execution
 *    • Sequential validation: functionality first, then performance
 *    • Realistic load patterns that mirror production usage
 *    • Comprehensive results across different load conditions
 *    • Efficient testing workflow (no need for separate test runs)
 * 
 * 💡 PRO TIPS:
 *    • Use smoke tests to validate functionality before load testing
 *    • startTime creates sequential scenarios (smoke → stress)
 *    • Different executors enable different load patterns per scenario
 *    • handleSummary() enables custom result formatting and export
 *    • Thresholds apply to combined results from all scenarios
 * 
 * 📝 IMPORTANT NOTE - SCENARIOS vs STAGES:
 *    SCENARIOS = Multiple independent test phases with different strategies
 *    Example: Smoke test (constant load) + Stress test (ramping load)
 *    
 *    STAGES = Load pattern within a single test execution
 *    Example: Ramp-up → Sustain → Ramp-down within one scenario
 *    
 *    This test combines BOTH: Multiple scenarios, each with their own stages/patterns
 * 
 * ============================================================================
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Counter } from "k6/metrics";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.2/index.js";

// Base URL configuration - supports local and remote QuickPizza instances
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3333';

// ⭐ MULTI-SCENARIO TEST CONFIGURATION: Two sequential test phases
export const options = {
  // SCENARIOS: Different testing strategies executed in sequence
  scenarios: {
    // ⭐ SCENARIO 1: SMOKE TEST - Basic functionality validation
    smoke: {
      exec: "getPizza",              // Function to execute (custom named function)
      executor: "constant-vus",      // Steady load executor
      vus: 1,                        // 1 virtual user (minimal load)
      duration: "10s",               // Run for 10 seconds
    },

    // ⭐ SCENARIO 2: STRESS TEST - Performance validation under load
    stress: {
      exec: "getPizza",              // Same function as smoke test
      executor: "ramping-vus",       // Variable load executor with stages
      stages: [                      // Load pattern for stress test
        { duration: '5s', target: 5 },   // Ramp-up: 0 → 5 VUs over 5 seconds
        { duration: '10s', target: 5 },  // Sustain: 5 VUs for 10 seconds
        { duration: '5s', target: 0 },   // Ramp-down: 5 → 0 VUs over 5 seconds
      ],
      startTime: "10s",             // ⭐ NEW: Wait 10s (after smoke test completes)
    },
  },

  // QUALITY GATES: Apply to COMBINED results from both scenarios
  thresholds: {
    // Infrastructure reliability across all scenarios
    http_req_failed: ['rate<0.01'],

    // Performance requirements across all scenarios  
    http_req_duration: ['p(95)<500', 'p(99)<1000'],

    // Application-specific metrics across all scenarios
    quickpizza_ingredients: [{ threshold: 'avg<8', abortOnFail: false }],

    // Business logic correctness across all scenarios
    checks: ["rate > 0.95"]
  },
};

// CUSTOM METRICS: Application-specific measurements across all scenarios
// Counter: Tracks cumulative count of pizzas created across both smoke and stress phases
const pizzas = new Counter('quickpizza_number_of_pizzas');

// Trend: Tracks distribution of ingredients per pizza across both scenarios
const ingredients = new Trend('quickpizza_ingredients');

// SETUP PHASE: Pre-test validation executed once before all scenarios
export function setup() {
  console.log('🔧 Setup: Verifying QuickPizza availability before running scenarios...');
  let res = http.get(BASE_URL)
  if (res.status !== 200) {
    throw new Error(`❌ Setup failed: Got unexpected status code ${res.status} when trying to setup. Exiting.`)
  }
  console.log('✅ Setup: QuickPizza is available. Ready to run smoke → stress scenarios.');
}

// ⭐ CUSTOM NAMED FUNCTION: Executed by both smoke and stress scenarios
// This replaces the default export function, allowing scenarios to specify which function to run
export function getPizza() {
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

  // Business logic validation - contributes to checks threshold across all scenarios
  check(res, {
    "✅ Pizza creation successful": (res) => res.status === 200
  });

  // Extract pizza data for logging and custom metrics
  const pizzaData = res.json().pizza;
  const ingredientCount = pizzaData.ingredients.length;

  // Log pizza details with scenario context (visible during both smoke and stress phases)
  console.log(`🍕 Created: ${pizzaData.name} (${ingredientCount} ingredients)`);

  // UPDATE CUSTOM METRICS: Accumulate data across all scenarios
  pizzas.add(1);                    // Increment pizza counter
  ingredients.add(ingredientCount); // Record ingredient count for trend analysis

  // Simulate user think time between requests (1 second pause)
  sleep(1);
}

// TEARDOWN PHASE: Post-test cleanup and reporting executed once after all scenarios
export function teardown() {
  console.log('🏁 Multi-scenario test completed!');
  console.log('📊 Results include data from BOTH smoke and stress scenarios.');
  console.log('⭐ NEW: Check summary.json for detailed scenario breakdown.');
  console.log('💡 Tip: Scenarios enable complex testing workflows in a single execution.');
  // TODO: Send notification to Slack about multi-scenario test results
}

// ⭐ CUSTOM SUMMARY HANDLER: Enhanced result formatting and export
// This function customizes how test results are displayed and saved
export function handleSummary(data) {
  return {
    // ⭐ NEW: Export detailed results to JSON file for analysis
    'summary.json': JSON.stringify(data, null, 2),

    // ⭐ NEW: Enhanced console output with colors and formatting
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  }
}
