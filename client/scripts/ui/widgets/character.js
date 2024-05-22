import * as React from "react";
import { THREE } from "enable3d";
import { PlayerInfo } from "../../repositories/player.js";
import { cloneGltf } from "../../lib/gltfclone.js";
export const Character = ({ activeTab }) => {
    const canvasRef = React.useRef(null);
    React.useEffect(() => {
        // Function to create the canvas content
        const createCanvas = (canvas) => {
            canvas.width = 100;
            canvas.height = 100;
            const renderer = new THREE.WebGLRenderer({
                canvas,
                alpha: true
            });
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(80, canvas.width / canvas.height, 0.5, 1000);
            camera.position.z = -5.2;
            camera.position.y = -1;
            let currentPlayerMesh;
            const addplayer = () => {
                // @ts-ignore
                let player = PlayerInfo.entity?.object3d;
                if (!player)
                    return;
                // @ts-ignore
                if (currentPlayerMesh)
                    scene.remove(currentPlayerMesh);
                currentPlayerMesh = cloneGltf({ scene: player });
                currentPlayerMesh.position.set(0, 0, 0);
                scene.add(currentPlayerMesh);
                let pos = currentPlayerMesh.position;
                pos.y -= 2;
                camera.lookAt(pos);
            };
            addplayer();
            PlayerInfo.entity?.on('equip', () => {
                addplayer();
            });
            PlayerInfo.entity?.on('unequip', () => {
                addplayer();
            });
            const ambientLight = new THREE.AmbientLight(0xffffff);
            scene.add(ambientLight);
            // Add directional light
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
            directionalLight.position.set(0, 1, 1);
            scene.add(directionalLight);
            let angle = 0;
            const rotationSpeed = 0.005;
            function animate() {
                requestAnimationFrame(animate);
                if (activeTab == 'player-info') {
                    renderer.render(scene, camera);
                    if (currentPlayerMesh) {
                        const pos = currentPlayerMesh.position;
                        // Set camera position to rotate around the player
                        const radius = 5; // Radius of the camera orbit
                        const cameraX = pos.x + radius * Math.cos(angle);
                        const cameraZ = pos.z + radius * Math.sin(angle);
                        camera.position.set(cameraX, pos.y, cameraZ);
                        camera.lookAt(pos);
                        angle += rotationSpeed;
                    }
                }
            }
            animate();
        };
        // Call createCanvas function when canvasRef is loaded
        if (canvasRef.current) {
            createCanvas(canvasRef.current);
        }
    });
    return (React.createElement("canvas", { ref: canvasRef, id: "character" }));
};
