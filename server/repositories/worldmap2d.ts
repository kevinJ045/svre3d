import { Biomes } from "./biomes.js";
import { Chunks } from "./chunks.js";
import { Sockets } from "../ping/sockets.js";
import { ping, pingFrom } from "../ping/ping.js";

type xz = [x: number, z: number];
export class WorldMap2D {
    
  static generate(pos: xz, rad: number) {
    const [centerX, centerZ] = pos;
    const positions: {x: number, z: number,biome: any}[] = [];

    for (let x = centerX - rad; x <= centerX + rad; x++) {
      for (let z = centerZ - rad; z <= centerZ + rad; z++) {
        // Get biome for each position
        const flags = [];
        const biome = Biomes.getBiome(x, z, flags);

        // Push position and biome to the array
        positions.push({
          x,
          z,
          biome: biome.reference.biome
        });
      }
    }

    // Sort the positions array by x and then z to ensure it's sorted
    positions.sort((a, b) => a.x - b.x || a.z - b.z);

    return positions;
  }

  static startLiveUpdates(socket) {
    pingFrom(socket, 'worldmap:fetch', (data: { position: xz, radius: number }) => {
      const { position, radius } = data;

      console.log(position, radius);

      const mapData = WorldMap2D.generate(position, radius);

      ping(socket, 'worldmap:data', mapData);
    });
  }
}
