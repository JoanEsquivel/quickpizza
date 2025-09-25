import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Counter } from "k6/metrics";

/**
 * K6 CUSTOM METRICS: QuickPizza API Business Intelligence Testing
 * 
 * GOAL: Demonstrate how to create and use custom K6 metrics for business-specific monitoring
 * 
 * This script shows how to:
 * - Create custom Counter metrics (cumulative values)
 * - Create custom Trend metrics (statistical distributions)
 * - Track business-specific KPIs alongside technical performance
 * - Use setup() and teardown() lifecycle functions
 * - Combine custom metrics with standard HTTP performance metrics
 * 
 * USAGE: k6 run k6/foundations/04.metrics.js
 * 
 * EXPECTED OUTCOMES:
 * - Test Duration: 20 seconds total (5s ramp-up + 10s steady + 5s ramp-down)
 * - Peak Load: 5 concurrent virtual users
 * - Request Rate: ~5 requests/second during steady state
 * - Total Requests: ~75-100 requests (depending on response times)
 * - Custom Metrics: Pizza count tracking and ingredient distribution analysis
 * 
 * FOCUS: Custom metrics and K6 lifecycle functions (setup/teardown)
 * 
 * For standard K6 metrics analysis, see 02.stages.js and charts-understanding.md
 * 
 * CUSTOM BUSINESS METRICS:
 * 📈 quickpizza_number_of_pizzas (Counter):
 *   - Tracks total pizzas successfully created
 *   - Business KPI: Pizza creation rate and total volume
 *   - Should increment by 1 for each successful pizza order
 * 
 * 📈 quickpizza_ingredients (Trend):
 *   - Tracks ingredient count distribution across pizzas
 *   - Business insight: Complexity of generated pizzas
 *   - Statistical analysis: avg, min, max, p90, p95, p99 ingredient counts
 * 
 * KEY LEARNING OBJECTIVES:
 * 1. How to create and use Counter metrics for business KPIs
 * 2. How to create and use Trend metrics for statistical analysis
 * 3. How to implement setup() function for pre-test validation
 * 4. How to implement teardown() function for post-test cleanup
 * 5. How custom metrics complement standard K6 performance metrics
 */

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3333';

/**
 * LOAD TEST CONFIGURATION: Lightweight stages for custom metrics demonstration
 * 
 * Using lighter load (5 VUs vs 20) to focus on metrics collection rather than stress testing.
 * This allows clearer observation of custom metric behavior without overwhelming the system.
 * 
 * Stage Pattern:
 * 1. Ramp-up (5s): 0→5 VUs - Gradual load increase for metric baseline
 * 2. Steady (10s): 5 VUs - Consistent load for metric trend analysis  
 * 3. Ramp-down (5s): 5→0 VUs - Clean test completion
 * 
 * MONITORING TIP: Focus on custom metric trends in addition to standard HTTP metrics.
 * Watch how business metrics correlate with technical performance indicators.
 */
export const options = {
  stages: [
    { duration: '5s', target: 5 },   // Ramp-up: Gentle load increase for metric observation
    { duration: '10s', target: 5 },  // Steady: Sustained load for trend analysis
    { duration: '5s', target: 0 },   // Ramp-down: Clean test completion
  ],
};

/**
 * CUSTOM METRICS DEFINITIONS: Business-specific KPIs for pizza ordering system
 * 
 * K6 provides several metric types for different use cases:
 * - Counter: Cumulative values that only increase (counts, totals)
 * - Trend: Statistical distributions (response times, sizes, quantities)
 * - Gauge: Point-in-time values that can increase/decrease (current state)
 * - Rate: Percentage-based metrics (success rates, ratios)
 */

/**
 * PIZZA COUNTER METRIC: Tracks total successful pizza creations
 * 
 * Type: Counter (cumulative count)
 * Purpose: Business KPI for pizza ordering success rate
 * Usage: pizzas.add(1) for each successful pizza creation
 * 
 * Dashboard Analysis:
 * - Rate: Pizzas created per second (business throughput)
 * - Count: Total pizzas created during test (business volume)
 * - Compare with http_reqs to calculate success ratio
 * 
 * Expected Ratios (as guidance):
 * - Success Rate: quickpizza_number_of_pizzas / http_reqs ≈ 0.95-1.0 (95-100%)
 * - Business Throughput: Rate depends on test duration (with 1s sleep: ~1 pizza/VU/sec)
 * - Total Volume: ~70-100 pizzas for typical test runs
 * - Pizza/Request Ratio: Should be ~0.98-1.0 for successful requests (each request = 1 pizza)
 * - NOTE: Actual throughput rate varies with total test duration
 */
const pizzas = new Counter('quickpizza_number_of_pizzas');

/**
 * INGREDIENT TREND METRIC: Analyzes pizza complexity distribution
 * 
 * Type: Trend (statistical distribution)
 * Purpose: Business insight into pizza complexity and variety
 * Usage: ingredients.add(count) for each pizza's ingredient count
 * 
 * Dashboard Analysis:
 * - Average: Typical pizza complexity
 * - p95/p99: Most complex pizzas generated
 * - Min/Max: Range of pizza complexity
 * - Distribution: Understanding of pizza variety patterns
 * 
 * Expected Ratios (as guidance):
 * - Average Ingredients: ~5-6 ingredients per pizza (includes base + toppings)
 * - Min Ingredients: ~4-5 (base ingredients + minNumberOfToppings)
 * - Max Ingredients: ~7-8 (base ingredients + maxNumberOfToppings)
 * - p95: ~7 ingredients (complex pizzas with many toppings)
 * - p99: ~8 ingredients (maximum complexity with all constraints)
 * - Distribution: Should show variation between 5-8 ingredients
 * - NOTE: API includes base ingredients beyond configured topping limits
 */
const ingredients = new Trend('quickpizza_ingredients');

/**
 * SETUP FUNCTION: Pre-test validation and initialization
 * 
 * Executed once before the main test begins (before any VUs start).
 * Used for:
 * - System health checks
 * - Test data preparation
 * - Environment validation
 * - Baseline measurements
 * 
 * IMPORTANT: If setup() fails, the entire test is aborted.
 * This prevents running load tests against broken systems.
 */
export function setup() {
  console.log('🍕 QuickPizza Custom Metrics Test - Starting Setup');
  console.log(`📍 Target URL: ${BASE_URL}`);

  // Health check: Verify the QuickPizza service is available
  let res = http.get(BASE_URL)
  if (res.status !== 200) {
    throw new Error(`❌ Setup failed: Got unexpected status code ${res.status} when trying to reach ${BASE_URL}. Exiting.`)
  }

  console.log('✅ Setup complete: QuickPizza service is responding');
  console.log('📊 Custom metrics initialized: pizzas counter, ingredients trend');
}

/**
 * MAIN TEST FUNCTION: Pizza creation with custom metrics collection
 * 
 * Executed repeatedly by each virtual user throughout their lifetime.
 * This function demonstrates:
 * 1. Standard HTTP load testing (pizza API call)
 * 2. Response validation (checks)
 * 3. Custom business metrics collection
 * 4. Correlation between technical and business metrics
 * 
 * CUSTOM METRICS FLOW:
 * 1. Send pizza creation request (standard HTTP metric collection)
 * 2. Validate response success (standard check metric)
 * 3. Extract business data from response (pizza details)
 * 4. Record business metrics (custom counters and trends)
 * 5. Log business insights for debugging
 */
export default function () {
  // Pizza customization parameters - represents user preferences
  // These restrictions affect pizza complexity and ingredient count
  let restrictions = {
    maxCaloriesPerSlice: 500,          // Health-conscious constraint
    mustBeVegetarian: false,           // Dietary preference
    excludedIngredients: ["pepperoni"], // Allergy/preference exclusion
    excludedTools: ["knife"],          // Kitchen constraint
    maxNumberOfToppings: 6,            // Complexity limit
    minNumberOfToppings: 2             // Minimum variety requirement
  }

  // PIZZA CREATION API CALL: Core business operation being tested
  let res = http.post(`${BASE_URL}/api/pizza`, JSON.stringify(restrictions), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'token abcdef0123456789', // API authentication
    },
  });

  // RESPONSE VALIDATION: Standard technical validation
  // This check contributes to the overall 'checks' success rate metric
  check(res, {
    "status is 200": (res) => res.status === 200,
    "response has pizza": (res) => res.json().pizza !== undefined,
    "pizza has name": (res) => res.json().pizza.name !== undefined,
    "pizza has ingredients": (res) => res.json().pizza.ingredients && res.json().pizza.ingredients.length > 0
  });

  // CUSTOM METRICS COLLECTION: Business intelligence gathering
  if (res.status === 200 && res.json().pizza) {
    const pizza = res.json().pizza;
    const ingredientCount = pizza.ingredients.length;

    // BUSINESS METRIC 1: Increment successful pizza counter
    // This tracks business throughput (pizzas/second) alongside technical throughput (requests/second)
    pizzas.add(1);

    // BUSINESS METRIC 2: Record ingredient count for complexity analysis
    // This provides statistical distribution of pizza complexity over time
    ingredients.add(ingredientCount);

    // Business logging for debugging and insights
    console.log(`🍕 Created: ${pizza.name} (${ingredientCount} ingredients)`);
  } else {
    // Log business failures for debugging
    console.log(`❌ Pizza creation failed: Status ${res.status}`);
  }

  // Think time - simulates user reviewing their pizza order
  // PERFORMANCE IMPACT: 1-second sleep limits each VU to max 1 request/second
  // With 5 VUs: theoretical max ~5 requests/second during steady state
  sleep(1);
}

/**
 * TEARDOWN FUNCTION: Post-test cleanup and reporting
 * 
 * Executed once after all VUs have finished (after main test completes).
 * Used for:
 * - Test cleanup
 * - Final reporting
 * - Notification sending
 * - Resource cleanup
 * 
 * IMPORTANT: Teardown runs regardless of test success/failure.
 * Use for essential cleanup operations.
 */
export function teardown() {
  console.log('🏁 QuickPizza Custom Metrics Test - Complete!');
  console.log('📊 Check your dashboard for custom metrics:');
  console.log('   • quickpizza_number_of_pizzas (Counter): Total pizzas created');
  console.log('   • quickpizza_ingredients (Trend): Pizza complexity distribution');
  console.log('💡 Compare business metrics with technical metrics for insights');

  // TODO: Send notification to Slack with test summary
  // Example: Slack notification with custom metrics summary
  // slack.send({
  //   channel: '#performance-testing',
  //   message: `QuickPizza test complete. Check dashboard for pizza creation metrics.`
  // });

  console.log("🎬 That's all folks!");
}
