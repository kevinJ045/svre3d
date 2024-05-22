export class SceneManager {
    static add(object) {
        this.addQueue.push(object);
    }
    static remove(object) {
        this.removeQueue.push(object);
    }
}
SceneManager.addQueue = [];
SceneManager.removeQueue = [];
