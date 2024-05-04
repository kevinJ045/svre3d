import { createRoot } from "react-dom/client";
import * as React from "react";
import LoginForm from "./form.js";
import { LocalDB } from "../localdb/localdb.js";


export class Login {

	static init(S: any){

		const roote = document.createElement('div');
		document.querySelector('body')!.appendChild(roote);

		const root = createRoot(roote);

		root.render(<LoginForm onSubmit={(username, password) => {
			S.emit('login', { username, password }, (token) => {
				LocalDB.cookie.set('token', token);
				location.reload();
			});
		}}></LoginForm>)

	}

}