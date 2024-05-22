import React from "react";
import { Root } from "react-dom/client";
import { ChatBar } from "./chatbar.js";



export default class ChatsUI {
  static init(){
    return <ChatBar></ChatBar>
  }
}