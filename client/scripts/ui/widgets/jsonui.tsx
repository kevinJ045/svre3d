import * as React from "react";
import { parseVariable } from "../../common/stringparse.js";
import { UISelectedItem, UIVariables } from "../misc/variables.js";
import { UIResources } from "../misc/uires.js";
import { PlayerInfo } from "../../repositories/player.js";

const elements: Record<string, React.ElementType> = {
    text: ({ widget, children, variables }) => <div className="text">{parseVariable(widget.text, variables)}{children}</div>,
    bar: ({ widget, children, variables }) => <div
        className="hud-bar"
        style={{
            '--width': 
            Math.min(Math.max(parseFloat(parseVariable(widget.bar.current, variables)) / parseFloat(parseVariable(widget.bar.max, variables)) * 100, 0), 100) + '%',
            '--background':
            widget.bar.color ? parseVariable(widget.bar.color, variables) : '#70c70d',
            'width': 
            parseVariable(widget.bar.width, variables) || '200px'
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
        widget.children ? UIResources.parent(widget.children).map(i => i.ui) : []
    );
}

export const JSONUIWidget = ({
    json,
    variables
}) => {

    const renderWidget = (widget) => {
        const Element = elements[widget.type] || elements['normal'];
        return <Element variables={variables} key={Math.random()} widget={widget}>
            {widgetChildren(widget).map((childWidget, index) => (
              <React.Fragment key={index}>{renderWidget(childWidget)}</React.Fragment>
            ))}
        </Element>
    };
    
    return <div>{renderWidget(json)}</div>;
}