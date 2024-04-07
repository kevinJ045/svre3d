import { noise } from "../constant/seed";
import { Chunks } from "../repositories/chunks";

export function generateChunkHeight(x: number, z: number, maxHeight: number, chunkSize: number): number {
	// Scale the coordinates to control the frequency of the noise
	const frequency = 0.1; // Adjust as needed
	const scaledX = x * frequency;
	const scaledZ = z * frequency;

	// Generate Perlin noise value for the given coordinates
	const noiseValue = noise.perlin3(scaledX, 0, scaledZ);

	// Map the noise value to the desired height range
	return Math.round(noiseValue * maxHeight) / 2.5;
}