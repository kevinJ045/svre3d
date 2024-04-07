import * as Noise from 'noisejs'; 
import seedrandom from 'seedrandom';

export const seedrng = seedrandom('hello');
export const noise = new Noise.Noise(seedrng());