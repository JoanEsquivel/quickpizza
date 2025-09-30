/*
 * ============================================================================
 * K6 FOUNDATIONS: CONSTANT ARRIVAL RATE - SUSTAINED THROUGHPUT TESTING
 * ============================================================================
 * 
 * 🎯 LEARNING GOAL: Master constant arrival rate testing - a technique that
 *    maintains a steady flow of requests (like 20 per second) to test if your
 *    system can handle consistent, predictable traffic without slowing down.
 * 
 * 📋 WHAT'S NEW IN THIS SCRIPT (vs 07.scenarios.js):
 *    • ⭐ NEW: Constant Arrival Rate Executor - Maintains fixed request rate
 *    • ⭐ NEW: Rate-based Load Generation - Focus on requests/second vs VU count
 *    • ⭐ NEW: Throughput Validation - Tests system's ability to handle sustained load
 *    • ⭐ NEW: Pre-allocated VUs - Automatic scaling to maintain target rate
 *    • ⭐ NEW: No Sleep Strategy - Eliminates artificial delays for pure throughput testing
 * 
 * 🚀 QUICK START (Just want to run it?):
 *    cd k6/foundations
 *    k6 run 08.arrival-rate.js
 *    
 *    Watch for: "iterations: ~20/s" and "http_reqs: ~20/s" in the output!
 * 
 * 🏃‍♂️ ADVANCED USAGE:
 *    # With QuickPizza running elsewhere:
 *    k6 run -e BASE_URL=https://quickpizza.grafana.com 08.arrival-rate.js
 * 
 *    # With dashboard for real-time throughput monitoring:
 *    K6_WEB_DASHBOARD=true k6 run --linger 08.arrival-rate.js
 * 
 * ⏱️ EXPECTED TEST EXECUTION - CONSTANT THROUGHPUT VALIDATION:
 *    
 *    🚀 CONSTANT ARRIVAL RATE PHASE (0s - 30s):
 *    • Duration: 30 seconds
 *    • Target Rate: 20 requests/second (consistent throughout)
 *    • Load Pattern: Sustained constant throughput
 *    • Virtual Users: Auto-scaled (up to 60 VUs) to maintain rate
 *    • Purpose: Validate system's sustained throughput capacity
 *    • Total Requests: ~600 HTTP requests (20 req/s × 30 seconds)
 *    • Request Distribution: Evenly spaced (50ms intervals = 1000ms ÷ 20 req/s)
 * 
 *    📊 THROUGHPUT CHARACTERISTICS:
 *    • Request Rate: Exactly 20 requests/second (k6 maintains this precisely)
 *    • VU Scaling: k6 automatically adds/removes VUs to maintain rate
 *    • No Think Time: No sleep() calls - pure throughput testing
 *    • Realistic Load: Simulates consistent API usage or background processing
 * 
 * 📊 KEY METRICS TO MONITOR:
 * 
 *    BUILT-IN METRICS (infrastructure & performance validation):
 *    • http_req_failed: < 1% (System reliability under sustained load)
 *    • http_req_duration p95: < 500ms (User experience under constant throughput)
 *    • http_req_duration p99: < 1000ms (Worst-case performance consistency)
 *    • checks: > 95% (Business logic correctness under sustained load)
 * 
 *    CUSTOM METRICS (application-specific validation):
 *    • quickpizza_number_of_pizzas: Counter tracking total pizzas created
 *    • quickpizza_ingredients: Average < 8 ingredients per pizza
 * 
 *    ⭐ ARRIVAL RATE SPECIFIC METRICS:
 *    • iterations rate: Should consistently show ~20 iterations/second
 *    • http_reqs rate: Should consistently show ~20 requests/second
 *    • vus: Will fluctuate as k6 scales VUs to maintain target rate
 * 
 * 🎛️ DASHBOARD ANALYSIS GUIDE - CONSTANT THROUGHPUT MONITORING:
 * 
 *    OVERVIEW TAB - Sustained Load Validation:
 *    ⏰ 0s-30s: Consistent 20 req/s throughout entire test duration
 *    
 *    Key indicators for constant arrival rate:
 *    ✅ Green: Flat, consistent request rate line at exactly 20 req/s
 *    ✅ Green: Stable response times despite sustained load
 *    ✅ Green: VU count adjusts automatically to maintain rate
 *    ⚠️  Warning: Request rate drops below 20 req/s (system can't keep up)
 *    ⚠️  Warning: Response times increase over time (performance degradation)
 *    ❌ Critical: Significant rate deviation (system throughput limitation)
 * 
 *    TIMINGS TAB - Throughput Impact Analysis:
 *    • Monitor http_req_waiting (TTFB) - should remain stable under constant load
 *    • Watch for performance degradation over 30-second duration
 *    • Identify if system maintains consistent performance under sustained throughput
 *    • Look for resource exhaustion patterns (increasing response times)
 * 
 *    SUMMARY TAB - Throughput Capacity Validation:
 *    • iterations rate: Target = ~20/s (validates k6 achieved target throughput)
 *    • http_reqs rate: Target = ~20/s (confirms actual request rate)
 *    • http_req_duration percentiles: Should remain within thresholds
 *    • vus (avg): Shows average VUs needed to maintain 20 req/s
 * 
 * 🔍 CONSTANT ARRIVAL RATE EXECUTOR DEEP DIVE:
 * 
 *    https://grafana.com/docs/k6/latest/using-k6/scenarios/executors/constant-arrival-rate/
 *    ⭐ RATE-BASED LOAD GENERATION:
 *    • Focus: Requests per second (not VU count)
 *    • Behavior: k6 automatically scales VUs to maintain target rate
 *    • Real-world simulation: Consistent API usage, background jobs, scheduled tasks
 *    • Performance validation: Tests system's sustained throughput capacity
 * 
 *    ⭐ AUTOMATIC VU SCALING (Think: Smart Restaurant Manager):
 *    • preAllocatedVUs: 60 = Maximum cooks available in the kitchen
 *    • Goal: Serve exactly 20 pizzas per minute (constant rate)
 *    • If kitchen gets slower → manager adds more cooks to maintain 20/min
 *    • If kitchen gets faster → manager removes excess cooks (efficiency)
 *    • Warning: If all 60 cooks needed → kitchen is overwhelmed!
 *    
 *    📊 REAL EXAMPLES FROM YOUR TEST:
 *    • 5 VUs used = 250ms avg response (excellent performance) ✅
 *    • 20 VUs used = 1000ms avg response (getting slower) ⚠️
 *    • 60 VUs used = 3000ms avg response (system struggling) 🚨
 * 
 *    ⭐ NO SLEEP STRATEGY:
 *    • sleep() calls are counterproductive for arrival rate testing
 *    • Goal: Maximum throughput validation, not user behavior simulation
 *    • Pattern: Request → Process → Immediately next request
 *    • Result: Pure system capacity testing without artificial delays
 * 
 * 🚨 QUALITY GATES - SUSTAINED THROUGHPUT VALIDATION:
 *    • Infrastructure reliability: < 1% errors under constant 20 req/s load
 *    • Performance consistency: p95 < 500ms throughout 30-second duration
 *    • Worst-case handling: p99 < 1000ms even under sustained load
 *    • Business logic integrity: > 95% checks pass under throughput pressure
 *    • Application metrics: Ingredient complexity remains reasonable
 * 
 * 🔍 WHAT TO WATCH DURING EXECUTION:
 *    1. ⏰ 0s-5s: Initial rate establishment (k6 scales VUs to reach 20 req/s)
 *    2. ⏰ 5s-25s: Sustained throughput validation (consistent 20 req/s)
 *    3. ⏰ 25s-30s: Final throughput confirmation (rate maintained to end)
 *    4. 📊 VU Count: Watch this like a performance thermometer!
 *       • 5-10 VUs = �️ System running smoothly (fast responses)
 *       • 20-30 VUs = 🟡 System working harder (slower responses)
 *       • 50-60 VUs = 🔴 System struggling (very slow responses)
 *    5. 📈 Response Times: Should remain stable despite sustained load
 *    6. 🎯 End: Summary shows exactly ~600 requests at ~20 req/s rate
 * 
 * 🎯 ARRIVAL RATE TESTING BENEFITS:
 *    • Validates sustained system throughput capacity
 *    • Tests performance consistency under constant load
 *    • Simulates realistic API usage patterns
 *    • Identifies system capacity limits and bottlenecks
 *    • Provides precise load control for SLA validation
 * 
 * 💡 PRO TIPS:
 *    • Remove sleep() calls for pure throughput testing
 *    • Set preAllocatedVUs higher than expected needs for rate flexibility
 *    • Monitor VU count - high VU usage indicates system stress
 *    • Use for API capacity planning and SLA validation
 *    • Combine with other executors for comprehensive load testing
 * 
 * 📝 SIMPLE EXPLANATION - ARRIVAL RATE vs VU-BASED TESTING:
 * 
 *    🚀 ARRIVAL RATE TESTING (This Script):
 *    Think of it like a factory conveyor belt - exactly 20 pizzas per second,
 *    and k6 automatically adjusts workers (VUs) to maintain that steady pace.
 *    
 *    👥 VU-BASED TESTING (Other Scripts):
 *    Think of it like having exactly 5 workers, and they work as fast as they can.
 *    The output varies based on how fast each worker can complete their tasks.
 *    
 *    💡 WHY USE ARRIVAL RATE?
 *    Perfect for testing: "Can my API handle exactly 20 requests per second?"
 * 
 * ============================================================================
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Counter } from "k6/metrics";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.2/index.js";

// Base URL configuration - supports local and remote QuickPizza instances
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3333';

// ⭐ CONSTANT ARRIVAL RATE TEST CONFIGURATION: Sustained throughput validation
export const options = {
  // SCENARIO: Single constant arrival rate test for throughput validation
  scenarios: {
    // ⭐ CONSTANT THROUGHPUT SCENARIO: Maintains exactly 20 requests/second
    constant_request_rate: {
      exec: "getPizza",                    // Function to execute for each iteration
      executor: 'constant-arrival-rate',   // ⭐ NEW: Rate-based executor (not VU-based)
      duration: '30s',                     // Test duration: 30 seconds of sustained load

      // ⭐ THROUGHPUT CONFIGURATION: Precise rate control
      rate: 20,                           // Target: Exactly 20 iterations per second
      timeUnit: '1s',                     // Rate measurement unit (20 per 1 second)

      // ⭐ VU SCALING CONFIGURATION: Automatic scaling to maintain rate
      preAllocatedVUs: 60,                // Maximum VUs available for rate maintenance

      // 🤔 COMMON CONFUSION: "Why 60 VUs for only 20 requests per second?"
      // 🍕 RESTAURANT ANALOGY: You want to serve exactly 20 pizzas per minute:
      //    • Fast kitchen (30 sec/pizza): Need 10 cooks working simultaneously
      //    • Slow kitchen (3 min/pizza): Need ALL 60 cooks working simultaneously!
      //    The OUTPUT is always 20 pizzas/minute, but you need more cooks when kitchen is slower.
      //
      // 📊 VU FORMULA: VUs needed = (Rate × Response Time) + Buffer
      //    • 20 req/s × 0.1s response = 2 VUs (fast system) ✅
      //    • 20 req/s × 1.0s response = 20 VUs (slower system) ⚠️
      //    • 20 req/s × 3.0s response = 60 VUs (struggling system) 🚨
      //
      // 💡 VU COUNT = PERFORMANCE INDICATOR:
      //    • Using 5-10 VUs = System is fast and healthy
      //    • Using 30-40 VUs = System is getting slower under load
      //    • Using all 60 VUs = System is struggling! Time to optimize!
    },
  },

  // QUALITY GATES: Sustained throughput performance validation
  thresholds: {
    // Infrastructure reliability under sustained 20 req/s load
    http_req_failed: ['rate<0.01'],

    // Performance consistency throughout 30-second constant load
    http_req_duration: ['p(95)<500', 'p(99)<1000'],

    // Application-specific metrics under throughput pressure
    quickpizza_ingredients: [{ threshold: 'avg<8', abortOnFail: false }],

    // Business logic correctness under sustained load
    checks: ["rate > 0.95"]
  },
};

// CUSTOM METRICS: Application-specific measurements for throughput validation
// These metrics track business logic performance under sustained 20 req/s load
const pizzas = new Counter('quickpizza_number_of_pizzas');
// Counter: Accumulates total pizzas created during 30-second constant rate test
// Expected: ~600 pizzas (20 req/s × 30 seconds × 1 pizza per request)

const ingredients = new Trend('quickpizza_ingredients');
// Trend: Tracks ingredient count distribution across all pizzas
// Threshold: Average < 8 ingredients (validates complexity remains reasonable under load)

// SETUP PHASE: Pre-test validation executed once before constant arrival rate test
export function setup() {
  console.log('🔧 Setup: Verifying QuickPizza availability before constant arrival rate test...');
  let res = http.get(BASE_URL)
  if (res.status !== 200) {
    throw new Error(`❌ Setup failed: Got unexpected status code ${res.status} when trying to setup. Exiting.`)
  }
  console.log('✅ Setup: QuickPizza is available. Ready to start 20 req/s sustained throughput test.');
}

// ⭐ THROUGHPUT TEST FUNCTION: Executed at constant 20 req/s rate by k6
// This function represents one iteration - k6 will call it exactly 20 times per second
export function getPizza() {
  // Pizza customization parameters - realistic API payload for throughput testing
  let restrictions = {
    maxCaloriesPerSlice: 500,           // Health-conscious choice (realistic constraint)
    mustBeVegetarian: false,            // Allow all ingredients (broader pizza options)
    excludedIngredients: ["pepperoni"], // Personal preference exclusion (common filter)
    excludedTools: ["knife"],           // Kitchen tool limitation (operational constraint)
    maxNumberOfToppings: 6,             // Reasonable complexity limit (performance consideration)
    minNumberOfToppings: 2              // Minimum for interesting pizza (business rule)
  }

  // ⭐ CORE API CALL: Pizza generation request for throughput validation
  // This is the primary operation being tested at 20 req/s sustained rate
  let res = http.post(`${BASE_URL}/api/pizza`, JSON.stringify(restrictions), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'token abcdef0123456789', // Demo authentication token
    },
  });

  // BUSINESS LOGIC VALIDATION: Contributes to checks threshold (>95% success required)
  // Under sustained 20 req/s load, this validates API reliability and correctness
  check(res, {
    "✅ Pizza creation successful": (res) => res.status === 200
  });

  // Extract pizza data for logging and custom metrics
  const pizzaData = res.json().pizza;
  const ingredientCount = pizzaData.ingredients.length;

  // Log pizza details - visible during sustained throughput test execution
  console.log(`🍕 [Rate Test] ${pizzaData.name} (${ingredientCount} ingredients)`);

  // ⭐ UPDATE CUSTOM METRICS: Track business performance under sustained load
  pizzas.add(1);                    // Increment total pizza counter (target: ~600 pizzas)
  ingredients.add(ingredientCount); // Record ingredient complexity (threshold: avg < 8)

  // ⭐ NO SLEEP STRATEGY: Critical for constant arrival rate testing
  // sleep(1); ← COMMENTED OUT - Would interfere with precise rate control
  /*
   * 🎯 THROUGHPUT TESTING STRATEGY - Why No Sleep:
   * 
   * This test aims to achieve a constant request rate of 20 requests per second.
   * 
   * ❌ SLEEP IS COUNTERPRODUCTIVE for arrival rate testing because:
   * • k6 needs flexibility to time requests precisely (every 50ms)
   * • sleep() creates artificial delays that interfere with rate maintenance
   * • Goal is maximum throughput validation, not user behavior simulation
   * 
   * ✅ WITHOUT SLEEP, k6 can:
   * • Maintain exactly 20 req/s by controlling iteration timing
   * • Scale VUs automatically to handle response time variations
   * • Achieve pure throughput testing without artificial constraints
   * 
   * 📊 EXPECTED RESULT:
   * • iterations rate: ~20.0/s (exactly as configured)
   * • http_reqs rate: ~20.0/s (1 request per iteration)
   * • Total requests: ~600 (20 req/s × 30 seconds)
   * • VU usage: Variable (k6 scales to maintain rate)
   * 
   * 💡 RATE CALCULATION:
   * 20 iterations per second × 1 request per iteration = 20 requests per second
   * 
   * Expected output: iterations.....................: 600     19.963596/s
   */
}

// TEARDOWN PHASE: Post-test reporting executed once after constant arrival rate test
export function teardown() {
  console.log('🏁 Constant arrival rate test completed!');
  console.log('📊 Throughput validation finished: 30 seconds at 20 req/s target rate.');
  console.log('⭐ Key Results: Check if ~600 total requests achieved at ~20 req/s rate.');
  console.log('');
  console.log('🍕 VU USAGE ANALYSIS (Remember the restaurant analogy):');
  console.log('   • If you used 5-10 VUs: Your "kitchen" is fast! ✅');
  console.log('   • If you used 20-30 VUs: Your "kitchen" is getting slower ⚠️');
  console.log('   • If you used 50-60 VUs: Your "kitchen" is struggling! 🚨');
  console.log('');
  console.log('📈 Performance Analysis: Review response time consistency under sustained load.');
  console.log('🎯 Next Steps: Use results for capacity planning and SLA validation.');
  // TODO: Send notification to Slack about throughput test results and capacity metrics
}

// ⭐ CUSTOM SUMMARY HANDLER: Enhanced result formatting for throughput analysis
// Provides detailed throughput metrics and exports results for capacity planning
export function handleSummary(data) {
  return {
    // ⭐ DETAILED RESULTS EXPORT: JSON file with complete throughput test data
    'summary.json': JSON.stringify(data, null, 2),
    // Contains: iteration rates, request rates, VU scaling patterns, response time distributions
    // Use for: Capacity planning, SLA validation, performance baseline establishment

    // ⭐ ENHANCED CONSOLE OUTPUT: Formatted summary with colors and proper indentation
    stdout: textSummary(data, { indent: " ", enableColors: true }),
    // Highlights: Actual vs target rates, threshold pass/fail status, custom metrics
    // Focus on: iterations rate (~20/s), http_reqs rate (~20/s), response time percentiles
  }
}
