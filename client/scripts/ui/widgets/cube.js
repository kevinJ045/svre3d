import React from "react";
import { mixColors } from "../../common/colors.js";
export const Cube = ({ color = '#09d0d0', gloom = false, inline = false, size = 40, x = 0, y = 0, z = 0 }) => {
    return React.createElement("div", { className: "cube " + (gloom ? 'gloom' : ''), style: {
            '--color': color,
            '--color-2': mixColors(color, '#000000', 0.3),
            '--x': x ? x + 'px ' : size + 'px',
            '--y': y ? y + 'px ' : size + 'px',
            '--z': z ? z + 'px ' : size + 'px',
            'display': inline ? 'inline-block' : 'block',
            margin: inline ? '-30px 5px 0 5px' : null
        } },
        React.createElement("div", { className: "cube-face cube-top" }),
        React.createElement("div", { className: "cube-face cube-bottom" }),
        React.createElement("div", { className: "cube-face cube-left" }),
        React.createElement("div", { className: "cube-face cube-right" + (gloom ? ' gloom-face' : '') }),
        React.createElement("div", { className: "cube-face cube-front" }),
        React.createElement("div", { className: "cube-face cube-back" }));
};
