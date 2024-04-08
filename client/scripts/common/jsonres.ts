

export type jsonres = {
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
		materialOptions?: Record<string, any>,
		sources?: string[],
		src?: string
	} | {
		type: string,
		src: string,
		sources?: string[]
	},
	id: string,
	load?: any,
	[key: string]: any
}