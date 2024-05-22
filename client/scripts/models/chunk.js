import { ChunkData } from "../../../server/models/chunk.js";
import { stringifyChunkPosition } from "../common/chunk.js";
export class Chunk extends ChunkData {
    stringify() {
        return stringifyChunkPosition(this.position);
    }
    setMesh(object3d) {
        this.object3d = object3d;
    }
}
