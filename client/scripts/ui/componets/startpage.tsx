import * as React from "react";
import { BGLogin } from "../widgets/bgl";

export function StartPage({ start }){
  const startGame = () => {
    start();
  }
  return <>
        <BGLogin></BGLogin>
        <div className="menu">
        <div className="startbutton" onClick={startGame}>
          Start
        </div>
      </div>
    </>
}