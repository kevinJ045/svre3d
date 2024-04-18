import * as React from "react";
import { ResourceMap } from "../../repositories/resources";
import { JSONUIWidget } from "../widgets/jsonui";
import { UIResources } from "../misc/uires";
import { Root } from "react-dom/client";


export const HUDUi = (root: Root) => {
    UIResources
        .parent('hud')
        .map((i, ind) => root.render(
            <JSONUIWidget key={ind} json={i}></JSONUIWidget>
        ))
}