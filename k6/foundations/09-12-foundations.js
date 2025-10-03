// Topics to review: 
// - SharedArray
// - LoadAndCheck
// - Load Options

import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Counter } from "k6/metrics";
// https://grafana.com/docs/k6/latest/javascript-api/k6-data/sharedarray/
import { SharedArray } from 'k6/data';
import { LoadAndCheck } from "./lib/frontend/basic.js";
import { StressStages, SmokeOptions } from "./lib/load-options.js";

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3333';

export const options = {

    scenarios: {
        smoke: {
            exec: "getPizza",
            executor: "constant-vus",
            // We use the SmokeOptions from the load-options.js file
            vus: SmokeOptions.vus,
            duration: SmokeOptions.duration,
        },
        browser: {
            exec: "checkFrontend",         // Browser function for UI testing
            executor: "constant-vus",      // Steady browser load
            vus: 1,                        // 1 browser user (resource-intensive)
            duration: "15s",               // Run for 15 seconds
            options: {
                browser: {
                    type: "chromium",           // Real Chromium browser engine. You need to have a chromium browser installed.
                },
            },
            // Starts immediately (0s) - Runs in PARALLEL with API smoke test!
        },
        stress: {
            exec: "getPizza",
            executor: "ramping-vus",
            stages: StressStages,
            startTime: "20s",
        }
    },
    thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<500', 'p(99)<1000'],
        quickpizza_ingredients: [{ threshold: 'avg<8', abortOnFail: false }],
        checks: ["rate > 0.95"]
    }
}

const pizzas = new Counter('quickpizza_number_of_pizzas');
const ingredients = new Trend('quickpizza_ingredients');

// Attempting to instantiate a SharedArray outside of the init context results in the exception new SharedArray must be called in the init context.
const tokens = new SharedArray('all tokens', function () {
    return JSON.parse(open('./data/tokens.json')).tokens;
});

export function setup() {
    console.log("Setup: Verifying QuickPizza availability before running scenarios...");
    console.log(`📊 Data Info: Loaded ${tokens.length} authentication tokens from tokens.json`);
    console.log('🎲 Test Strategy: Each request will randomly select from available tokens');
    let res = http.get(BASE_URL);
    if (res.status !== 200) {
        throw new Error(`Setup failed: Got unexpected status code ${res.status} when trying to setup. Exiting.`);
    }
    console.log("Setup: QuickPizza is available. Ready to run smoke scenarios.");
}

export function getPizza() {
    let restrictions = {
        maxCaloriesPerSlice: 500,
        mustBeVegetarian: false,
        excludedIngredients: ["pepperoni"],
        excludedTools: ["knife"],
        maxNumberOfToppings: 6,
        minNumberOfToppings: 2
    }
    // Randomly select a token from the shared array
    const selectedToken = tokens[Math.floor(Math.random() * tokens.length)];
    let res = http.post(`${BASE_URL}/api/pizza`, JSON.stringify(restrictions), {
        headers: {
            'Content-Type': 'application/json',
            // Add the selected token to the request headers
            'Authorization': 'Token ' + selectedToken,
        },
    });
    check(res, { "status is 200": (res) => res.status === 200 });

    const pizzaData = res.json().pizza;
    const ingredientCount = pizzaData.ingredients.length;

    pizzas.add(1);
    ingredients.add(ingredientCount);

    console.log(`🍕 [Token: ${selectedToken.substring(0, 8)}...] ${pizzaData.name} (${ingredientCount} ingredients)`);
    sleep(1);
}

export async function checkFrontend() {
    await LoadAndCheck(BASE_URL, true);
}

export function teardown() {
    console.log("Teardown: Cleaning up after smoke scenarios...");
}
