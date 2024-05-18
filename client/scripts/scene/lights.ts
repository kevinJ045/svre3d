import { THREE } from "enable3d";


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
		const { directionalLight, ambientLight, hemisphereLight } = this.lights!;

		// ambientLight.intensity = 2;

		const intensity = 4;
		
		hemisphereLight.intensity = intensity / 3;
		ambientLight.intensity = intensity / 3;
		directionalLight.intensity = Math.floor(intensity / 2);
		hemisphereLight.color = new THREE.Color(0xffffff);

    var d = 20;
		directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = - d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = - d;

    
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 10000;

		// directionalLight.shadow.camera.
	}

	static updateLightPosition(v: THREE.Vector3){
		const { directionalLight } = this.lights!;
		if(!directionalLight.userData.offset) directionalLight.userData.offset = directionalLight.position.clone();
		const pos = v.clone().sub(directionalLight.target.position);
		directionalLight.target.position.add(
			pos
		);
		directionalLight.target.updateMatrixWorld();
		const pos2 = v.clone().sub(directionalLight.position);
		directionalLight.position.add(
			pos2.add(directionalLight.userData.offset)
		);
		directionalLight.updateMatrixWorld();
	}

}