
export type lights = {
	ambientLight: THREE.AmbientLight;
	directionalLight: THREE.DirectionalLight;
	hemisphereLight: THREE.HemisphereLight;
};
export class Lights {
	
	static lights: lights;

	static setLights(
		lights: lights,

	){
		this.lights = lights;
		return this;
	}

	static initLights(){
		const { directionalLight } = this.lights!;

    var d = 100;
    directionalLight.shadow.camera.left = - d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = - d;
    
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 1000000 * 10000;
	}

}