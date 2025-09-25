import http from "k6/http";
import { check, sleep } from "k6";

/**
 * K6 STAGES LOAD TEST: QuickPizza API Performance Testing
 * 
 * GOAL: Demonstrate K6 stages configuration for load testing with realistic traffic patterns
 * 
 * This script shows how to:
 * - Configure load stages (ramp-up, steady state, ramp-down)
 * - Test the QuickPizza API under different load levels
 * - Monitor key performance metrics during load transitions
 * 
 * USAGE: k6 run k6/foundations/02.stages.js
 * 
 * EXPECTED OUTCOMES:
 * - Test Duration: ~30 seconds total (5s ramp-up + 20s steady + 5s ramp-down)
 * - Peak Load: 20 concurrent virtual users
 * - Request Rate: ~20 requests/second during steady state
 * - Total Requests: ~400-500 requests (depending on response times)
 * 
 * KEY METRICS TO MONITOR (see charts-understanding.md for details):
 * 
 * DASHBOARD ANALYSIS:
 * 📊 Overview Tab:
 *   - http_req_duration (p95): Should stay < 500ms for good user experience
 *   - http_req_failed: Should remain < 0.1% for reliable service  
 *   - Request Rate: Should ramp from 0→20→0 RPS following stage pattern
 *   - Virtual Users: Should show clear ramp-up/steady/ramp-down pattern
 * 
 * 📊 Timings Tab:
 *   - http_req_waiting (TTFB): Backend processing time, target < 200ms
 *   - http_req_connecting: Should be minimal with connection reuse
 *   - http_req_blocked: Should stay low, watch for connection pool issues
 * 
 * 📊 Summary Tab:
 *   - checks: Should be 100% (all validations passed)
 *   - http_reqs: Total request count should match expected volume
 *   - iteration_duration: Should be ~1 second (due to sleep(1))
 * 
 * PERFORMANCE THRESHOLDS TO WATCH:
 * ✅ Good: p95 < 500ms, 0% errors, stable request rate
 * ⚠️  Warning: p95 500ms-1s, <0.1% errors, slight rate variations  
 * ❌ Critical: p95 > 1s, >1% errors, significant rate drops
 */

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3333';

/**
 * STAGES CONFIGURATION: Simulates realistic traffic patterns
 * 
 * Stages define how virtual users (VUs) change over time:
 * - duration: How long each stage lasts
 * - target: Number of concurrent virtual users to reach/maintain
 * 
 * This pattern simulates:
 * 1. Gradual traffic increase (ramp-up) - tests system under growing load
 * 2. Sustained traffic (steady state) - tests system stability under constant load  
 * 3. Gradual traffic decrease (ramp-down) - tests system recovery behavior
 * 
 * MONITORING TIP: Watch for performance degradation during ramp-up and 
 * recovery time during ramp-down in the dashboard charts.
 */
export const options = {
  stages: [
    { duration: '5s', target: 20 },   // Ramp-up: 0→20 VUs (4 VUs/second increase)
    { duration: '20s', target: 20 },  // Steady: Hold 20 VUs (test stability)
    { duration: '5s', target: 0 },    // Ramp-down: 20→0 VUs (test recovery)
  ],
};

/**
 * MAIN TEST FUNCTION: Executed by each virtual user in every iteration
 * 
 * This function simulates a user creating a custom pizza order:
 * 1. Defines pizza customization preferences
 * 2. Sends POST request to pizza API
 * 3. Validates response (checks)
 * 4. Logs result for debugging
 * 5. Simulates think time (sleep)
 * 
 * PERFORMANCE IMPACT:
 * - Each VU executes this function repeatedly during their lifetime
 * - 1-second sleep = max 1 request/second per VU (20 VUs = ~20 RPS max)
 * - API response time affects overall iteration duration
 */
export default function () {
  // Pizza customization parameters - simulates user preferences
  let restrictions = {
    maxCaloriesPerSlice: 500,
    mustBeVegetarian: false,
    excludedIngredients: ["pepperoni"],
    excludedTools: ["knife"],
    maxNumberOfToppings: 6,
    minNumberOfToppings: 2
  }

  // Send pizza creation request - this is the main operation being load tested
  let res = http.post(`${BASE_URL}/api/pizza`, JSON.stringify(restrictions), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'token abcdef0123456789',
    },
  });

  // Validate response - contributes to 'checks' metric in dashboard
  check(res, {
    "status is 200": (res) => res.status === 200,
    "response has pizza": (res) => res.json().pizza !== undefined,
  });

  // Log successful pizza creation (visible in k6 output)
  if (res.status === 200) {
    const pizza = res.json().pizza;
    console.log(`Created: ${pizza.name} (${pizza.ingredients.length} ingredients)`);
  }

  // Think time - simulates user reading/processing the response
  // IMPORTANT: This directly affects request rate (1s sleep = max 1 req/s per VU)
  sleep(1);
}
