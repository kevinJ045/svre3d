import * as React from "react";
import { parseVariable } from "../../common/stringparse.js";
import { UIResources } from "../misc/uires.js";
const elements = {
    text: ({ widget, children, variables }) => React.createElement("div", { className: "text" },
        parseVariable(widget.text, variables),
        children),
    bar: ({ widget, children, variables }) => React.createElement("div", { className: "hud-bar", style: {
            '--width': Math.min(Math.max(parseFloat(parseVariable(widget.bar.current, variables)) / parseFloat(parseVariable(widget.bar.max, variables)) * 100, 0), 100) + '%',
            '--background': widget.bar.color ? parseVariable(widget.bar.color, variables) : '#70c70d',
            'width': parseVariable(widget.bar.width, variables) || '200px'
        } }, children),
    normal: ({ children, widget }) => React.createElement("div", { style: {
            ...(widget.style || {})
        }, className: widget.class || "" }, children)
};
const widgetChildren = (widget) => {
    return (widget.widgets || [])
        .concat(widget.children ? UIResources.parent(widget.children).map(i => i.ui) : []);
};
export const JSONUIWidget = ({ json, variables }) => {
    const renderWidget = (widget) => {
        const Element = elements[widget.type] || elements['normal'];
        return React.createElement(Element, { variables: variables, key: Math.random(), widget: widget }, widgetChildren(widget).map((childWidget, index) => (React.createElement(React.Fragment, { key: index }, renderWidget(childWidget)))));
    };
    return React.createElement("div", null, renderWidget(json));
};
