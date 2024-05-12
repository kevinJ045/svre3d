import { Root, createRoot } from "react-dom/client";
import { Menu } from "./componets/menu.js";
import * as React from "react";
import { Map2D } from "./misc/map.js";
import { HUDUi } from "./componets/hud.js";
import { MainUI } from "./componets/provider.js";
import ChatsUI from "./chats/chats.tsx";
import { Context } from "./data/context.ts";

export default class UI {

	static root: Root;
	static hudRoot: Root;

	static init(){
		this.root = createRoot(document.querySelector('#full-ui')!);
		this.root.render(<MainUI>
			<Menu></Menu>
			<HUDUi></HUDUi>
			<div onClick={() => UI.show()} className="menu-button"></div>
		</MainUI>);
	}

	static toggle(){
		document.querySelector('#full-menu')?.classList.toggle('active');
	}

	static show(){
		document.querySelector('#full-menu')?.classList.add('active');
	}

	static hide(){
		document.querySelector('#full-menu')?.classList.remove('active');
	}

	static update(){
		Map2D.update();
	}

}