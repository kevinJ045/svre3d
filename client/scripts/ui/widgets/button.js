import React from "react";
import { mixColors } from "../../common/colors.js";
export const Button = ({ children, color = '#f0003c', onClick = () => { } }) => {
    return (React.createElement("button", { onClick: onClick, style: {
            "--edge-color-middle": mixColors(color, '#000000', 0.3),
            "--edge-color-end": mixColors(color, '#000000', 0.5),
            "--front-bg-color": color,
        }, className: "login-button-pushable", role: "button" },
        React.createElement("span", { className: "login-button-shadow" }),
        React.createElement("span", { className: "login-button-edge" }),
        React.createElement("span", { className: "login-button-front text" }, children)));
};
