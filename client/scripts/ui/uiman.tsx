import { Root, createRoot } from "react-dom/client";
import { Menu } from "./componets/menu.js";
import * as React from "react";
import { Map2D } from "./misc/map.js";
import { HUDUi } from "./componets/hud.js";
import { MainUI } from "./componets/provider.js";
import ChatsUI from "./chats/chats.tsx";
import { Context } from "./data/context.ts";
import { ToggleButton } from "./widgets/toggle.tsx";

export default class UI {

	static root: Root;
	static hudRoot: Root;

	static init(){
		this.root = createRoot(document.querySelector('#full-ui')!);
		this.root.render(<MainUI>
			<Menu></Menu>
			<HUDUi></HUDUi>
			<ToggleButton click={() => UI.toggle()}></ToggleButton>
		</MainUI>);
	}

	static toggle(){
		document.querySelector('#full-menu')?.classList.toggle('active');
		document.querySelector('#menu-button')?.classList.toggle('menu-open');
	}

	static show(){
		document.querySelector('#full-menu')?.classList.add('active');
		document.querySelector('#menu-button')?.classList.add('menu-open');
	}

	static hide(){
		document.querySelector('#full-menu')?.classList.remove('active');
		document.querySelector('#menu-button')?.classList.remove('menu-open');
	}

	static update(){
		Map2D.update();
	}

}