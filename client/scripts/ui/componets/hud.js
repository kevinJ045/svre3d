import * as React from "react";
import { JSONUIWidget } from "../widgets/jsonui.js";
import { UIResources } from "../misc/uires.js";
import { UISelectedItem, UIVariables } from "../misc/variables.js";
import { PlayerInfo } from "../../repositories/player.js";
export const HUD = () => {
    let [variables, setVariables] = React.useState(UIVariables());
    React.useEffect(() => {
        PlayerInfo?.entity
            ?.on('health', () => setVariables(UIVariables()));
        UISelectedItem
            .addEventListener('select', () => setVariables(UIVariables()));
    }, []);
    return (React.createElement(React.Fragment, null,
        UIResources
            .parent('hud')
            .map((i, ind) => (React.createElement(JSONUIWidget, { variables: variables, key: 'null', json: { ...i.ui } }))),
        React.createElement("div", { className: "hud-top-left", style: {
                display: variables.selectedItem ? 'block' : 'none'
            } }, variables.selectedItem ? (React.createElement("div", null,
            React.createElement("div", { className: "title" },
                variables.selectedItem.type == 'entity' ?
                    React.createElement("div", { className: "preview-entity", style: {
                            '--color': '#00ff00'
                        } })
                    :
                        React.createElement("div", { className: "preview-chunk", style: {
                                '--color': variables.selectedItem.chunk.biome.map.color
                            } }),
                variables.selectedItem.type == 'entity' ?
                    variables.selectedItem.entity.name || 'Entity'
                    :
                        'Chunk'),
            variables.selectedItem.type == 'entity' ?
                React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "hud-bar", style: {
                            '--width': Math.min(Math.max(variables.selectedItem.entity.health.current / variables.selectedItem.entity.health.max * 100, 0), 100) + '%',
                            '--background': '#70c70d',
                            'width': '100%'
                        } },
                        variables.selectedItem.entity.health.current,
                        "/",
                        variables.selectedItem.entity.health.max),
                    React.createElement("div", { className: "space-10" }),
                    React.createElement("div", { className: "hud-bar", style: {
                            '--width': Math.min(Math.max(variables.selectedItem.entity.exp.current / variables.selectedItem.entity.exp.max * 100, 0), 100) + '%',
                            '--background': '#09d0d0',
                            'width': '100%'
                        } },
                        "Level ",
                        variables.selectedItem.entity.exp.level))
                : null)) : null)));
};
export const HUDUi = () => React.createElement(HUD, null);
