import { pingFrom } from "../ping/ping.ts";
import * as uuid from 'uuid';
import Commands from "./commands.ts";
import { Sockets } from "../ping/sockets.ts";
import { Entities } from "./entities.ts";

export type ChatMessage = {chatid: string, message: string, reply?: string, username: string};
export class Chats {

  static lookUpCommands(text: string, data: ChatMessage){
    if(text.startsWith('/')){
      const commandTokens = text.replace('/', '').split(' ');
      const command = commandTokens.shift()!;

      if(Commands.has(command)){
        Commands.execute(command, commandTokens, {
          reply: (text: string) => {
            Sockets.emit('chat:send', this.prepareMessage({
              chatid: data.chatid,
              message: text,
              username: 'Server'
            }));
          },
          username: data.username,
          playerEntity: Entities.entities.find(e => e.data.username == data.username)
        });
      }
    } else {}
  }

  static prepareMessage(data: ChatMessage){
    return {
      chatid: data.chatid || 'public',
      message: {
        text: data.message,
        id: uuid.v4()
      },
      reply: data.reply,
      time: Date.now(),
      username: data.username
    };
  }

  static startPing(socket){
    pingFrom(socket, 'chat:send', async (data: ChatMessage) => {
      if(!data) return;
      const msg = Chats.prepareMessage(data);
      socket.emit('chat:send', msg);
      socket.broadcast.emit('chat:send', msg);

      Chats.lookUpCommands(data.message, data);
    });
  }

}