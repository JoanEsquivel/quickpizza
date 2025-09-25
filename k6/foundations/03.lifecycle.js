/**
 * =============================================================================
 * K6 LIFECYCLE FUNCTIONS TEST
 * =============================================================================
 * 
 * PURPOSE: Demonstrates k6's test lifecycle functions (setup, main, teardown) 
 * while testing the QuickPizza API's pizza generation endpoint.
 * 
 * LEARNING OBJECTIVES:
 * - Understand k6's 4-phase test lifecycle: init, setup, VU execution, teardown
 * - Learn when and how to use setup() and teardown() functions
 * - Practice API testing with POST requests and JSON payloads
 * 
 * =============================================================================
 * TEST EXECUTION PHASES EXPLAINED:
 * =============================================================================
 * 
 * 1. INIT PHASE (Once per VU):
 *    - Import statements execute
 *    - Global variables and options are set
 *    - Runs before any other phase
 * 
 * 2. SETUP PHASE (Once per test):
 *    - Runs once before all VUs start
 *    - Perfect for: authentication, data preparation, environment validation
 *    - Return value is passed to main function and teardown
 * 
 * 3. VU EXECUTION PHASE (Multiple times):
 *    - Main default function runs repeatedly for each VU
 *    - This is where your actual load testing happens
 *    - Each VU runs independently and concurrently
 * 
 * 4. TEARDOWN PHASE (Once per test):
 *    - Runs once after all VUs finish
 *    - Perfect for: cleanup, notifications, final reporting
 *    - Receives setup() return value as parameter
 * 
 * =============================================================================
 * USAGE:
 * =============================================================================
 * 
 * Basic execution:
 *   k6 run 03.lifecycle.js
 * 
 * With custom target URL:
 *   k6 run --env BASE_URL=https://your-api.com 03.lifecycle.js
 * 
 * =============================================================================
 */

import http from "k6/http";
import { check, sleep } from "k6";

// Configuration: Base URL for the QuickPizza API
// Can be overridden via environment variable for different environments
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3333';

// Load Testing Configuration
export const options = {
  // Simple load pattern to demonstrate lifecycle functions
  stages: [
    { duration: '5s', target: 5 },   // Ramp up: 0→5 VUs over 5 seconds
    { duration: '10s', target: 5 },  // Steady state: maintain 5 VUs for 10 seconds  
    { duration: '5s', target: 0 },   // Ramp down: 5→0 VUs over 5 seconds
  ],
};

/**
 * SETUP FUNCTION - Pre-test Environment Validation
 * =============================================================================
 * Runs ONCE before all VUs start executing the main test function.
 * 
 * Purpose: Validate that the target API is available and responding correctly
 * before starting the load test.
 * 
 * Return Value: Can return data to be used by main function and teardown
 * (not used in this example, but commonly used for authentication tokens,
 * test data, or configuration that should be shared across VUs)
 */
export function setup() {
  console.log('🚀 Starting lifecycle test setup - validating API availability...');

  // Validate API availability with a simple GET request to the root endpoint
  let res = http.get(BASE_URL);

  // Fail the entire test if the API is not responding correctly
  if (res.status !== 200) {
    throw new Error(`❌ Setup failed: Got unexpected status code ${res.status} when trying to reach ${BASE_URL}. ` +
      `Please verify the API is running and accessible. Exiting test.`);
  }

  console.log('✅ Setup successful - API is responding correctly');

  // Could return setup data here, for example:
  // return { authToken: 'abc123', testData: {...} };
}

/**
 * MAIN TEST FUNCTION - Core Load Testing Logic
 * =============================================================================
 * This function runs repeatedly for each Virtual User (VU) throughout the test.
 * Each execution is called an "iteration".
 * 
 * Test Scenario: Custom Pizza Generation API Testing
 * - Simulates a user requesting a custom pizza with specific dietary restrictions
 * - Tests POST endpoint with JSON payload
 * - Validates response status and extracts pizza details
 */
export default function () {
  // Define pizza customization parameters
  // This simulates a real user's dietary preferences and restrictions
  let restrictions = {
    maxCaloriesPerSlice: 500,           // Health-conscious user
    mustBeVegetarian: false,            // Allows meat toppings
    excludedIngredients: ["pepperoni"], // Personal preference exclusion
    excludedTools: ["knife"],           // Kitchen tool restriction
    maxNumberOfToppings: 6,             // Preference for variety
    minNumberOfToppings: 2              // Minimum complexity requirement
  };

  // Execute POST request to pizza generation API
  // This tests the core business logic of the QuickPizza application
  let res = http.post(
    `${BASE_URL}/api/pizza`,
    JSON.stringify(restrictions),
    {
      headers: {
        'Content-Type': 'application/json',  // Required for JSON payload
        'Authorization': 'token abcdef0123456789', // API authentication
      },
    }
  );

  // Validate API responds successfully
  let success = check(res, {
    "Pizza API responds with 200": (res) => res.status === 200,
    "Response contains pizza data": (res) => res.json().pizza !== undefined,
    "Pizza has a name": (res) => res.json().pizza.name !== undefined,
    "Pizza has ingredients": (res) => res.json().pizza.ingredients && res.json().pizza.ingredients.length > 0
  });

  // Extract and log pizza details
  if (success && res.status === 200) {
    const pizza = res.json().pizza;
    console.log(`🍕 Generated: ${pizza.name} (${pizza.ingredients.length} ingredients)`);
  } else {
    console.error(`❌ Pizza generation failed: Status ${res.status}`);
  }

  // Think time between requests
  sleep(1);
}

/**
 * TEARDOWN FUNCTION - Post-test Cleanup and Reporting
 * =============================================================================
 * Runs ONCE after all VUs have finished executing.
 * 
 * Purpose: Perform cleanup operations, send notifications, or generate reports
 * after the load test completes.
 * 
 * Parameters: Receives the return value from setup() function
 * (not used in this example, but could be setup data, tokens, etc.)
 */
export function teardown() {
  console.log('🏁 Lifecycle test completed successfully!');
  console.log('📊 Check the k6 results for performance metrics');

  // TODO: Implement post-test notifications and cleanup
  // Examples of common teardown activities:
  // - Send Slack notification with test results
  // - Clean up test data from database
  // - Generate and email performance report

  console.log("That's all folks! 🎬");
}
