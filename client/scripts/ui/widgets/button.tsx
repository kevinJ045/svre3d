import React, { CSSProperties } from "react";
import { mixColors } from "../../common/colors.js";

export const Button = ({
  children,
  color = '#f0003c',
  onClick = () => { }
}) => {
  return (
    <button onClick={onClick} style={{
      "--edge-color-middle": mixColors(color, '#000000', 0.3),
      "--edge-color-end": mixColors(color, '#000000', 0.5),
      "--front-bg-color": color,
    } as CSSProperties} className="login-button-pushable" role="button">
      <span className="login-button-shadow"></span>
      <span className="login-button-edge"></span>
      <span className="login-button-front text">
        {children}
      </span>
    </button>
  )
}
