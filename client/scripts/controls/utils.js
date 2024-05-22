export default class ControlUtils {
    static glowItems(intersects) {
        const glowItem = (object, remove) => {
            const hi = object => {
                if (Array.isArray(object.material)) {
                    object.material.forEach(mat => {
                        if (remove) {
                            if (mat.userData.originalIntensity) {
                                mat.emissiveIntensity = mat.userData.originalIntensity;
                                delete mat.userData.originalIntensity;
                            }
                        }
                        else if (mat.emissiveIntensity > 0 && !mat.userData.originalIntensity) {
                            mat.userData.originalIntensity = mat.emissiveIntensity;
                            mat.emissiveIntensity = mat.emissiveIntensity * 4;
                        }
                    });
                }
                else {
                    if (remove)
                        if (object.material && object.material.userData.originalIntensity) {
                            object.material.emissiveIntensity = object.material.userData.originalIntensity;
                            delete object.material.userData.originalIntensity;
                        }
                        else if (object.material && object.material.emissiveIntensity > 0 && !object.material.userData.originalIntensity) {
                            object.material.userData.originalIntensity = object.material.emissiveIntensity;
                            object.material.emissiveIntensity = 100;
                        }
                }
            };
            object?.traverse(hi);
        };
        if (!intersects)
            intersects = [];
        if (intersects[0]?.object.name !== 'chunk' && intersects[0]?.object.userData.lootable) {
            const chunkObject = intersects[0].object.parent?.parent;
            if (chunkObject) {
                if (this._glowItems.indexOf(intersects) < 0)
                    this._glowItems.push(intersects);
                glowItem(chunkObject, false);
            }
        }
        this._glowItems.forEach(item => {
            if (intersects[0]?.object.uuid !== item[0].object.uuid) {
                glowItem(item[0].object.parent?.parent, true);
            }
        });
    }
}
ControlUtils._glowItems = [];
