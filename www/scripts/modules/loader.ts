import { item } from "./models/item"
import { chunktype } from "./world";

export const toload = () : Record<string, Record<string, item> | any> => {
	return {
		
		objects: {
			"m:player": {
				type: "player",
				config: {
					brow: "m:brow-1",
					color: "#09D0D0",
					hat: "m:horn-1"
				},
				resource: {
					type: "gltf",
					src: "/res/obj/player5.glb"
				}
			},
			"m:brow-1":  {
				type: "accessory",
				accessory: {
					type: "brow"
				},
				config: {
					position: {
						x: 0.05,
						y: 0.37,
						z: -0.12
					},
					scale: {
						x: 1,
						y: 1.2,
						z: 1
					}
				},
				resource: {
					type: "gltf",
					src: "/res/obj/brow-1.glb"
				}
			},
			"m:horn-1":  {
				type: "accessory",
				accessory: {
					type: "hat"
				},
				config: {
					position: {
						x: 0,
						// y: 2.31,
						y: 1,
						z: 0
					},
				},
				resource: {
					type: "gltf",
					src: "/res/obj/horn-1.glb"
				}
			},
			"m:segment":  {
				type: "segment",
				resource: {
					type: "gltf",
					src: "/res/obj/segment.glb"
				}
			},
		},


		textures: {
			"m:base_segment": {
				type: "texture",
				resource: {
					type: "texture",
					src: "/res/tex/base_segment.png"
				}
			},
			"m:grass_segment": {
				type: "texture_map",
				resource: {
					type: "texture",
					sources: [
						"/res/tex/segment_grass_top_blue.png",
						"/res/tex/segment_grass_side_blue.png"
					]
				}
			},
		},


		shaders: {
			"m:segment": {
				type: "shader",
				resource: {
					type: "shader",
					fragment: `uniform sampler2D textureMap;
					varying vec2 vUv;
					
					void main() {
							gl_FragColor = texture2D(textureMap, vUv);
					}`,
					vertex: `varying vec2 vUv;
        
					void main() {
							vUv = uv;
							gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
					}`,
					materialOptions: {
						roughness: 0,
						// color: 0x666666
					}
				}
			}
		},

		chunkTypes: [{
			name: "grass",
			item: "m:grass_segment",
			textures: [1, 1, 0, 1, 1, 1]
		}]

	};
}