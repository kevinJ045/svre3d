import { createRoot } from "react-dom/client";
import * as React from "react";
import LoginForm from "./form.js";
import { LocalDB } from "../localdb/localdb.js";


export class Login {

	static init(S: any, types: any[]){

		const roote = document.createElement('div');
		document.querySelector('body')!.appendChild(roote);

		const root = createRoot(roote);

		root.render(<LoginForm types={types} onSubmit={(username, password, setRegister) => {
			S.emit('login', { username, password }, (token) => {
				if(token){
					LocalDB.cookie.set('token', token);
					location.reload();
				} else {
					setRegister(true);
				}
			});
		}}></LoginForm>)

	}

}