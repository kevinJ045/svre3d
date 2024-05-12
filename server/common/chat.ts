

export interface Chat {
  message: {
    text: string,
    id: string
  },
  time: number,
  chatid: string,
  reply?: string,
  username: string
}