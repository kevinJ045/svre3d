function selectMultipleBasedOnChance(drops, numSelections) {
  // Calculate the total sum of chances
  let totalChance = 0;
  for (const drop of drops) {
    totalChance += drop.chance || 1; // Default chance is 1 if not provided
  }

  // Array to hold the selected items
  const selectedItems = [];

  // Select multiple items based on the number of selections requested
  for (let i = 0; i < numSelections; i++) {
    // Generate a random number between 0 and totalChance
    const randomNumber = Math.random() * totalChance;

    // Determine which item to select based on the random number
    let cumulativeChance = 0;
    for (const drop of drops) {
      // Add the current drop's chance to the cumulative chance
      cumulativeChance += drop.chance || 1;
      // If the random number is less than or equal to the cumulative chance, select the drop
      if (randomNumber <= cumulativeChance) {
        selectedItems.push(drop);
        break;
      }
    }
  }

  // Return the array of selected items
  return selectedItems;
}

// Example usage:
const drops = [
  { id: "item1", quantity: 10, chance: 1 },
  { id: "item2", quantity: 20, chance: 0.5 },
  { id: "item3", quantity: 15, chance: 0.3 },
  { id: "item3", quantity: 15, chance: 0.1 },
  { id: "item4", quantity: 25 } // default chance is 1
];

// Set the number of items you want to select
const numSelections = 10;

const selectedItems = selectMultipleBasedOnChance(drops, numSelections);
console.log("Selected items:", selectedItems);

import seedrandom from 'seedrandom';
const rng = seedrandom('ss');

function weightedRandomSelect(weights, seed) {
  const randomValue = rng()//Math.random();
  let cumulative = 0;

  for (const [key, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (randomValue <= cumulative) {
      return key;
    }
  }
}

const classes = {
  a: 0.03,
  b: 0.77,  // adjusted to ensure the total is 1.00
  c: 0.20
};

const results = { a: 0, b: 0, c: 0 };
const totalRuns = 10000;

for (let i = 0; i < totalRuns; i++) {
  const seed = -29;
  const selectedClass = weightedRandomSelect(classes, seed);
  results[selectedClass]++;
}

console.log(results);