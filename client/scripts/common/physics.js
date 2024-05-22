import { SceneManager } from "./sceneman.js";
export class PhysicsManager {
    static addPhysics(mesh, options = {
        shape: 'concave',
    }) {
        SceneManager.scene.physics.add.existing(mesh, options);
    }
    static destroy(mesh) {
        SceneManager.scene.physics.destroy(mesh.body);
    }
}
