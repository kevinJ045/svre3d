import React from "react";
import { mixColors } from "../../common/colors.ts";


export const Cube = ({ color = '#09d0d0', gloom = false, inline = false, size = 40 }) => {
  return <div className={"cube "+ (gloom ? 'gloom' : '')} style={{
    '--color': color,
    '--color-2': mixColors(color, '#000000', 0.3),
    '--width': size+'px',
    '--height': size+'px',
    'display': inline ? 'inline-block' : 'block',
    margin: inline ? '-30px 5px 0 5px' : null
  } as React.CSSProperties}>
    <div className="cube-face cube-top"></div>
    <div className="cube-face cube-bottom"></div>
    <div className="cube-face cube-left"></div>
    <div className={"cube-face cube-right" + (gloom ? ' gloom-face' : '')}></div>
    <div className="cube-face cube-front"></div>
    <div className="cube-face cube-back"></div>
  </div>
}