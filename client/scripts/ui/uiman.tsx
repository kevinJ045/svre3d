import ReactDOM from "react-dom";
import { Menu } from "./componets/menu";
import * as React from "react";

export default class UI {

	static init(){
		ReactDOM.render(<Menu></Menu>, document.querySelector('#full-menu'));
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

}