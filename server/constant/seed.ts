import seedrandom from 'seedrandom';
import { worldData } from './world.js';
import { Noise } from '../lib/noise/index.js';

export const seedrng = seedrandom(worldData.seed);
export const noise = new Noise(seedrng());