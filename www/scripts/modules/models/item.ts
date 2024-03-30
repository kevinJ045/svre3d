export type item = {
	type: string,
	config?: Record<string, any>,
	resource: {
		type: string,
		src: string,
		sources?: string[]
	},
	mesh?: THREE.Object3D,
	[key: string]: any
}