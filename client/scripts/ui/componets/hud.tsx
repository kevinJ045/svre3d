import * as React from "react";
import { ResourceMap } from "../../repositories/resources";
import { JSONUIWidget } from "../widgets/jsonui";
import { UIResources } from "../misc/uires";
import { Root } from "react-dom/client";
import { UISelectedItem, UIVariables } from "../misc/variables";
import { PlayerInfo } from "../../repositories/player";

export const HUD = () => {
        
    let [variables, setVariables] = React.useState(UIVariables());

    React.useEffect(() => {
        PlayerInfo?.entity
            .on('health', () => setVariables(UIVariables()));
        UISelectedItem
            .addEventListener('select', () => setVariables(UIVariables()));
    }, []);

    return (
        <>
            {UIResources
                .parent('hud')
                .map((i, ind) => (
                    <JSONUIWidget variables={variables} key={ind} json={i}></JSONUIWidget>
                ))}
            <div className="hud-top-left" style={{
                display: variables.selectedItem ? 'block' : 'none'
            }}>
                {
                    variables.selectedItem ? (
                        <div>
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