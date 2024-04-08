import { stringifyChunkPosition } from "../common/chunk";
import { ChunkData } from "../models/chunk";
import { xyz } from "../models/misc.xyz";
import { pingFrom } from "../ping/ping";
import { generateChunkHeight } from "../world/chunks";
import { Biomes } from "./biomes";


export class Chunks {

	static chunks: ChunkData[] = [];

	static maxHeight = 5;
	static chunkSize = 5;

	static loadChunk(position: xyz){
		if(this.has(stringifyChunkPosition(position))) return this.find(stringifyChunkPosition(position));
		position.y = generateChunkHeight(position.x, position.z, this.maxHeight, this.chunkSize);

		const chunk = ChunkData.create<ChunkData>(ChunkData, { position, chunkSize: this.chunkSize, biome: Biomes.getBiome(position.x, position.z).reference });

		this.chunks.push(chunk);

		return chunk;
	}

	static unloadChunk(position: xyz){
		this.delete(stringifyChunkPosition(position));
	}

	static clear(){
		this.chunks = [];
		return this;
	}

	static find(key: string){
		return this.chunks.find(i => i.stringify() == key);
	}

	static at(index: number){
		return this.chunks.at(index);
	}

	static index(found: any){
		return this.chunks.indexOf(found);
	}

	static entries(){
		return [...this.chunks];
	}

	static has(key: string){
		return this.find(key) ? true : false;
	}

	static delete(key: string){
		const found = this.find(key);
		if(found){
			this.chunks.splice(this.index(found), 1);
		}
		return this;
	}


	static startPing(socket, serverData){
		pingFrom(socket, 'chunk:request', ({position, type}) => {

			const chunk = type == 'load' ? Chunks.loadChunk(position) : Chunks.unloadChunk(position);
			socket.broadcast.emit('chunk:'+type, chunk || position);
			socket.emit('chunk:'+type, chunk || position);
			return chunk;
		});
	}
}