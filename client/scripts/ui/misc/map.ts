import { PlayerInfo } from "../../repositories/player.js";
import { ResourceMap } from "../../repositories/resources.js";
import { getChunkType } from "../../world/chunktype.js";
import { WorldData } from "../../world/data.js";


export class Map2D {

  static canvas: HTMLCanvasElement;

  static create(canvas: HTMLCanvasElement, infoDiv: HTMLDivElement, zoomRange: HTMLInputElement) {
    const ctx = canvas.getContext('2d')!;
    const chunkSize = 5;
    const playerPosition = { x: PlayerInfo.entity.object3d.position.x, y: PlayerInfo.entity.object3d.position.z };
    let offsetX = 0;
    let offsetY = 0;
    let scale = 1;
    let isPanning = false;
    let startX: number, startY: number;

    this.canvas = canvas;

    let squares: {x: number, y: number, color: string, col: number, row: number}[] = [];

    function drawMap() {
			ctx.scale(1, 1);
      const scaledChunkSize = chunkSize * scale;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      squares = [];

      const startCol = Math.floor(-offsetX / scaledChunkSize);
      const endCol = Math.floor((canvas.width - offsetX) / scaledChunkSize);
      const startRow = Math.floor(-offsetY / scaledChunkSize);
      const endRow = Math.floor((canvas.height - offsetY) / scaledChunkSize);

      for (let col = startCol; col <= endCol; col++) {
        for (let row = startRow; row <= endRow; row++) {
          const x = col * scaledChunkSize + offsetX;
          const y = row * scaledChunkSize + offsetY;
          const color = getChunkType(col, row, 0.02, 0);

          ctx.fillStyle = color;
          ctx.fillRect(x, y, scaledChunkSize, scaledChunkSize);
          squares.push({ x, y, row, col, color });
        }
      }

      const playerScreenX = (playerPosition.x / scaledChunkSize) * scale + offsetX;
      const playerScreenY = (playerPosition.y / scaledChunkSize) * scale + offsetY;

      ctx.fillStyle = '#FF00FF';
      ctx.beginPath();
      ctx.arc(playerScreenX, playerScreenY, 5, 0, 2 * Math.PI);
      ctx.fill();
    }

    function drawCenter() {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      offsetX = centerX - (playerPosition.x * scale);
      offsetY = centerY - (playerPosition.y * scale);

      drawMap();
    }

    function drawSquareInfo(hoveredSquare) {
      if (infoDiv) {
        const info = `Position: (${Math.round(hoveredSquare.x)}, ${Math.round(hoveredSquare.y)})`;
        infoDiv.innerText = info;
      }
    }

    canvas.addEventListener('dblclick', () => {
      drawCenter();
    });

    canvas.addEventListener('mousedown', (e) => {
			const rect = canvas.getBoundingClientRect();
			isPanning = true;
			startX = e.clientX - rect.left - offsetX;
			startY = e.clientY - rect.top - offsetY;
		});
		
		canvas.addEventListener('mousemove', (e) => {
			const rect = canvas.getBoundingClientRect();
			if (isPanning) {
				offsetX = e.clientX - rect.left - startX;
				offsetY = e.clientY - rect.top - startY;
				drawMap();
			} else {
				const mouseX = e.clientX - rect.left;
				const mouseY = e.clientY - rect.top;

        // Find the square that the mouse is currently hovering over
        const hoveredSquare = squares.find(square => {
          return mouseX >= square.x && mouseX <= square.x + chunkSize * scale &&
            mouseY >= square.y && mouseY <= square.y + chunkSize * scale;
        });

        if (hoveredSquare) {
          drawSquareInfo(hoveredSquare);
        }
      }
    });

    canvas.addEventListener('mouseup', () => {
      isPanning = false;
    });

    canvas.addEventListener('mouseout', () => {
      isPanning = false;
    });

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
			const rect = canvas.getBoundingClientRect();

      const zoomFactor = 1.1;

      const wheel = e.deltaY < 0 ? 1 : -1;
      const zoom = wheel > 0 ? zoomFactor : 1 / zoomFactor;

      const newScale = Math.max(Math.min(scale * zoom, 1.5), 0.075);
      const scaleChange = newScale - scale;

			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;

      offsetX -= mouseX * scaleChange;
      offsetY -= mouseY * scaleChange;

			zoomRange.value = newScale.toString();
			scale = newScale;

      drawMap();
    });

    if (zoomRange) {
      zoomRange.addEventListener('input', () => {
        scale = parseFloat(zoomRange.value);
        drawMap();
      });
    }

    drawCenter();
  }

	static update(){}
}