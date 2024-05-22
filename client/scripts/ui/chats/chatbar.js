import React, { useContext, useState } from "react";
import { Context } from "../data/context.js";
import { ping } from "../../socket/socket.js";
import { PlayerInfo } from "../../repositories/player.js";
export const ChatBar = () => {
    const [messageText, setMessageText] = useState('');
    const { chats } = useContext(Context);
    const sendMessage = () => {
        const msg = messageText.trim();
        if (!msg)
            return void 0;
        setMessageText('');
        ping('chat:send', {
            message: msg,
            username: PlayerInfo.username
        });
    };
    return React.createElement("div", { className: "chatbar" },
        React.createElement("div", { className: "messages" }, chats.map((chat, index) => (React.createElement("div", { key: index, className: "message" },
            React.createElement("div", { className: "title", onClick: (e) => document.getElementById('messageText')?.focus() || setMessageText(t => t + '@' + chat.username + ' '), title: chat.username }, chat.username),
            React.createElement("div", { className: "content" }, chat.message.text.split(' ').map(i => i.startsWith('@') ? React.createElement("a", { href: "#" + i.split('@')[1], className: "username" },
                i,
                " ")
                : i + ' ')))))),
        React.createElement("div", { className: "messagebar" },
            React.createElement("input", { type: "text", className: "messagetext", id: "messageText", value: messageText, onChange: (e) => setMessageText(e.target.value), onKeyDown: (e) => e.key == 'Enter' && !e.shiftKey ? sendMessage() : '' })));
};
