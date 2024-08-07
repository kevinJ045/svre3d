import * as React from "react";
import { parseVariable } from "../../common/stringparse.js";
import { UISelectedItem, UIVariables } from "../misc/variables.js";
import { UIResources } from "../misc/uires.js";
import { PlayerInfo } from "../../repositories/player.js";

const elements: Record<string, React.ElementType> = {
    text: ({ widget, children, variables }) => <div className="text">{parseVariable(widget.text, variables)}{children}</div>,
    span: ({ widget, children, variables }) => <span className={widget.class ? parseVariable(widget.class, variables) : ''}>{parseVariable(widget.text, variables)}{children}</span>,
    bar: ({ widget, children, variables }) => <div
        className={""+(widget.class || '')}
        style={{
            '--active': 
            Math.min(Math.max(parseFloat(parseVariable(widget.bar.current, variables)) / parseFloat(parseVariable(widget.bar.max, variables)) * 100, 0), 100) + '%',
            '--accent':
            widget.bar.color ? parseVariable(widget.bar.color, variables) : '#70c70d',
        } as React.CSSProperties}
    ><div className="inner"></div>{children}</div>,
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