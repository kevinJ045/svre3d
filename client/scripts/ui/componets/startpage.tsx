import * as React from "react";
import { BGLogin } from "../widgets/bgl";
import { BGStars } from "../widgets/bgs";
import { Cube } from "../widgets/cube";
import LoginForm from "../../login/form";
import { LocalDB } from "../../localdb/localdb";
import { S } from "../../socket/socket";
let f = 0;
export function StartPage({ start }) {
  const [currentPage, setCurentPage] = React.useState('game');
  const startGame = () => {
    start((page: string) => setCurentPage(page));
  }
  if(!f){
    f = 1;
    startGame();
  }
  return currentPage == 'start' || currentPage == 'login' ? <div id="startpage">
    {
      (currentPage == 'start' || currentPage == 'login') && <div>
        <BGLogin></BGLogin>
        <BGStars></BGStars>
      </div>
    }
    {
      currentPage == 'start' && <>
        <div className="start-button" onClick={startGame}>
          <Cube gloom={true} size={30} color='#09D0D0'></Cube>
          <span>Start</span>
        </div>
      </>
    }
    {
      currentPage == 'login' && <>
        <LoginForm types={(window as any)._biomes} onSubmit={({username, password, variant, email, register}, setRegister, setError) => {
			
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
        }}></LoginForm>
      </>
    }
  </div> : <></>
}