import React from "react";
import { ChatBar } from "./chatbar.js";
export default class ChatsUI {
    static init() {
        return React.createElement(ChatBar, null);
    }
}
