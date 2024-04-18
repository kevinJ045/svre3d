import * as React from "react";
import { parseVariable } from "../../common/stringparse";
import { UIVariables } from "../misc/variables";
import { UIResources } from "../misc/uires";

const elements: Record<string, React.ElementType> = {
    text: ({ widget, children }) => <div className="text">{parseVariable(widget.text, UIVariables)}{children}</div>,
    bar: ({ widget, children }) => <div
        className="hud-bar"
        style={{
            '--width': 
            Math.min(Math.max(parseFloat(parseVariable(widget.bar.current, UIVariables)) / parseFloat(parseVariable(widget.bar.max, UIVariables)) * 100, 0), 100) + '%',
            '--background':
            widget.bar.color ? parseVariable(widget.bar.color, UIVariables) : '#70c70d',
            'width': 
            parseVariable(widget.bar.width, UIVariables) || '200px'
        } as React.CSSProperties}
    >{children}</div>,
    normal: ({ children, widget }) => <div style={
        {
            ...(widget.style || {})
        }
    } className={
        widget.class || ""
    }>{children}</div>
}

const widgetChildren = (widget) => {
    return (widget.widgets || [])
    .concat(
        widget.children ? UIResources.parent(widget.children) : []
    );
}

export const JSONUIWidget = ({
    json
}) => {
    console.log(json);
    const renderWidget = (widget) => {
        const Element = elements[widget.type] || elements['normal'];
        return <Element key={widget.type} widget={widget}>
            {widgetChildren(widget).map((childWidget, index) => (
              <React.Fragment key={index}>{renderWidget(childWidget)}</React.Fragment>
            ))}
        </Element>
    };
    
    return <div>{renderWidget(json)}</div>;
}