import * as Noise from 'noisejs';
import seedrandom from 'seedrandom';
export class Seed {
    static setSeed(seed) {
        this.seed = seed;
        this.rng = seedrandom(seed);
        this.noise = new Noise.Noise(this.rng());
    }
}
