import http from "k6/http";
import { check, sleep } from "k6";



const BASE_URL = __ENV.BASE_URL || 'http://localhost:3333';

// Stages are used to simulate a load profile.
// Duration is the time for the stage to run.
// Target is the number of virtual users to simulate. In this case, we start from 0 to 20 virtual users in 30 seconds, then we keep 20 virtual users for 60 seconds, and then we ramp down to 0 virtual users in 30 seconds.
export const options = {
  stages: [
    { duration: '5s', target: 20 },  // Slower ramp-up for better visibility
    { duration: '20s', target: 20 },  // Longer steady state
    { duration: '5s', target: 0 },   // Slower ramp-down
  ],
};

export default function () {
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
  console.log(`${res.json().pizza.name} (${res.json().pizza.ingredients.length} ingredients)`);
  // Sleep for 1 second to simulate a real-world scenario. 
  sleep(1);
}
