import React, { useContext, useState } from "react"
import { Context } from "../data/context.js";
import GlobalEmitter from "../../misc/globalEmitter.ts";
import { ping } from "../../socket/socket.ts";
import { PlayerInfo } from "../../repositories/player.ts";

export const ChatBar = () => {
  const [messageText, setMessageText] = useState('');

  const {
    chats
  } = useContext(Context);

  const sendMessage = () => {
    const msg = messageText.trim();
    if(!msg) return void 0;
    setMessageText('');
    ping('chat:send', {
      message: msg,
      username: PlayerInfo.username
    });
  };

  return <div className="chatbar">
    <div className="messages">
      {
        chats.map((chat, index) => (
          <div key={index} className="message">
            <div className="title" onClick={(e) => document.getElementById('messageText')?.focus() || setMessageText(t => t + '@' + chat.username+' ')} title={chat.username}>{chat.username}</div>
            <div className="content">{
              chat.message.text.split(' ').map(i => 
                i.startsWith('@') ? <a href={"#"+i.split('@')[1]} className="username">{i} </a>
                : i
              )
            }</div>
          </div>
        ))
      }
    </div>
    <div className="messagebar">
      <input type="text" className="messagetext" id="messageText"
       value={messageText} onChange={(e) => setMessageText(e.target.value)}
       onKeyDown={(e) => e.key == 'Enter' && !e.shiftKey ? sendMessage() : ''}/>
    </div>
  </div>
}