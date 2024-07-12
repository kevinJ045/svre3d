import { EntityClasses } from "../server/repositories/classes";


const classes = {
  elite: { chance: 0.03 },
  common: { chance: 0.77 },
  uncommon: { chance: 0.20 }
}

const results = { common: 0, elite: 0, uncommon: 0 };
const totalRuns = 10000;

for (let i = 0; i < totalRuns; i++) {
  const seed = -29;
  const selectedClass = EntityClasses._selectClass(classes);
  if(selectedClass) results[selectedClass]++;
}

console.log(results);