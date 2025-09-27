import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Counter } from "k6/metrics";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.2/index.js";

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3333';

// Multi-scenario test configuration:
export const options = {
    // https://grafana.com/docs/k6/latest/using-k6/scenarios/
    scenarios: {
        // Smoke load test: https://grafana.com/blog/2024/01/30/smoke-testing/
        smoke: {
            exec: "getPizza",  //Name of exported JS function to execute.
            executor: "constant-vus", // it sends VUs at a constant number.
            vus: 1,
            duration: "10s",
        },
        stress: {
            exec: "getPizza",
            executor: "ramping-vus", // it ramps the number of VUs according to your configured stages.
            stages: [
                { duration: '5s', target: 5 }, // Ramp-up: 0→5 VUs (1 VU/second increase)
                { duration: '10s', target: 5 }, // Steady: Hold 5 VUs (test stability)
                { duration: '5s', target: 0 }, // Ramp-down: 5→0 VUs (1 VU/second decrease)
            ],
            startTime: "20s", // it waits for the smoke test to complete before starting the stress test.
        }
    },
    thresholds: {
        // Infrastructure reliability across all scenarios
        http_req_failed: ['rate<0.01'],
        // Performance requirements across all scenarios
        http_req_duration: ['p(95)<500', 'p(99)<1000'],
        // Application-specific metrics across all scenarios
        quickpizza_ingredients: [{ threshold: 'avg<8', abortOnFail: false }],
        // This will fail the test if the rate is less than 0.95
        checks: ["rate > 0.95"]
    }
}

// Custom metrics:
const pizzas = new Counter('quickpizza_number_of_pizzas');
const ingredients = new Trend('quickpizza_ingredients');

// Setup phase: Pre-test validation executed once before all scenarios
export function setup() {
    console.log("Setup: Verifying QuickPizza availability before running scenarios...");
    let res = http.get(BASE_URL);
    if (res.status !== 200) {
        throw new Error(`Setup failed: Got unexpected status code ${res.status} when trying to setup. Exiting.`);
    }
    console.log("Setup: QuickPizza is available. Ready to run smoke scenarios.");
}

// Exported function to be executed in the scenarios
export function getPizza() {
    let restrictions = {
        maxCaloriesPerSlice: 500,
        mustBeVegetarian: false,
        excludedIngredients: ["pepperoni"],
        excludedTools: ["knife"],
        maxNumberOfToppings: 6,
        minNumberOfToppings: 2
    }
    let res = http.post(`${BASE_URL}/api/pizza`, JSON.stringify(restrictions), {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'token abcdef0123456789',
        },
    });
    check(res, { "status is 200": (res) => res.status === 200 });

    const pizzaData = res.json().pizza;
    const ingredientCount = pizzaData.ingredients.length;

    pizzas.add(1);
    ingredients.add(ingredientCount);

    console.log(`${res.json().pizza.name} (${res.json().pizza.ingredients.length} ingredients)`);
    // Simulate think time: https://grafana.com/docs/k6/latest/using-k6-browser/recommended-practices/simulate-user-input-delay/
    sleep(1);
}

// Teardown phase: Post-test cleanup executed once after all scenarios
export function teardown() {
    console.log("Teardown: Cleaning up after smoke scenarios...");
}

// What to monitor when the stages scenario is running: 
// DASHBOARD ANALYSIS:
//  * 📊 Overview Tab:
//  *   - http_req_duration (p95): Should stay < 500ms for good user experience
//  *   - http_req_failed: Should remain < 0.1% for reliable service  
//  *   - Request Rate: Should ramp from 0→20→0 RPS following stage pattern
//  *   - Virtual Users: Should show clear ramp-up/steady/ramp-down pattern
//  * 
//  * 📊 Timings Tab:
//  *   - http_req_waiting (TTFB): Backend processing time, target < 200ms
//  *   - http_req_connecting: Should be minimal with connection reuse
//  *   - http_req_blocked: Should stay low, watch for connection pool issues
//  * 
//  * 📊 Summary Tab:
//  *   - checks: Should be 100% (all validations passed)
//  *   - http_reqs: Total request count should match expected volume
//  *   - iteration_duration: Should be ~1 second (due to sleep(1))
//  * 
//  * PERFORMANCE THRESHOLDS TO WATCH:
//  * ✅ Good: p95 < 500ms, 0% errors, stable request rate
//  * ⚠️  Warning: p95 500ms-1s, <0.1% errors, slight rate variations  
//  * ❌ Critical: p95 > 1s, >1% errors, significant rate drops 