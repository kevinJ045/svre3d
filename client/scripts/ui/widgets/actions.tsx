import { Item } from "../../models/item"
import * as React from "react";
import { Equipments } from "../../repositories/equipments";
import { PlayerInfo } from "../../repositories/player";



export const ItemActions = (
    { item } :
    { item: Item }
) => {

    const handleWearToggle = () => {
        if(item?.data.wid){
            Equipments.unequip(PlayerInfo.entity, item?.reference!.equipment!.type!, item);
        } else {
            Equipments.equip(PlayerInfo.entity, item?.reference!.equipment!.type!, item);
        }
    };

    const handleDrop = () => {
        
    };

    return (
        <div className="item-actions">
            {item.reference.equipment && (
                <button onClick={handleWearToggle}>
                    {item?.data.wid ? "Unwear" : "Wear"}
                </button>
            )}
            <button onClick={handleDrop}>Drop</button>
        </div>
    );
}
