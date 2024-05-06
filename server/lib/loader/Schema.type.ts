export type ResourceSchema = {
  manifest: {
    id: string,
    type: string,
    [key: string]: any
  }
  resource: {
    src: string,
    loader: string,
    [key: string]: any
  }
  [key: string]: any
}