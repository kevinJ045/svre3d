import GlobalEmitter from "../../misc/globalEmitter.js";
import { PointerLock } from "../../misc/pointerLock.js";
import Markers from "../../objects/markers.js";
import { Biomes } from "../../repositories/biomes.js";
import { PlayerInfo } from "../../repositories/player.js";
import { getChunkType } from "../../world/chunktype.js";
import { THREE } from "enable3d";
export class Map2D {
    static getPlayerDirection() {
        let m = PlayerInfo.entity.object3d.getWorldDirection(new THREE.Vector3()).multiplyScalar(-1);
        return {
            x: m.x,
            y: m.z
        };
    }
    static create(canvas, infoDiv, zoomRange) {
        const ctx = canvas.getContext('2d');
        const chunkSize = 5;
        const playerPosition = { x: PlayerInfo.entity.object3d.position.x, y: PlayerInfo.entity.object3d.position.z };
        let playerDirection = this.getPlayerDirection();
        let offsetX = 0;
        let offsetY = 0;
        let scale = 1;
        let scaledChunkSize = chunkSize * scale;
        let downTime = 0;
        let isPanning = false;
        let startX, startY;
        let currentSquare;
        this.canvas = canvas;
        this.pointerLock = new PointerLock(canvas);
        let squares = [];
        function drawMap() {
            ctx.scale(1, 1);
            scaledChunkSize = chunkSize * scale;
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
            drawArrowCursor(playerScreenX, playerScreenY, 10, Math.atan2(playerDirection.y, playerDirection.x) * 0.25);
            drawMarkers(playerScreenX, playerScreenY);
        }
        function drawArrowCursor(x, y, size, angle) {
            const adjustedSize = size / scale;
            ctx.save(); // Save the current state
            ctx.translate(x, y); // Move to the (x, y) position
            ctx.rotate(angle); // Rotate by the calculated angle
            ctx.fillStyle = Biomes.find(PlayerInfo.entity?.variant)?.biome.colors[0] || '#FF00FF';
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
        function drawCursor(x, y) {
            infoDiv.style.setProperty('--cursor-color', '#ffffff');
            infoDiv.style.left = x + 'px';
            infoDiv.style.top = y + 'px';
        }
        function drawCenter() {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const scaledChunkSize = chunkSize * scale;
            offsetX = centerX - (playerPosition.x / scaledChunkSize) * scale;
            offsetY = centerY - (playerPosition.y / scaledChunkSize) * scale;
            drawMap();
        }
        function drawSquareInfo(hoveredSquare) {
            if (infoDiv) {
                const info = `Mouse Position: (${Math.round(hoveredSquare.x)}, ${Math.round(hoveredSquare.y)})\nPlayer Position: ${PlayerInfo.entity.object3d.position.toArray().map(i => parseInt(i.toString())).join(',')}`;
                infoDiv.innerText = info;
            }
        }
        function setStarts() {
            startX = Map2D.pointerLock.pointer.x - offsetX;
            startY = Map2D.pointerLock.pointer.y - offsetY;
        }
        let downTimeInt;
        function onMouseDown(event) {
            if (!Map2D.pointerLock.isLocked()) {
                downTime = 200;
                return;
            }
            isPanning = true;
            setStarts();
            clearTimeout(downTimeInt);
            downTimeInt = setTimeout(() => downTime = 200, 200);
        }
        let lastPut;
        function wrapCursor(mouseX, mouseY, canvas, rect) {
            // if(lastPut) {
            //   lastPut = false;
            //   return;
            // }
            // if (mouseX - 10 < 0) {
            //   Map2D.pointerLock.movePointer(canvas.width - 11, canvas.height - mouseY);
            //   setStarts();
            //   lastPut = true;
            // } else if (mouseX >= rect.width / 2) {
            //   Map2D.pointerLock.movePointer(0, mouseY);
            //   setStarts();
            //   lastPut = true;
            // } else if (mouseY - 10 < 0) {
            //   Map2D.pointerLock.movePointer(canvas.width - mouseX, canvas.height - 11);
            //   setStarts();
            //   lastPut = true;
            // } else if (mouseY >= rect.height / 2) {
            //   Map2D.pointerLock.movePointer(mouseX, 0);
            //   setStarts();
            //   lastPut = true;
            // }
        }
        function onMouseMove() {
            const rect = canvas.getBoundingClientRect();
            if (isPanning) {
                offsetX = Map2D.pointerLock.pointer.x - startX;
                offsetY = Map2D.pointerLock.pointer.y - startY;
                drawMap();
            }
            else {
                const p = Map2D.pointerLock.pointer;
                const mouseXLock = p.x;
                const mouseYLock = p.y;
                const hoveredSquare = squares.find(square => {
                    return mouseXLock >= square.x && mouseXLock <= square.x + chunkSize * scale &&
                        mouseYLock >= square.y && mouseYLock <= square.y + chunkSize * scale;
                });
                if (hoveredSquare) {
                    currentSquare = hoveredSquare;
                    drawSquareInfo(hoveredSquare);
                }
            }
            const mouseX = Map2D.pointerLock.pointer.x;
            const mouseY = Map2D.pointerLock.pointer.y;
            wrapCursor(mouseX, mouseY, canvas, rect);
            drawCursor(mouseX, mouseY);
        }
        function onMouseUp(event) {
            if (downTime < 200) {
                Markers.add({
                    position: { x: currentSquare.x, y: 10, z: currentSquare.y }
                });
                drawMap();
            }
            isPanning = false;
            downTime = 0;
            clearTimeout(downTimeInt);
        }
        function onWheel(event) {
            event.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const zoomFactor = 1.1;
            const wheel = event.deltaY < 0 ? 1 : -1;
            const zoom = wheel > 0 ? zoomFactor : 1 / zoomFactor;
            const newScale = Math.max(Math.min(scale * zoom, 1.5), 0.075);
            const scaleChange = newScale - scale;
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            offsetX -= mouseX * scaleChange;
            offsetY -= mouseY * scaleChange;
            zoomRange.value = newScale.toString();
            scale = newScale;
            drawMap();
        }
        canvas.addEventListener('dblclick', drawCenter);
        canvas.addEventListener('mousedown', onMouseDown);
        this.pointerLock.addEventListener('move', onMouseMove);
        canvas.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('wheel', onWheel);
        zoomRange.addEventListener('input', () => {
            scale = parseFloat(zoomRange.value);
            drawMap();
        });
        GlobalEmitter.on('player:move', () => {
            playerPosition.x = PlayerInfo.entity.position.x;
            playerPosition.y = PlayerInfo.entity.position.z;
            playerDirection = Map2D.getPlayerDirection();
            drawMap();
        });
        drawCenter();
    }
    static update() { }
}
