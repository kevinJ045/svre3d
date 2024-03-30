export type item = {
	type: string,
	config?: Record<string, any>,
	resource: {
		type: "texture",
		sources: string[],
		src?: string
	} | {
		type: "shader",
		vertex: string,
		fragment: string,
		sources?: string[],
		src?: string
	} | {
		type: string,
		src: string,
		sources?: string[]
	},
	mesh?: THREE.Object3D,
	[key: string]: any
}