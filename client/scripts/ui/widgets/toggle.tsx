import React, { useContext } from "react";
import { Context } from "../data/context.js";



export const ToggleButton = ({
  click = () => { }
}) => {

  const {
    tab
  } = useContext(Context);

  return (
    <div id="menu-button" onClick={() => click()} className={"menu-button " + (document.querySelector('#full-menu')?.classList.contains('active') ? 'menu-open ' : '') + ' ' + tab + '-icon'}></div>
  )
}
