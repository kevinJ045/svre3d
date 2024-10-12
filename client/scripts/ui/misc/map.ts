import GlobalEmitter from "../../misc/globalEmitter.js";
import Markers from "../../objects/markers.js";
import { Biomes } from "../../repositories/biomes.js";
import { PlayerInfo } from "../../repositories/player.js";
import { getChunkType } from "../../world/chunktype.js";
import { THREE } from "enable3d";

export class Map2D {

  static canvas: HTMLCanvasElement;

  static getPlayerDirection() {
    let m = PlayerInfo.entity.object3d.getWorldDirection(new THREE.Vector3()).multiplyScalar(-1);
    return {
      x: m.x,
      y: m.z
    }
  }

  static create(canvas: HTMLCanvasElement, infoDiv: HTMLDivElement, zoomRange: HTMLInputElement) {
    const ctx = canvas.getContext('2d')!;
    const chunkSize = 5;
    let playerDirection = this.getPlayerDirection();
    let offsetX = 0;
    let offsetY = 0;
    let scale = 1;
    let scaledChunkSize = chunkSize * scale;
    let downTime = 0;
    let isPanning = false;
    let startX: number, startY: number;
    let currentSquare: { x: number, y: number, color: string };
    const playerPosition = { x: Math.floor(PlayerInfo.entity.object3d.position.x), y: Math.floor(PlayerInfo.entity.object3d.position.z) };

    this.canvas = canvas;

    let squares: { x: number, y: number, color: string, col: number, row: number, gutX: number, gutY: number }[] = [];

    function drawMap() {
      ctx.scale(1, 1);
      scaledChunkSize = chunkSize * scale;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      squares = [];

      const middle = getPlayerPos();

      // Calculate how many chunks can be shown in the visible area
      const halfCanvasWidth = canvas.width / 2 / scaledChunkSize;
      const halfCanvasHeight = canvas.height / 2 / scaledChunkSize;

      const startCol = Math.floor(-offsetX / scaledChunkSize - halfCanvasWidth);
      const endCol = Math.ceil((canvas.width - offsetX) / scaledChunkSize + halfCanvasWidth);
      const startRow = Math.floor(-offsetY / scaledChunkSize - halfCanvasHeight);
      const endRow = Math.ceil((canvas.height - offsetY) / scaledChunkSize + halfCanvasHeight);

      // Generate chunks starting from the player's chunk (middle) and expand outward
      for (let col = startCol; col <= endCol; col++) {
        for (let row = startRow; row <= endRow; row++) {
          // Calculate the chunk's position in world space
          const worldX = col * scaledChunkSize + offsetX;
          const worldY = row * scaledChunkSize + offsetY;

          // Get the chunk's actual coordinates (rounded to multiples of the chunk size)
          const chunkX = Math.round(col * chunkSize); // Adjust chunkX to world grid
          const chunkY = Math.round(row * chunkSize); // Adjust chunkY to world grid


          // Get the color of the chunk using its chunk coordinates
          const color = getChunkType(chunkX, chunkY, 0.0001, 0); // Get chunk type/color

          // Draw the chunk rectangle on the map
          ctx.fillStyle = color;
          ctx.fillRect(worldX, worldY, scaledChunkSize, scaledChunkSize);

          // Store the chunk information for interactions (like hover)
          squares.push({ x: worldX, y: worldY, row, col, color, gutX: chunkX, gutY: chunkY });
        }
      }

      // Draw player cursor relative to the current offset and zoom level
      const playerScreenX = middle.x * scale + offsetX;
      const playerScreenY = middle.y * scale + offsetY;
      drawArrowCursor(playerScreenX, playerScreenY, 10, Math.atan2(playerDirection.y, playerDirection.x) + (Math.PI / 2));

      // Draw markers relative to the current offset and zoom level
      drawMarkers(playerScreenX, playerScreenY);
    }

    function drawArrowCursor(x: number, y: number, size: number, angle: number) {
      const adjustedSize = size;

      // ctx.fillStyle = '#09D0D0';
      // ctx.beginPath();
      // ctx.arc(x, y, 5, 0, 2 * Math.PI);
      // ctx.fill();

      ctx.save(); // Save the current state
      ctx.translate(x - (adjustedSize / 2), y - (adjustedSize / 2)); // Move to the (x, y) position
      ctx.rotate(angle); // Rotate by the calculated angle

      // @ts-ignore
      ctx.fillStyle = "#FFFFFF" || Biomes.find(PlayerInfo.entity?.variant)?.biome.colors[0] || '#FF00FF';
      ctx.beginPath();

      // Arrowhead coordinates
      ctx.moveTo(0, -adjustedSize); // Top point
      ctx.lineTo(adjustedSize, adjustedSize); // Bottom right
      ctx.lineTo(0, 0); // Center
      ctx.lineTo(-adjustedSize, adjustedSize); // Bottom left

      ctx.closePath();
      ctx.fill();

      ctx.restore(); // Restore the previous state
    }

    function drawMarkers(x, y) {
      Markers.markers.forEach(marker => {
        const markerScreenX = (marker.position.x / (chunkSize * scale)) + offsetX;
        const markerScreenY = (marker.position.z / (chunkSize * scale)) + offsetY;

        ctx.fillStyle = marker.color || '#FFFFFF';
        ctx.beginPath();
        ctx.arc(markerScreenX, markerScreenY, 5 / scale, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = marker.color || '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(markerScreenX, markerScreenY);
        ctx.stroke();
      });
    }

    function drawCursor(x: number, y: number) {
      infoDiv.style.setProperty('--cursor-color', '#ffffff');
      infoDiv.style.left = x + 'px';
      infoDiv.style.top = y + 'px';
    }

    function getPlayerPos() {
      // Get the player's chunk position by dividing their world position by the chunk size (which is 5 in this case)
      const playerChunkX = Math.floor(playerPosition.x / chunkSize) * chunkSize;
      const playerChunkZ = Math.floor(playerPosition.y / chunkSize) * chunkSize;

      // Scale the chunk position for rendering in the 2D map, adjusted with the offset and scale
      return {
        x: (playerChunkX / chunkSize) * scaledChunkSize,
        y: (playerChunkZ / chunkSize) * scaledChunkSize,
      };
    }

    function drawCenter() {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const scaledChunkSize = chunkSize * scale;


      offsetX = centerX - (getPlayerPos().x) * scale;
      offsetY = centerY - (getPlayerPos().y) * scale;

      drawMap();
    }

    function drawSquareInfo(hoveredSquare) {
      if (infoDiv) {
        const info = `Mouse Position: (${Math.round(hoveredSquare.x)}, ${Math.round(hoveredSquare.y)})\nPlayer Position: ${PlayerInfo.entity.object3d.position.toArray().map(i => parseInt(i.toString())).join(',')}`;
        infoDiv.innerText = info;
      }
    }

    function setStarts(event) {
      startX = event.clientX - offsetX;
      startY = event.clientY - offsetY;
    }

    let downTimeInt;
    function onMouseDown(event) {
      isPanning = true;
      setStarts(event);
      clearTimeout(downTimeInt);
      downTimeInt = setTimeout(() => downTime = 200, 200);
    }

    function onMouseMove(event) {
      if (isPanning) {
        offsetX = event.clientX - startX;
        offsetY = event.clientY - startY;
        drawMap();
      } else {
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        const hoveredSquare = squares.find(square => {
          return mouseX >= square.x && mouseX <= square.x + chunkSize * scale &&
            mouseY >= square.y && mouseY <= square.y + chunkSize * scale;
        });

        if (hoveredSquare) {
          currentSquare = hoveredSquare;
          drawSquareInfo(hoveredSquare);
        }
      }

      // drawCursor(event.clientX, event.clientY);
    }

    function onMouseUp(event) {
      if (downTime < 200) {
        // Add markers logic if needed
      }
      isPanning = false;
      downTime = 0;
      clearTimeout(downTimeInt);
    }

    function onWheel(event) {
      event.preventDefault();

      const zoomFactor = 1.1;
      const wheel = event.deltaY < 0 ? 1 : -1;
      const zoom = wheel > 0 ? zoomFactor : 1 / zoomFactor;

      const newScale = Math.max(Math.min(scale * zoom, 1.5), 0.075);
      const scaleChange = newScale - scale;

      const mouseX = event.clientX - canvas.getBoundingClientRect().left;
      const mouseY = event.clientY - canvas.getBoundingClientRect().top;

      offsetX -= mouseX * scaleChange;
      offsetY -= mouseY * scaleChange;

      zoomRange.value = newScale.toString();
      scale = newScale;

      drawMap();
    }

    canvas.addEventListener('dblclick', drawCenter);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel);

    zoomRange.addEventListener('input', () => {
      scale = parseFloat(zoomRange.value);
      drawMap();
    });

    GlobalEmitter.on('player:move', () => {
      playerPosition.x = Math.floor(PlayerInfo.entity.position.x);
      playerPosition.y = Math.floor(PlayerInfo.entity.position.z);
      playerDirection = Map2D.getPlayerDirection();
      // drawMap();
    });

    GlobalEmitter.on('drawMap', () => {
      drawMap();
    });

    GlobalEmitter.on('menu:open', () => {
      drawMap();
    });

    drawCenter();
  }

  static redraw(){
    GlobalEmitter.emit('drawMap');
  }

  static update() { }
}
