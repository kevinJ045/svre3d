import { Mesh, Vector3, MeshPhysicalMaterial, BoxGeometry } from 'three';
import { ConvexGeometry } from './node_modules/three/examples/jsm/geometries/ConvexGeometry.js';
import fs from 'fs';
import delaunay from 'delaunay-triangulate';

function createCrystal() {
  // Create a random-ish shape using ConvexGeometry
  const points = [];
  const numPoints = 20; // Adjust the number of points for the crystal shape

  for (let i = 0; i < numPoints; i++) {
    const randomX = Math.random() * 2 - 1;
    const randomY = Math.random() * 2 - 1;
    const randomZ = Math.random() * 2 - 1;
    points.push(new Vector3(randomX, randomY, randomZ));
  }

  const geometry = new ConvexGeometry(points);

  // Crystal material
  const crystalMaterial = new MeshPhysicalMaterial({
    color: 0xFFA500, // Orange-ish color
    emissive: 0xFFA500, // Emissive color for glow
    emissiveIntensity: 1, // Adjust intensity for glow
    transparent: true, // Enable transparency
    opacity: 0.8, // Adjust opacity for transparency
    roughness: 0.5, // Adjust roughness
    metalness: 0.5, // Adjust metalness
  });

  // Create the crystal mesh
  const crystalMesh = new Mesh(geometry, crystalMaterial);

  // Rotate the crystal to make it look like it's on the ground
  crystalMesh.rotation.x = Math.PI / 4;
  crystalMesh.rotation.y = Math.PI / 4;

  crystalMesh.scale.set(0.15, 0.15, 0.15);

  return crystalMesh;
}

function exportOBJ(mesh, filename) {
  const objContent = generateOBJ(mesh);
  fs.writeFileSync(filename, objContent);
}

function generateOBJ(mesh) {
  const positions = mesh.geometry.attributes.position;
  const vertices = [];
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    vertices.push([x, y, z]);
  }

  // Triangulate vertices
  const faces = delaunay(vertices);

  const verticesStr = vertices.map(v => `v ${v[0]} ${v[1]} ${v[2]}`).join('\n');
  const facesStr = faces.map(face => `f ${face[0] + 1} ${face[1] + 1} ${face[2] + 1}`).join('\n');

  return `# OBJ file\n${verticesStr}\n${facesStr}`;
}

// Usage
for(let i = 0; i < 10; i++){
	const crystalMesh = new Mesh(new BoxGeometry(1, 1, 1));
	exportOBJ(crystalMesh, 'objFromCode/crystal-'+i+'.obj');
}
