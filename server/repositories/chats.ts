import { pingFrom } from "../ping/ping.ts";
import * as uuid from 'uuid';


export class Chats {

  static startPing(socket){
    pingFrom(socket, 'chat:send', async (data: {chatid: string, message: string, reply?: string, username: string}) => {
      if(!data) return;
      const msg = {
        chatid: data.chatid || 'public',
        message: {
          text: data.message,
          id: uuid.v4()
        },
        reply: data.reply,
        time: Date.now(),
        username: data.username
      };
      socket.emit('chat:send', msg);
      socket.broadcast.emit('chat:send', msg);
    });
  }

}