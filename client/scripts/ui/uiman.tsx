import { Root, createRoot } from "react-dom/client";
import { Menu } from "./componets/menu";
import * as React from "react";
import { Map2D } from "./misc/map";
import { HUDUi } from "./componets/hud";

export default class UI {

	static root: Root;
	static hudRoot: Root;

	static init(){
		this.root = createRoot(document.querySelector('#full-menu')!);
		this.hudRoot = createRoot(document.querySelector('#full-hud')!);
		this.root.render(<div>
			<Menu></Menu>
		</div>);
		HUDUi(this.hudRoot);
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