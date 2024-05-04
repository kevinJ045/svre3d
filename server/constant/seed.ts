import * as Noise from 'noisejs'; 
import seedrandom from 'seedrandom';
import { worldData } from './world.js';

export const seedrng = seedrandom(worldData.seed);
export const noise = new Noise.Noise(seedrng());