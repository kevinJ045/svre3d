import * as React from "react";
import { ResourceMap } from "../../repositories/resources.js";
import { JSONUIWidget } from "../widgets/jsonui.js";
import { UIResources } from "../misc/uires.js";
import { Root } from "react-dom/client";
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

    return (
        <>
            {UIResources
                .parent('hud')
                .map((i, ind) => (
                    <JSONUIWidget variables={variables} key={'null'} json={{...i}}></JSONUIWidget>
                ))}
            <div className="hud-top-left" style={{
                display: variables.selectedItem ? 'block' : 'none'
            }}>
                {
                    variables.selectedItem ? (
                        <div>
                            
                            <div className="title">
                                {
                                    variables.selectedItem.type == 'entity' ?
                                    <div className="preview-entity" style={{
                                        '--color': '#00ff00'
                                    } as any}></div>
                                    :
                                    <div className="preview-chunk" style={{
                                        '--color': variables.selectedItem.chunk.biome.map.color
                                    } as any}></div>
                                }
                                {
                                    variables.selectedItem.type == 'entity' ?
                                    variables.selectedItem.entity.name || 'Entity'
                                    :
                                    'Chunk'
                                }
                            </div>
                            { variables.selectedItem.type == 'entity' ? 
                            <>  
                                <div
                                    className="hud-bar"
                                    style={{
                                        '--width': 
                                        Math.min(Math.max(variables.selectedItem.entity.health.current / variables.selectedItem.entity.health.max * 100, 0), 100) + '%',
                                        '--background': '#70c70d',
                                        'width': '100%'
                                    } as React.CSSProperties}
                                >{variables.selectedItem.entity.health.current}/{variables.selectedItem.entity.health.max}</div>
                                <div className="space-10"></div>
                                <div
                                    className="hud-bar"
                                    style={{
                                        '--width': 
                                        Math.min(Math.max(variables.selectedItem.entity.exp.current / variables.selectedItem.entity.exp.max * 100, 0), 100) + '%',
                                        '--background': '#09d0d0',
                                        'width': '100%'
                                    } as React.CSSProperties}
                                >Level {variables.selectedItem.entity.exp.level}</div>
                            </>
                            : null}
                        </div>
                    ) : null
                }
            </div>
        </>
    )
}

export const HUDUi = (root: Root) => {
    
    
    root.render(
        <HUD></HUD>
    )
}