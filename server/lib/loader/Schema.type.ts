export type ResourceSchema = {
  manifest: {
    id: string,
    type: string
  }
  resource: {
    src: string,
    loader: string,
    [key: string]: any
  }
  [key: string]: any
}