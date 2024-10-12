import * as Noise from 'noisejs'; 
import seedrandom from 'seedrandom';

export class Seed {

	static seed: string;
	static rng: () => number;
	static noise: Noise.Noise;

	static setSeed(seed: string){
		if(this.seed) return;
		this.seed = seed;
		this.rng = seedrandom(seed);
		this.noise = new Noise.Noise(this.rng());
	}

	static removeSeed(){
		this.seed = "";
	}

}