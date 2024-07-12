import React from "react";
import { getColorName } from "../../data/color";

export function ColorName({color}){
  return <span className="color-text" style={{ color }}>
    <span className="color"></span>
    {
      getColorName(color)
    }
  </span>
}