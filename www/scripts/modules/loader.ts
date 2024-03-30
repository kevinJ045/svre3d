import { item } from "./models/item"

export const toload = () : Record<string, Record<string, item>> => {
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
					src: "",
					sources: [
						"/res/tex/segment_grass_top.png",
						"/res/tex/segment_grass_side.png"
					]
				}
			},
		},

	};
}