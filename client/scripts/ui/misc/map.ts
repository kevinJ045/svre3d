import { PlayerInfo } from "../../repositories/player";
import { ResourceMap } from "../../repositories/resources";
import { getChunkType } from "../../world/chunktype";
import { WorldData } from "../../world/data";
import { Seed } from "../../world/seed";



export class Map2D {

	static canvas: HTMLCanvasElement;

	static activeTab: any;

	static create(canvas: HTMLCanvasElement){
    const ctx = canvas.getContext('2d')!;
    const width = canvas.width;
    const height = canvas.height;
		const chunkSize = WorldData.get('chunkSize');

		this.canvas = canvas;

		const mapOffset = { x: 0, y: 0 };
		let scale = 0.001;

		const playerIcon = ResourceMap.find('m:player_marker')!.load;

		const init = () => {

			if(this.activeTab != 'map') return;

			const X = mapOffset.x;
			const Y = mapOffset.y;
	
			const playerPosition = PlayerInfo.entity.object3d.position;
	
			const half_height = height / 2;
			const half_width = width / 2;
			const playerX = Math.floor(playerPosition.x / chunkSize) * chunkSize;
			const playerZ = Math.floor(playerPosition.z / chunkSize) * chunkSize;
	
			for (let z = playerZ - half_height + Y; z < playerZ + half_height + Y; z += chunkSize) {
				for (let x = playerX - half_width + X; x < playerX + half_width + X; x += chunkSize) {
					const offset = 0;
					const noiseValue = Seed.noise.perlin2((x + offset) * scale, (z + offset) * scale);
					const color = getChunkType(noiseValue);
					// const scaleDelta = Math.abs(scale - 0.01) * 100;
					ctx.fillStyle = color;
					// ctx.strokeStyle = 'black'; // Set border color
    			// ctx.lineWidth = 1;
					ctx.fillRect(x + half_width - playerX - X, z + half_height - playerZ - Y, chunkSize, chunkSize);
					// ctx.strokeRect(x + half_width - playerX - X, z + half_height - playerZ - Y, chunkSize, chunkSize);
				}
			}
			
			const playerIndicatorX = half_width - X + (playerPosition.x % chunkSize);
			const playerIndicatorZ = half_height - Y + (playerPosition.z % chunkSize);

			// Draw the player icon at the calculated position
			ctx.drawImage(playerIcon, playerIndicatorX - playerIcon.width / 2, playerIndicatorZ - playerIcon.height / 2);
			
		}
		

		let isDragging = false;
		let lastX = 0;
		let lastY = 0;

		canvas.addEventListener('mousedown', (event) => {
			isDragging = true;
			lastX = event.clientX;
			lastY = event.clientY;
		});

		canvas.addEventListener('mousemove', (event) => {
			if (!isDragging) return;

			const deltaX = event.clientX - lastX;
			const deltaY = event.clientY - lastY;

			// Update mapOffset based on deltaX and deltaY
			mapOffset.x -= deltaX * 3;
			mapOffset.y -= deltaY * 3;

			lastX = event.clientX;
			lastY = event.clientY;
		});

		canvas.addEventListener('mouseup', (e) => {
			isDragging = false;
		});

		canvas.addEventListener('dblclick', () => {
			mapOffset.x = mapOffset.y = 0;
		});

		canvas.addEventListener('wheel', (event) => {
			const scaleChange = event.deltaY > 0 ? 0.0001 : -0.0001;
			scale += scaleChange;
			scale = Math.max(0.0001, Math.min(0.1, scale));
		});

    canvas.addEventListener('reinit', (event) => {
			init();
		});
	}

	static update(){
		if(this.canvas instanceof HTMLCanvasElement)
			this.canvas.dispatchEvent(new Event('reinit'));
	}

}