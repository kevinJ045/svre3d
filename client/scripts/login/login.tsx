import { createRoot } from "react-dom/client";
import * as React from "react";
import LoginForm from "./form.js";
import { LocalDB } from "../localdb/localdb.js";


export class Login {

	static init(S: any, types: any[]){

		const roote = document.createElement('div');
		document.querySelector('body')!.appendChild(roote);

		const root = createRoot(roote);

		root.render(<LoginForm types={types} onSubmit={({username, password, variant, email, register}, setRegister, setError) => {
			
			if(register){
				S.emit('register', { username, password, variant, email }, (success) => {
					if(success) location.reload();
					else setError('Something went wrong');
				});
			} else S.emit('login', { username, password }, (token) => {
				if(token){
					if(token == 'wrong'){
						setError('Password or username wrong');
					} else {
						LocalDB.cookie.set('token', token);
						location.reload();
					}
				} else {
					setRegister(true);
				}
			});
		}}></LoginForm>)

	}

}