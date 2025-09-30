/*
 * ============================================================================
 * K6 FOUNDATIONS: DATA-DRIVEN TESTING - EXTERNAL DATA & SHARED ARRAYS
 * ============================================================================
 * 
 * 🎯 LEARNING GOAL: Master data-driven testing with k6 by using external data
 *    files and SharedArray to simulate realistic user scenarios with different
 *    authentication tokens, user profiles, or test datasets.
 * 
 * 📋 WHAT'S NEW IN THIS SCRIPT (vs 08.arrival-rate.js):
 *    • ⭐ NEW: SharedArray - Memory-efficient data sharing across VUs
 *    • ⭐ NEW: External Data Files - Loading test data from JSON files
 *    • ⭐ NEW: Data-Driven Authentication - Random token selection per request
 *    • ⭐ NEW: Realistic User Simulation - Different users with different tokens
 *    • ⭐ NEW: Scalable Test Data - Easy to add more tokens without code changes
 * 
 * 🚀 QUICK START (Just want to run it?):
 *    cd k6/foundations
 *    k6 run 09.data.js
 *    
 *    Watch for: Different tokens being used in console output!
 * 
 * 🏃‍♂️ ADVANCED USAGE:
 *    # With QuickPizza running elsewhere:
 *    k6 run -e BASE_URL=https://quickpizza.grafana.com 09.data.js
 * 
 *    # With dashboard for real-time data usage monitoring:
 *    K6_WEB_DASHBOARD=true k6 run --linger 09.data.js
 * 
 * ⏱️ EXPECTED TEST EXECUTION - DATA-DRIVEN MULTI-PHASE TESTING:
 *    
 *    🔍 PHASE 1 - SMOKE TEST (0s - 10s):
 *    • Duration: 10 seconds
 *    • Virtual Users: 1 constant user
 *    • Data Usage: Random token selection from 6 available tokens
 *    • Purpose: Validate functionality with different authentication tokens
 *    • Total Requests: ~10 HTTP requests (1 VU × 10 seconds ÷ 1s sleep)
 *    • Token Distribution: Random selection from tokens.json
 * 
 *    ⚡ PHASE 2 - STRESS TEST (10s - 30s):
 *    • Duration: 20 seconds (starts after smoke test completes)
 *    • Virtual Users: 0 → 5 → 5 → 0 (ramping pattern)
 *    • Data Usage: Each VU randomly selects tokens independently
 *    • Purpose: Performance validation with realistic user diversity
 *    • Total Requests: ~50 HTTP requests (5 VUs × 10 seconds ÷ 1s sleep)
 *    • Token Distribution: Statistical spread across all 6 tokens
 * 
 *    📊 TOTAL TEST EXECUTION:
 *    • Total Duration: 30 seconds (10s smoke + 20s stress)
 *    • Total Requests: ~60 HTTP requests combined
 *    • Peak Load: 5 concurrent users (stress phase only)
 *    • Data Variety: 6 different authentication tokens used randomly
 * 
 * 📊 KEY METRICS TO MONITOR:
 * 
 *    BUILT-IN METRICS (infrastructure & performance validation):
 *    • http_req_failed: < 1% (System reliability across different tokens)
 *    • http_req_duration p95: < 500ms (User experience with data variety)
 *    • http_req_duration p99: < 1000ms (Worst-case performance with different users)
 *    • checks: > 95% (Business logic correctness across all tokens)
 * 
 *    CUSTOM METRICS (application-specific validation):
 *    • quickpizza_number_of_pizzas: Counter tracking total pizzas across all users
 *    • quickpizza_ingredients: Average < 8 ingredients per pizza across all tokens
 * 
 *    ⭐ DATA-DRIVEN SPECIFIC OBSERVATIONS:
 *    • Console logs show different tokens being used: "Token QivfLrMEt7thtJLQ", "Token LJwhcDFp0TgvpOtg", etc.
 *    • Each request uses a randomly selected token from the shared array
 *    • Performance should be consistent regardless of which token is used
 * 
 * 🎛️ DASHBOARD ANALYSIS GUIDE - DATA-DRIVEN TESTING MONITORING:
 * 
 *    OVERVIEW TAB - Multi-User Validation:
 *    ⏰ 0s-10s: Low steady load with token variety (1 VU, smoke test)
 *    ⏰ 10s-15s: Load ramp-up with increased token usage (stress test starts)
 *    ⏰ 15s-25s: Peak load with full token distribution (5 VUs, main stress phase)
 *    ⏰ 25s-30s: Load ramp-down with continued token variety (graceful completion)
 *    
 *    Key indicators for data-driven testing:
 *    ✅ Green: Consistent performance across all tokens
 *    ✅ Green: No authentication failures (all tokens valid)
 *    ✅ Green: Even distribution of token usage in logs
 *    ⚠️  Warning: Performance varies significantly by token (investigate token-specific issues)
 *    ⚠️  Warning: Authentication errors with specific tokens (token validation issues)
 *    ❌ Critical: High failure rate (token authentication system problems)
 * 
 *    TIMINGS TAB - Token-Agnostic Performance Analysis:
 *    • Monitor http_req_waiting (TTFB) - should be consistent across all tokens
 *    • Watch for authentication overhead - minimal impact expected
 *    • Identify if different tokens cause different response times
 *    • Look for token-specific performance patterns
 * 
 *    SUMMARY TAB - Data Variety Impact Assessment:
 *    • http_req_failed: Should be 0% (all tokens should work)
 *    • http_req_duration percentiles: Should be consistent regardless of token
 *    • checks: Should be >95% across all token usage
 *    • Custom metrics: Should show combined results from all token usage
 * 
 * 🔍 SHARED ARRAY & DATA-DRIVEN TESTING DEEP DIVE:
 * 
 *    https://grafana.com/docs/k6/latest/javascript-api/k6-data/sharedarray/
 *    ⭐ SHARED ARRAY BENEFITS:
 *    • Memory Efficiency: Data loaded once, shared across all VUs
 *    • Performance: No memory duplication per VU (critical for large datasets)
 *    • Scalability: Same memory usage whether you have 1 VU or 1000 VUs
 *    • Immutability: Data is read-only, preventing accidental modifications
 * 
 *    ⭐ DATA-DRIVEN TESTING PATTERNS:
 *    • Random Selection: Each request uses Math.random() to pick different tokens
 *    • Realistic Simulation: Different users with different authentication
 *    • Easy Maintenance: Add/remove tokens in JSON file without code changes
 *    • Scalable Testing: Same approach works for user profiles, test data, etc.
 * 
 *    ⭐ EXTERNAL DATA FILE STRUCTURE:
 *    • tokens.json contains array of 6 authentication tokens
 *    • JSON format allows easy editing and version control
 *    • Can be extended to include user profiles, test scenarios, etc.
 *    • Supports complex data structures (objects, nested arrays)
 * 
 * 🚨 QUALITY GATES - DATA-DRIVEN VALIDATION:
 *    • Token Authentication: 0% failures across all 6 tokens
 *    • Performance Consistency: Similar response times regardless of token used
 *    • Business Logic: >95% checks pass with all token variations
 *    • Data Integrity: All tokens produce valid pizza responses
 *    • System Reliability: <1% errors even with token variety
 * 
 * 🔍 WHAT TO WATCH DURING EXECUTION:
 *    1. ⏰ 0s-10s: Smoke test with token variety (watch console for different tokens)
 *    2. ⏰ 10s: Stress test begins (increased token usage frequency)
 *    3. ⏰ 10s-15s: Load ramping up (multiple VUs using different tokens)
 *    4. ⏰ 15s-25s: Peak load with full token distribution (5 VUs, random selection)
 *    5. ⏰ 25s-30s: Load ramping down (continued token variety)
 *    6. 🎯 End: Summary shows consistent performance across all token usage
 * 
 * 🎯 DATA-DRIVEN TESTING BENEFITS:
 *    • Realistic User Simulation: Different users with different credentials
 *    • Scalable Test Design: Easy to add more test data without code changes
 *    • Memory Efficient: SharedArray prevents memory bloat with large datasets
 *    • Maintainable Tests: External data files are easy to update and version
 *    • Comprehensive Coverage: Tests system behavior with data variety
 * 
 * 💡 PRO TIPS:
 *    • Use SharedArray for any data shared across VUs (users, products, scenarios)
 *    • Keep data files in version control for test reproducibility
 *    • Use random selection for realistic user behavior simulation
 *    • Monitor performance consistency across different data values
 *    • Consider data file size impact on test startup time
 * 
 * 📝 IMPORTANT NOTE - SHARED ARRAY vs REGULAR ARRAYS:
 *    SHARED ARRAY = Loaded once, shared across all VUs (memory efficient)
 *    Example: 1000 VUs share same data copy in memory
 *    
 *    REGULAR ARRAY = Copied to each VU (memory intensive)
 *    Example: 1000 VUs each get their own data copy (1000x memory usage!)
 *    
 *    Always use SharedArray for test data to prevent memory issues at scale
 * 
 * ============================================================================
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Counter } from "k6/metrics";
import { SharedArray } from 'k6/data';
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.2/index.js";

// Base URL configuration - supports local and remote QuickPizza instances
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3333';

// ⭐ DATA-DRIVEN MULTI-SCENARIO TEST CONFIGURATION: External data with dual-phase testing
export const options = {
  // SCENARIOS: Two sequential test phases with shared data usage
  scenarios: {
    // ⭐ SCENARIO 1: SMOKE TEST - Data-driven functionality validation
    smoke: {
      exec: "getPizza",              // Function to execute (uses shared token data)
      executor: "constant-vus",      // Steady load executor
      vus: 1,                        // 1 virtual user (minimal load)
      duration: "10s",               // Run for 10 seconds
      // Each iteration will randomly select from 6 available tokens
      // Expected: ~10 requests with token variety
    },

    // ⭐ SCENARIO 2: STRESS TEST - Data-driven performance validation
    stress: {
      exec: "getPizza",              // Same function as smoke test (shared data access)
      executor: "ramping-vus",       // Variable load executor with stages
      stages: [                      // Load pattern for stress test
        { duration: '5s', target: 5 },   // Ramp-up: 0 → 5 VUs over 5 seconds
        { duration: '10s', target: 5 },  // Sustain: 5 VUs for 10 seconds
        { duration: '5s', target: 0 },   // Ramp-down: 5 → 0 VUs over 5 seconds
      ],
      startTime: "10s",             // Wait 10s (after smoke test completes)
      // Multiple VUs will independently select random tokens
      // Expected: ~50 requests with statistical token distribution
    },
  },

  // QUALITY GATES: Data-driven testing validation across all token usage
  thresholds: {
    // Infrastructure reliability across all authentication tokens
    http_req_failed: ['rate<0.01'],

    // Performance requirements regardless of which token is used
    http_req_duration: ['p(95)<500', 'p(99)<1000'],

    // Application-specific metrics across all token variations
    quickpizza_ingredients: [{ threshold: 'avg<8', abortOnFail: false }],

    // Business logic correctness with all 6 different tokens
    checks: ["rate > 0.95"]
  },
};

// CUSTOM METRICS: Application-specific measurements for data-driven testing
// These metrics track business logic performance across all token variations
const pizzas = new Counter('quickpizza_number_of_pizzas');
// Counter: Accumulates total pizzas created across all scenarios and token usage
// Expected: ~60 pizzas (combined from smoke + stress phases with token variety)

const ingredients = new Trend('quickpizza_ingredients');
// Trend: Tracks ingredient count distribution across all pizzas and tokens
// Threshold: Average < 8 ingredients (validates complexity remains reasonable with data variety)

// ⭐ SHARED ARRAY: Memory-efficient external data loading for multi-VU access
// This is the core of data-driven testing - external data shared across all VUs
const tokens = new SharedArray('all tokens', function () {
  return JSON.parse(open('./data/tokens.json')).tokens;
});
// 📊 SHARED ARRAY BENEFITS:
// • Memory Efficient: Data loaded once, shared across ALL VUs (not copied per VU)
// • Scalable: Same memory usage whether you have 1 VU or 1000 VUs
// • External Data: Easy to modify tokens.json without changing code
// • Realistic Testing: Each VU can simulate different users with different tokens
//
// 📝 DATA STRUCTURE: tokens.json contains 6 authentication tokens:
// ["QivfLrMEt7thtJLQ", "LJwhcDFp0TgvpOtg", "WA1UafNBZrfQMpTf", 
//  "NS9RTUgm42fgxe1E", "O62N74Bbt3lNwY6l", "pW6DNdnWppqMl1c6"]
//
// 🎲 RANDOM SELECTION: Each request will randomly pick one of these 6 tokens

// SETUP PHASE: Pre-test validation executed once before data-driven scenarios
export function setup() {
  console.log('🔧 Setup: Verifying QuickPizza availability before data-driven testing...');
  console.log(`📊 Data Info: Loaded ${tokens.length} authentication tokens from tokens.json`);
  console.log('🎲 Test Strategy: Each request will randomly select from available tokens');

  let res = http.get(BASE_URL)
  if (res.status !== 200) {
    throw new Error(`❌ Setup failed: Got unexpected status code ${res.status} when trying to setup. Exiting.`)
  }
  console.log('✅ Setup: QuickPizza is available. Ready to run data-driven smoke → stress scenarios.');
  console.log('👀 Watch Console: Look for different tokens being used in each request!');
}

// ⭐ DATA-DRIVEN TEST FUNCTION: Executed by both smoke and stress scenarios
// This function demonstrates core data-driven testing concepts with random token selection
export function getPizza() {
  // Pizza customization parameters - consistent across all token usage
  let restrictions = {
    maxCaloriesPerSlice: 500,           // Health-conscious choice (same for all users)
    mustBeVegetarian: false,            // Allow all ingredients (consistent preference)
    excludedIngredients: ["pepperoni"], // Personal preference exclusion (user-agnostic)
    excludedTools: ["knife"],           // Kitchen tool limitation (system constraint)
    maxNumberOfToppings: 6,             // Reasonable complexity limit (business rule)
    minNumberOfToppings: 2              // Minimum for interesting pizza (quality standard)
  }

  // ⭐ CORE DATA-DRIVEN CONCEPT: Random token selection from SharedArray
  // This simulates different users with different authentication credentials
  const selectedToken = tokens[Math.floor(Math.random() * tokens.length)];
  // 🎲 RANDOM SELECTION EXPLAINED:
  // • Math.random() generates 0.0 to 0.999...
  // • Multiply by tokens.length (6) = 0.0 to 5.999...
  // • Math.floor() rounds down = 0, 1, 2, 3, 4, or 5 (valid array indices)
  // • Result: Each request randomly picks one of 6 available tokens

  // ⭐ API CALL WITH DATA-DRIVEN AUTHENTICATION: Pizza generation with random user token
  let res = http.post(`${BASE_URL}/api/pizza`, JSON.stringify(restrictions), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Token ' + selectedToken,  // ⭐ Dynamic token from SharedArray
    },
  });

  // BUSINESS LOGIC VALIDATION: Contributes to checks threshold across all token usage
  // This validates that ALL tokens work correctly and produce valid responses
  check(res, {
    "✅ Pizza creation successful": (res) => res.status === 200
  });

  // Extract pizza data for logging and custom metrics
  const pizzaData = res.json().pizza;
  const ingredientCount = pizzaData.ingredients.length;

  // 📝 ENHANCED LOGGING: Shows which token was used for this request
  // This helps verify that different tokens are being used across requests
  console.log(`🍕 [Token: ${selectedToken.substring(0, 8)}...] ${pizzaData.name} (${ingredientCount} ingredients)`);
  // Log format: [Token: QivfLrME...] Margherita Supreme (5 ingredients)
  // This makes it easy to see token variety in console output

  // ⭐ UPDATE CUSTOM METRICS: Track business performance across all token usage
  pizzas.add(1);                    // Increment total pizza counter (all tokens combined)
  ingredients.add(ingredientCount); // Record ingredient complexity (across all token usage)

  // Simulate user think time between requests (1 second pause)
  // Same for all users regardless of token - focuses on authentication variety
  sleep(1);
}

// TEARDOWN PHASE: Post-test reporting executed once after data-driven scenarios
export function teardown() {
  console.log('🏁 Data-driven multi-scenario test completed!');
  console.log('📊 Token Usage: All 6 authentication tokens were randomly used across scenarios.');
  console.log('⭐ Key Results: Check if ~60 total requests achieved with token variety.');
  console.log('');
  console.log('📝 DATA-DRIVEN TESTING ANALYSIS:');
  console.log('   • Token Distribution: Review console logs for token variety');
  console.log('   • Performance Consistency: Should be similar across all tokens');
  console.log('   • Authentication Success: All tokens should have worked (0% failures)');
  console.log('   • Business Logic: Pizza creation should work with any valid token');
  console.log('');
  console.log('📈 Performance Analysis: Review response time consistency across token usage.');
  console.log('🎯 Next Steps: Use this pattern for user profiles, test scenarios, or product data.');
  // TODO: Send notification to Slack about data-driven test results and token usage statistics
}

// ⭐ CUSTOM SUMMARY HANDLER: Enhanced result formatting for data-driven analysis
// Provides detailed metrics and exports results for data-driven testing evaluation
export function handleSummary(data) {
  return {
    // ⭐ DETAILED RESULTS EXPORT: JSON file with complete data-driven test data
    'summary.json': JSON.stringify(data, null, 2),
    // Contains: Token usage patterns, performance across different authentications, scenario results
    // Use for: Data-driven test analysis, token performance comparison, user simulation validation

    // ⭐ ENHANCED CONSOLE OUTPUT: Formatted summary with colors and proper indentation
    stdout: textSummary(data, { indent: " ", enableColors: true }),
    // Highlights: Combined results from both scenarios, threshold pass/fail status, custom metrics
    // Focus on: Performance consistency across tokens, authentication success rates, business metrics
  }
}
