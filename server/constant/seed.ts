import * as Noise from 'noisejs'; 
import seedrandom from 'seedrandom';

export const seedrng = seedrandom('joeman');
export const noise = new Noise.Noise(seedrng());