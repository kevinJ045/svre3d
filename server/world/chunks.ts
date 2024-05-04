import { noise } from "../constant/seed.js";
import { Chunks } from "../repositories/chunks.js";

export function generateChunkHeight(x: number, z: number, maxHeight: number, chunkSize: number): number {
	// Scale the coordinates to control the frequency of the noise
	const frequency = 0.01; // Adjust as needed
	const scaledX = x * frequency;
	const scaledZ = z * frequency;

	// Generate Perlin noise value for the given coordinates
	const noiseValue = noise.perlin3(scaledX, 0, scaledZ);

	// Map the noise value to the desired height range
	const normalizedValue = (noiseValue + 1) / 2; // Map noise value from [-1, 1] to [0, 1]
  const height = Math.round(normalizedValue * maxHeight);

	return height;
}